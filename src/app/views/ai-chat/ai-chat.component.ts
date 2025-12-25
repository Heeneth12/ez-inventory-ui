import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AiChatService } from './ai-chat.service';

interface Conversation {
  id: number;
  title: string;
  date: string;
  group?: string;
}

interface QuickAction {
  id: number;
  icon: string;
  title: string;
  description: string;
}

interface ChatMessage {
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './ai-chat.component.html',
  styleUrls: ['./ai-chat.component.css'],
  providers: [AiChatService] // Ensure service is provided
})
export class AiChatComponent implements OnInit {
  @ViewChild('messageTextarea') messageTextarea!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  message: string = '';
  // Stores the active chat history
  messages: ChatMessage[] = []; 
  isLoading: boolean = false;

  conversations: Conversation[] = [];
  activeConversation: Conversation | null = null;
  showSidebar: boolean = true;
  conversationGroups: { [key: string]: Conversation[] } = {};

  quickActions: QuickAction[] = [
    {
      id: 1,
      icon: '📦',
      title: 'Check Stock',
      description: 'Check inventory levels for specific items'
    },
    {
      id: 2,
      icon: '🧾',
      title: 'Create Invoice',
      description: 'Generate a new invoice for a customer'
    },
    {
      id: 3,
      icon: '🔍',
      title: 'List All Items',
      description: 'Get a comprehensive list of all inventory'
    },
    {
      id: 4,
      icon: '❓',
      title: 'Help',
      description: 'Ask about available commands'
    }
  ];

  constructor(private chatService: AiChatService) {}

  ngOnInit(): void {
    this.initializeConversations();
    this.groupConversations();
  }

  initializeConversations(): void {
    // ... (Your existing conversation mock data) ...
    this.conversations = [
      { id: 1, title: 'Invoice #102 Details', date: 'Today' },
      { id: 2, title: 'Stock Check: Laptops', date: 'Today' },
      // ... keep your other mock data
    ];
  }

  groupConversations(): void {
    this.conversationGroups = this.conversations.reduce((groups, conversation) => {
      const group = conversation.date;
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(conversation);
      return groups;
    }, {} as { [key: string]: Conversation[] });
  }

  getGroupKeys(): string[] {
    return Object.keys(this.conversationGroups);
  }

  createNewChat(): void {
    this.messages = []; // Clear current chat view
    this.activeConversation = null;
  }

  selectConversation(conversation: Conversation): void {
    this.activeConversation = conversation;
    // In a real app, you would fetch the message history for this conversation ID here
    // For now, we just clear it or show dummy data
    this.messages = []; 
  }

  toggleSidebar(): void {
    this.showSidebar = !this.showSidebar;
  }

  sendMessage(): void {
    if (this.message.trim() && !this.isLoading) {
      const userText = this.message.trim();
      
      // 1. Add User Message
      this.messages.push({
        text: userText,
        sender: 'user',
        timestamp: new Date()
      });

      this.message = '';
      this.autoResizeTextarea();
      this.scrollToBottom();
      this.isLoading = true;

      // 2. Call the MCP Backend
      this.chatService.sendMessage(userText).subscribe({
        next: (response) => {
          this.messages.push({
            text: response.reply,
            sender: 'ai',
            timestamp: new Date()
          });
          this.isLoading = false;
          this.scrollToBottom();
        },
        error: (error) => {
          console.error(error);
          this.messages.push({
            text: "Sorry, I couldn't connect to the inventory system. Is the backend running?",
            sender: 'ai',
            timestamp: new Date()
          });
          this.isLoading = false;
          this.scrollToBottom();
        }
      });
    }
  }

  handleAttach(): void { console.log('Attach file clicked'); }
  handleUploadImage(): void { console.log('Upload image clicked'); }

  autoResizeTextarea(): void {
    if (this.messageTextarea) {
      const textarea = this.messageTextarea.nativeElement;
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  }

  onTextareaInput(): void { this.autoResizeTextarea(); }

  handleQuickAction(action: QuickAction): void {
    this.message = action.title + " ";
    // Optional: Automatically send it
    // this.sendMessage(); 
  }

  handleKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }
}