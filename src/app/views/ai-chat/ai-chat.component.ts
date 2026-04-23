import { Component, OnInit, ViewChild, ElementRef, Input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AiChatService } from './ai-chat.service';
import { marked } from 'marked';
import { AuthService } from '../../layouts/guards/auth.service';
import { UserProfile } from '../../layouts/components/inventory-layout/inventory-layout.component';
import {
  LucideAngularModule,
  Sparkles, History, MoreHorizontal, Image, Mic, Send
} from 'lucide-angular';

interface Conversation {
  id: number;
  title: string;
  date: string;
  createdAt?: string;
}

interface QuickAction {
  id: number;
  icon: string | any;
  title: string;
  description?: string;
  prompt: string;
}

interface ChatMessage {
  text: string;
  htmlContent: SafeHtml;
  sender: 'user' | 'ai';
  timestamp: Date;
}

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, LucideAngularModule, RouterLink],
  templateUrl: './ai-chat.component.html',
  styleUrls: ['./ai-chat.component.css'],
  providers: [AiChatService]
})
export class AiChatComponent implements OnInit {
  @ViewChild('messageTextarea') messageTextarea!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  @Input() isSidebarMode: boolean = false;

  // Lucide Icons
  readonly Sparkles = Sparkles;
  readonly HistoryIcon = History;
  readonly MoreHorizontal = MoreHorizontal;
  readonly Image = Image;
  readonly Mic = Mic;
  readonly Send = Send;

  activeTab: 'chat' | 'automation' = 'chat';

  message: string = '';
  messages: ChatMessage[] = [];
  isLoading: boolean = false;

  conversations: Conversation[] = [];
  activeConversation: Conversation | null = null;
  conversationGroups: { [key: string]: Conversation[] } = {};

  // Full-screen layout state
  // Desktop (lg+): toggles the left sidebar panel
  showSidebar: boolean = true;

  // Mobile/tablet (below lg): toggles the slide-in history overlay
  showMobilePanel: boolean = false;

  // Sidebar-mode layout state
  // Sidebar mode: slides history panel over the chat
  showHistory: boolean = false;

  quickActions: QuickAction[] = [
    {
      id: 1,
      icon: '📦',
      title: 'Check stock levels',
      prompt: 'Can you check the current stock levels for our key items?',
      description: 'Get a quick summary of inventory.'
    },
    {
      id: 2,
      icon: '📊',
      title: 'Generate inventory report',
      prompt: 'Generate an inventory summary report for this week.',
      description: 'Detailed insights on your warehouse.'
    },
    {
      id: 3,
      icon: '🔮',
      title: 'Predict next month demand',
      prompt: 'Based on recent data, what is the expected demand for next month?',
      description: 'AI-driven forecasting.'
    }
  ];

  user: UserProfile = {
    name: 'Adam Driver',
    role: 'Fleet Manager',
    initials: 'AD',
    email: ''
  };

