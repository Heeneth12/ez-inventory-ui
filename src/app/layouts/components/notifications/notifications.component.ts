import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'success' | 'warning';
  isRead: boolean;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html'
})
export class NotificationsComponent {
  filter = signal<'all' | 'unread'>('all');

  rawNotifications = signal<Notification[]>([
    { id: 1, title: 'Stock Alert', message: 'Low stock on Item #402 (Mechanical Keyboards). Please restock soon.', time: '2 mins ago', type: 'warning', isRead: false },
    { id: 2, title: 'New Order', message: 'Order #8829 has been successfully placed and is ready for fulfillment.', time: '1 hour ago', type: 'success', isRead: false },
    { id: 3, title: 'System Update', message: 'Version 2.4.0 is now live. New features added to the EZ-Inventory dashboard.', time: '5 hours ago', type: 'info', isRead: true },
  ]);

  notifications = computed(() => {
    const list = this.rawNotifications();
    return this.filter() === 'unread' ? list.filter(n => !n.isRead) : list;
  });

  unreadCount = computed(() => this.rawNotifications().filter(n => !n.isRead).length);

  markAsRead(id: number) {
    this.rawNotifications.update(list => 
      list.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  }

  deleteNotification(event: Event, id: number) {
    event.stopPropagation();
    this.rawNotifications.update(list => list.filter(n => n.id !== id));
  }

  markAllAsRead() {
    this.rawNotifications.update(list => list.map(n => ({ ...n, isRead: true })));
  }

  clearAll() {
    this.rawNotifications.set([]);
  }
}