import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { marked } from 'marked';
import { AiChatService } from '../../../views/ai-chat/ai-chat.service';

interface Conversation {
  id: number;
  title: string;
  date: string;
  createdAt?: string;
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
  selector: 'app-mcp-chat-bot',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './mcp-chat-bot.component.html',
  styleUrl: './mcp-chat-bot.component.css'
})
export class McpChatBotComponent {

  @ViewChild('messageTextarea') messageTextarea!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  isOpen: boolean = false; // Is the chat widget open?
  showHistory: boolean = false; // Are we looking at the history list?
  isExpanded: boolean = false; // Optional: Maximize to full screen

  message: string = '';
  messages: ChatMessage[] = [];
  isLoading: boolean = false;

  conversations: Conversation[] = [];
  activeConversation: Conversation | null = null;
  conversationGroups: { [key: string]: Conversation[] } = {};

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

  // --- UI Toggles ---
  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  toggleHistoryView(): void {
    this.showHistory = !this.showHistory;
  }

  expandWidget(): void {
    this.isExpanded = !this.isExpanded;
  }

  // --- Logic (Kept mostly the same, just adapted) ---

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
        this.conversations.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
        this.groupConversations();
      },
      (error: any) => console.error('Error fetching history', error)
    );
  }

  selectConversation(conversation: Conversation): void {
    this.activeConversation = conversation;
    this.messages = [];
    this.isLoading = true;
    this.showHistory = false; // Close history view to show chat

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
        console.error(error);
        this.isLoading = false;
      }
    );
  }

  createNewChat(): void {
    this.messages = [];
    this.activeConversation = null;
    this.showHistory = false;
  }

  async sendMessage(): Promise<void> {
    if (this.message.trim() && !this.isLoading) {
      const userText = this.message.trim();

      this.messages.push({
        text: userText,
        htmlContent: this.sanitizer.bypassSecurityTrustHtml(userText.replace(/\n/g, '<br>')),
        sender: 'user',
        timestamp: new Date()
      });

      this.message = '';
      this.scrollToBottom();
      this.isLoading = true;

      const currentChatId = this.activeConversation ? this.activeConversation.id : null;

      this.chatService.sendMessage(userText, currentChatId).subscribe({
        next: async (response) => {
          const data = response.data;

          // If new conversation, add to history list in background
          if (!this.activeConversation && data.conversationId) {
            const newConv: Conversation = {
              id: data.conversationId,
              title: userText.substring(0, 30) + '...',
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
          this.messages.push({
            text: "Error",
            htmlContent: this.sanitizer.bypassSecurityTrustHtml('<span class="text-red-500">Failed to connect.</span>'),
            sender: 'ai',
            timestamp: new Date()
          });
          this.isLoading = false;
        }
      });
    }
  }

  // Helpers
  handleQuickAction(action: QuickAction): void {
    this.message = action.title + " ";
    if (this.messageTextarea) this.messageTextarea.nativeElement.focus();
  }

  handleKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  groupConversations(): void {
    this.conversationGroups = this.conversations.reduce((groups, conversation) => {
      const group = conversation.date;
      if (!groups[group]) groups[group] = [];
      groups[group].push(conversation);
      return groups;
    }, {} as { [key: string]: Conversation[] });
  }

  getGroupKeys(): string[] { return Object.keys(this.conversationGroups); }

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
    if (date.toDateString() === today.toDateString()) return 'Today';
    return 'Previous';
  }
}
