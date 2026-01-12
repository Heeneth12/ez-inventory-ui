import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AiChatService } from './ai-chat.service';
import { marked } from 'marked';

interface Conversation {
  id: number;
  title: string;
  date: string; // Used for grouping
  createdAt?: string; // Raw date from DB
}

interface QuickAction {
  id: number;
  icon: string;
  title: string;
  description: string;
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
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './ai-chat.component.html',
  styleUrls: ['./ai-chat.component.css'],
  providers: [AiChatService]
})
export class AiChatComponent implements OnInit {
  @ViewChild('messageTextarea') messageTextarea!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  message: string = '';
  messages: ChatMessage[] = [];
  isLoading: boolean = false;

  conversations: Conversation[] = [];
  activeConversation: Conversation | null = null;
  showSidebar: boolean = true;
  conversationGroups: { [key: string]: Conversation[] } = {};

  // ADDED THIS: Data for the "Quick Actions" buttons in your HTML
  quickActions: QuickAction[] = [
    { id: 1, icon: '📦', title: 'Check Stock', description: 'Check inventory levels' },
    { id: 2, icon: '📄', title: 'Create Invoice', description: 'Generate a new sale' },
    { id: 3, icon: '📊', title: 'Sales Report', description: 'Summary of recent sales' },
    { id: 4, icon: '🔍', title: 'Find Item', description: 'Search product details' }
  ];

  constructor(
    private chatService: AiChatService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.loadHistory();
  }

  // --- 1. Load History from Java Backend ---
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

        // Sort by newest first
        this.conversations.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());

        this.groupConversations();
      },
      (error: any) => {
        console.error('Error fetching history', error);
      }
    );
  }

  // --- 2. Load Specific Conversation ---
  selectConversation(conversation: Conversation): void {
    this.activeConversation = conversation;
    this.messages = [];
    this.isLoading = true;

    // On mobile, close sidebar when a chat is selected
    if (window.innerWidth < 768) {
        this.showSidebar = false;
    }

    this.chatService.getMessages(conversation.id,
      async (response: any) => {
        const rawMessages = response.data || [];

        const processedMessages: ChatMessage[] = [];

        for (const msg of rawMessages) {
          const parsed = await marked.parse(msg.content);
          processedMessages.push({
            text: msg.content,
            htmlContent: this.sanitizer.bypassSecurityTrustHtml(parsed),
            sender: msg.sender,
            timestamp: new Date(msg.timestamp)
          });
        }

        this.messages = processedMessages;
        this.isLoading = false;
        this.scrollToBottom();
      },
      (error: any) => {
        console.error('Error fetching messages', error);
        this.isLoading = false;
      }
    );
  }

  // --- 3. Send Message ---
  async sendMessage(): Promise<void> {
    if (this.message.trim() && !this.isLoading) {
      const userText = this.message.trim();

      // Optimistic UI Update
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

      const currentChatId = this.activeConversation ? this.activeConversation.id : null;

      this.chatService.sendMessage(userText, currentChatId).subscribe({
        next: async (response) => {
          const data = response.data; // Access data from ResponseResource

          // New Chat Created? Add to Sidebar
          if (!this.activeConversation && data.conversationId) {
            const newConv: Conversation = {
              id: data.conversationId,
              title: userText.substring(0, 30) + (userText.length > 30 ? '...' : ''),
              date: 'Today',
              createdAt: new Date().toISOString()
            };
            this.activeConversation = newConv;
            this.conversations.unshift(newConv);
            this.groupConversations();
          }

          // Process AI Response (Markdown -> HTML)
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
            text: "Error connecting.",
            htmlContent: this.sanitizer.bypassSecurityTrustHtml('<span class="text-red-500">Connection failed.</span>'),
            sender: 'ai',
            timestamp: new Date()
          });
          this.isLoading = false;
          this.scrollToBottom();
        }
      });
    }
  }

  // --- Helper Methods ---

  groupConversations(): void {
    this.conversationGroups = this.conversations.reduce((groups, conversation) => {
      const group = conversation.date;
      if (!groups[group]) groups[group] = [];
      groups[group].push(conversation);
      return groups;
    }, {} as { [key: string]: Conversation[] });
  }

  getGroupKeys(): string[] {
    return Object.keys(this.conversationGroups);
  }

  createNewChat(): void {
    this.messages = [];
    this.activeConversation = null;
    // Keep sidebar open on desktop, maybe close on mobile
    if (window.innerWidth < 768) {
        this.showSidebar = false;
    }
  }

  toggleSidebar(): void {
    this.showSidebar = !this.showSidebar;
  }

  handleKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  handleQuickAction(action: QuickAction): void {
    // Just populates the textarea, user still clicks send
    this.message = action.title + " ";
    // Optional: Auto-focus textarea
    if (this.messageTextarea) this.messageTextarea.nativeElement.focus();
  }

  autoResizeTextarea(): void {
    if (this.messageTextarea) {
      const textarea = this.messageTextarea.nativeElement;
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  }

  onTextareaInput(): void { this.autoResizeTextarea(); }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
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
}