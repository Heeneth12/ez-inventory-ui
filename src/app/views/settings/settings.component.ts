import { Component, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Interfaces for type safety
interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  bio: string;
  avatarUrl: string;
}

interface AppSettings {
  currency: string;
  dateFormat: string;
  lowStockThreshold: number;
  autoReorder: boolean;
  enableBarcodeScanning: boolean;
  theme: 'light' | 'dark' | 'system';
  density: 'compact' | 'comfortable';
}

interface NotificationSettings {
  emailAlerts: boolean;
  pushNotifications: boolean;
  weeklyDigest: boolean;
  lowStockAlerts: boolean;
  newOrderAlerts: boolean;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: `./settings.component.html`,
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {

  activeTab = signal('profile');
  
  tabs = [
    { id: 'profile', label: 'My details' },
    { id: 'general', label: 'Inventory' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'security', label: 'Password' }
  ];

  // State Signals
  isSaving = signal(false);
  showToast = signal(false);

  // Data Models
  profile = signal<UserProfile>({
    firstName: 'Mayad',
    lastName: 'Ahmed',
    email: 'mayadahmed@ofspace.co',
    role: 'Administrator',
    bio: '',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  });

  appSettings = signal<AppSettings>({
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    lowStockThreshold: 15,
    autoReorder: false,
    enableBarcodeScanning: true,
    theme: 'system',
    density: 'comfortable'
  });

  notifications = signal<NotificationSettings>({
    emailAlerts: true,
    pushNotifications: false,
    weeklyDigest: false,
    lowStockAlerts: true,
    newOrderAlerts: false
  });

  // Mock History Items
  historyItems: HistoryItem[] = [
    { id: '1', action: 'Low Stock Alert (SKU-102)', date: 'Apr 14, 2024', user: 'System', status: 'Pending' },
    { id: '2', action: 'Bulk Import', date: 'Jun 24, 2024', user: 'Mayad Ahmed', status: 'Failed' },
    { id: '3', action: 'Subscription Renewed', date: 'Feb 28, 2024', user: 'Billing', status: 'Completed' },
  ];

  // Helpers
  saveAll() {
    this.isSaving.set(true);
    setTimeout(() => {
      this.isSaving.set(false);
      this.showToast.set(true);
      setTimeout(() => this.showToast.set(false), 3000);
    }, 800);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-green-100 text-green-800'; // Matched image "Pending" color (Greenish)
      case 'Failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}


// Interfaces for type safety
interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  bio: string;
  avatarUrl: string;
}

interface AppSettings {
  currency: string;
  dateFormat: string;
  lowStockThreshold: number;
  autoReorder: boolean;
  enableBarcodeScanning: boolean;
  theme: 'light' | 'dark' | 'system';
  density: 'compact' | 'comfortable';
}

interface NotificationSettings {
  emailAlerts: boolean;
  pushNotifications: boolean;
  weeklyDigest: boolean;
  lowStockAlerts: boolean;
  newOrderAlerts: boolean;
}

// Mock data for the table view
interface HistoryItem {
  id: string;
  action: string;
  date: string;
  user: string;
  status: 'Completed' | 'Pending' | 'Failed';
}