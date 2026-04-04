import { Component, signal, computed, OnInit, OnDestroy, inject, ElementRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from './notification.service';
import { Observable, Subscription } from 'rxjs';
import { UserInitResponse } from '../../models/Init-response.model';
import { AuthService } from '../../guards/auth.service';
import { Notification } from './notification.model';
import { Bell, Check, Trash2, AlertTriangle, Info, LucideAngularModule } from 'lucide-angular';
import '@tailwindplus/elements';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './notifications.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class NotificationsComponent implements OnInit, OnDestroy {
  private notificationService = inject(NotificationService);
  private sub: Subscription = new Subscription();

  filter = signal<'all' | 'unread'>('all');
  rawNotifications = signal<Notification[]>([]);

  // Icons
  readonly BellIcon = Bell;
  readonly CheckIcon = Check;
  readonly TrashIcon = Trash2;
  readonly AlertTriangleIcon = AlertTriangle;
  readonly InfoIcon = Info;

  notifications = computed(() => {
    const list = this.rawNotifications();
    return this.filter() === 'unread' ? list.filter(n => !n.isRead) : list;
  });

  unreadCount = computed(() => this.rawNotifications().filter(n => !n.isRead).length);
  userData$: Observable<UserInitResponse | null>;

  constructor(
    private authSvs: AuthService,
    private el: ElementRef
  ) {
    this.userData$ = this.authSvs.currentUser$;
  }

  ngOnInit() {
    const userSub = this.userData$.subscribe(user => {
      if (user) {
        console.log('Connecting to Notifications for:', user.fullName);
        const myUserId = user.userUuid;
        const myOrgId = String(user.tenantId);
        console.log('user UUID: ' + myUserId);

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
    this.sub.unsubscribe();
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