  get timeGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
  }

  constructor(
    private chatService: AiChatService,
    private sanitizer: DomSanitizer,
    private authService: AuthService,
    private router: Router
  ) { }

  @HostListener('window:resize')
  onResize() {
    // Close mobile panel if viewport grows past lg breakpoint (1024px)
    if (window.innerWidth >= 1024 && this.showMobilePanel) {
      this.showMobilePanel = false;
    }
  }

  ngOnInit(): void {
    this.loadHistory();

    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.user = {
          name: user.fullName,
          role: user.userRoles[0] || 'User',
          email: user.email,
          initials: 'AD'
        };
      }
    });
  }

  // Sidebar / panel controls 

  /** Desktop lg+: toggle the persistent left sidebar */
  toggleSidebar(): void {
    this.showSidebar = !this.showSidebar;
  }

  /** Mobile/tablet: open history slide-in overlay */
  openMobilePanel(): void {
    this.showMobilePanel = true;
  }

  /** Mobile/tablet: close history slide-in overlay */
  closeMobilePanel(): void {
    this.showMobilePanel = false;
  }


  loadHistory(): void {
    this.chatService.getHistory(
      (response: any) => {
        const rawList = response.data || [];
        this.conversations = rawList.map((c: any) => ({
          id: c.id,
          title: c.title || 'Untitled Chat',
          date: this.formatDateGroup(c.createdAt),
          createdAt: c.createdAt
        }));
        this.conversations.sort(
          (a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
        );
        this.groupConversations();
      },
      (error: any) => { console.error('Error fetching history', error); }
    );
  }

  selectConversation(conversation: Conversation): void {
    this.activeConversation = conversation;
    this.messages = [];
    this.isLoading = true;
    this.activeTab = 'chat';

    // Close any open panels
    this.showMobilePanel = false;
    this.showHistory = false;

    this.chatService.getMessages(
      conversation.id,
      async (response: any) => {
        const rawMessages = response.data || [];
        const processed: ChatMessage[] = [];
        for (const msg of rawMessages) {
          const parsed = await marked.parse(msg.content);
          processed.push({
            text: msg.content,
            htmlContent: this.sanitizer.bypassSecurityTrustHtml(parsed),
            sender: msg.sender,
            timestamp: new Date(msg.timestamp)
          });
        }
        this.messages = processed;
        this.isLoading = false;
        this.scrollToBottom();
      },
      (error: any) => {
        console.error('Error fetching messages', error);
        this.isLoading = false;
      }
    );
  }

  async sendMessage(): Promise<void> {
    if (!this.message.trim() || this.isLoading) return;

    const userText = this.message.trim();
    this.messages.push({
      text: userText,
      htmlContent: this.sanitizer.bypassSecurityTrustHtml(userText.replace(/\n/g, '<br>')),
      sender: 'user',
      timestamp: new Date()
    });

    this.message = '';
    this.autoResizeTextarea();
    this.scrollToBottom();
    this.isLoading = true;

    const currentChatId = this.activeConversation?.id ?? null;

    this.chatService.sendMessage(userText, currentChatId).subscribe({
      next: async (response) => {
        const data = response.data;

        if (!this.activeConversation && data.conversationId) {
          const newConv: Conversation = {
            id: data.conversationId,
            title: userText.substring(0, 35) + (userText.length > 35 ? '…' : ''),
            date: 'Today',
            createdAt: new Date().toISOString()
          };
          this.activeConversation = newConv;
          this.conversations.unshift(newConv);
          this.groupConversations();
        }

        const parsedHtml = await marked.parse(data.content);
        this.messages.push({
          text: data.content,
          htmlContent: this.sanitizer.bypassSecurityTrustHtml(parsedHtml),
          sender: 'ai',
          timestamp: new Date()
        });

        this.isLoading = false;
        this.scrollToBottom();
      },
      error: (error) => {
        console.error(error);
        this.messages.push({
          text: 'Connection failed.',
          htmlContent: this.sanitizer.bypassSecurityTrustHtml(
            '<span class="text-red-400">⚠ Could not connect to AI. Please try again.</span>'
          ),
          sender: 'ai',
          timestamp: new Date()
        });
        this.isLoading = false;
        this.scrollToBottom();
      }
    });
  }

  groupConversations(): void {
    this.conversationGroups = this.conversations.reduce((groups, conv) => {
      const g = conv.date;
      if (!groups[g]) groups[g] = [];
      groups[g].push(conv);
      return groups;
    }, {} as { [key: string]: Conversation[] });
  }

  getGroupKeys(): string[] {
    return Object.keys(this.conversationGroups);
  }

  createNewChat(): void {
    this.messages = [];
    this.activeConversation = null;
    this.activeTab = 'chat';
    this.showMobilePanel = false;
    this.showHistory = false;
  }

  setTab(tab: 'chat' | 'automation'): void {
    this.activeTab = tab;
  }

  handleKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  handleQuickAction(action: QuickAction): void {
    this.message = action.prompt;
    if (this.messageTextarea) {
      this.messageTextarea.nativeElement.focus();
      this.autoResizeTextarea();
    }
  }

  autoResizeTextarea(): void {
    if (this.messageTextarea) {
      const ta = this.messageTextarea.nativeElement;
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 180) + 'px';
    }
  }

  onTextareaInput(): void {
    this.autoResizeTextarea();
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop =
          this.scrollContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  private formatDateGroup(dateString?: string): string {
    if (!dateString) return 'Today';
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return 'Previous 30 Days';
  }


  handleChatClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const anchor = target.closest('a');

    if (anchor) {
      event.preventDefault();  // stop full page reload
      const href = anchor.getAttribute('href');
      if (href && href.startsWith('/')) {
        this.router.navigate([href]);  // use Angular router instead
      }
    }
  }
}