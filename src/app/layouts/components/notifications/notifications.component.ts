import { Component, signal, computed, OnInit, OnDestroy, inject, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from './notification.service';
import { Observable, Subscription } from 'rxjs';
import { UserInitResponse } from '../../models/Init-response.model';
import { AuthService } from '../../guards/auth.service';
import { Notification } from './notification.model';
import { DrawerService } from '../drawer/drawerService';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html'
})
export class NotificationsComponent implements OnInit, OnDestroy {
  @ViewChild('notificationTemplate') notificationTemplate!: TemplateRef<any>;
  private notificationService = inject(NotificationService);
  private sub: Subscription = new Subscription();
  filter = signal<'all' | 'unread'>('all');
  rawNotifications = signal<Notification[]>([]);

  notifications = computed(() => {
    const list = this.rawNotifications();
    return this.filter() === 'unread' ? list.filter(n => !n.isRead) : list;
  });

  unreadCount = computed(() => this.rawNotifications().filter(n => !n.isRead).length);
  userData$: Observable<UserInitResponse | null>;

  constructor(
    private authSvs: AuthService,
    private drawerSvc: DrawerService
  ) {
    this.userData$ = this.authSvs.currentUser$;
  }

  ngOnInit() {
    const userSub = this.userData$.subscribe(user => {
      if (user) {
        console.log('Connecting to Notifications for:', user.fullName);
        const myUserId = user.userUuid; // Use UUID for security
        const myOrgId = String(user.tenantId); // Convert ID to string
        console.log('user UUID: ' + myUserId)
        const myGroupId = user.userRoles && user.userRoles.length > 0
          ? user.userRoles[0]
          : 'default-group';
        this.notificationService.connect(myUserId, myOrgId, myGroupId);
      }
    });
    const notifSub = this.notificationService.notifications$.subscribe(data => {
      this.rawNotifications.set(data);
    });
    this.sub.add(userSub);
    this.sub.add(notifSub);
  }

  ngOnDestroy() {
    this.sub.unsubscribe(); // Unsubscribes from everything at once
  }

  openNotificationTemplate() {
    if (!this.notificationTemplate) return;

    this.drawerSvc.openTemplate(
      this.notificationTemplate,
      'Notifications',
      'md'
    );
  }

  close() {
    this.drawerSvc.close();
  }

  markAsRead(id: number) {
    this.rawNotifications.update(list =>
      list.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
    this.notificationService.makeAsRead(id,
      (response: any) => {
        console.log('Read confirmed');
      },
      (err: any) => {
        console.error('Error marking as read', err);
      }
    );
  }

  markAllAsRead() {
    const unread = this.rawNotifications().filter(n => !n.isRead);
    unread.forEach(n => this.markAsRead(n.id));
  }

  clearAll() {
    this.rawNotifications.set([]);
  }
}