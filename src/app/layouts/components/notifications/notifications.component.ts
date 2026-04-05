import {
  Component, signal, computed, OnInit, OnDestroy,
  inject, ElementRef, CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import {
  Bell, Check, Trash2, AlertTriangle, Info,
  MessageCircle, Mail, Smartphone, Wifi, XCircle,
  LucideAngularModule
} from 'lucide-angular';
import '@tailwindplus/elements';

import { NotificationService } from './notification.service';
import { NotificationFeedItem } from './notification.model';
import { UserInitResponse } from '../../models/Init-response.model';
import { AuthService } from '../../guards/auth.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './notifications.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class NotificationsComponent implements OnInit, OnDestroy {

  private notificationService = inject(NotificationService);
  private sub = new Subscription();

  /** Currently authenticated user — needed for markAllAsRead backend call. */
  private currentUserId: string | null = null;

  filter = signal<'all' | 'unread'>('all');
  rawNotifications = signal<NotificationFeedItem[]>([]);

  // ── Icons ─────────────────────────────────────────────────────────────────────
  readonly BellIcon     = Bell;
  readonly CheckIcon    = Check;
  readonly TrashIcon    = Trash2;
  readonly AlertIcon    = AlertTriangle;
  readonly InfoIcon     = Info;
  readonly ErrorIcon    = XCircle;
  readonly WhatsAppIcon = MessageCircle;
  readonly MailIcon     = Mail;
  readonly PushIcon     = Smartphone;
  readonly InAppIcon    = Wifi;

  // ── Derived state ─────────────────────────────────────────────────────────────

  notifications = computed(() => {
    const list = this.rawNotifications();
    return this.filter() === 'unread' ? list.filter(n => !n.isRead) : list;
  });

  unreadCount = computed(() =>
    this.rawNotifications().filter(n => !n.isRead).length
  );

  userData$: Observable<UserInitResponse | null>;

  constructor(private authSvs: AuthService, private el: ElementRef) {
    this.userData$ = this.authSvs.currentUser$;
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    const userSub = this.userData$.subscribe(user => {
      if (user) {
        this.currentUserId = user.userUuid;
        const groupId = user.userRoles?.length ? user.userRoles[0] : 'default-group';
        this.notificationService.connect(user.userUuid, String(user.tenantId), groupId);
      }
    });

    const feedSub = this.notificationService.notifications$.subscribe(items => {
      this.rawNotifications.set(items);
    });

    this.sub.add(userSub);
    this.sub.add(feedSub);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.notificationService.disconnect();
  }

  // ── Actions ───────────────────────────────────────────────────────────────────

  /**
   * Mark a single feed item as read.
   * Updates local state immediately (optimistic).
   * If the item has a {@code deliveryId} (fetched from API), also syncs to backend.
   */
  markAsRead(item: NotificationFeedItem): void {
    if (item.isRead) return;
    this.notificationService.markLocalAsRead(item.localId);

    if (item.deliveryId != null) {
      this.notificationService.markDeliveryAsRead(
        item.deliveryId,
        () => {},
        (err: any) => console.error('markDeliveryAsRead failed', err)
      );
    }
  }

  /**
   * Mark all items as read.
   * Updates local state immediately, then syncs all IN_APP deliveries on the backend.
   */
  markAllAsRead(): void {
    if (!this.rawNotifications().some(n => !n.isRead)) return;

    this.notificationService.markAllLocalAsRead();

    if (this.currentUserId) {
      this.notificationService.markAllDeliveriesAsRead(
        this.currentUserId,
        () => {},
        (err: any) => console.error('markAllDeliveriesAsRead failed', err)
      );
    }
  }

  clearAll(): void {
    this.notificationService.clearFeed();
  }

  // ── Template helpers ──────────────────────────────────────────────────────────

  /** Channel icon + colour used in the template badge. */
  channelBadge(item: NotificationFeedItem): { label: string; bg: string; text: string } {
    switch (item.channel) {
      case 'EMAIL':    return { label: 'Email',    bg: 'bg-purple-50', text: 'text-purple-600' };
      case 'WHATSAPP': return { label: 'WhatsApp', bg: 'bg-green-50',  text: 'text-green-600'  };
      case 'PUSH':     return { label: 'Push',     bg: 'bg-orange-50', text: 'text-orange-600' };
      default:         return { label: 'In-App',   bg: 'bg-blue-50',   text: 'text-blue-600'   };
    }
  }
}
