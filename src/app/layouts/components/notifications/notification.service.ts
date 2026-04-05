import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Client, Message } from '@stomp/stompjs';
import { BehaviorSubject, Observable } from 'rxjs';
import SockJS from 'sockjs-client';
import { environment } from '../../../../environments/environment.development';
import { HttpService } from '../../service/http-svc/http.service';
import {
  NotificationChannel,
  NotificationDelivery,
  NotificationDistributor,
  NotificationFeedItem,
  NotificationRequest,
  NotificationResult,
  NotificationType,
  TargetType,
} from './notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {

  private stompClient: Client | null = null;
  private readonly socketUrl = environment.devUrl + '/ws';
  private readonly apiUrl = environment.devUrl + '/api/notifications';

  private feedSubject = new BehaviorSubject<NotificationFeedItem[]>([]);
  public notifications$ = this.feedSubject.asObservable();

  constructor(
    private http: HttpService,
    private httpClient: HttpClient
  ) { }


  /**
   * Open a STOMP WebSocket and subscribe to all relevant topics for the user.
   */
  connect(userId: string, orgId?: string, groupId?: string): void {
    const socket = new SockJS(`${this.socketUrl}?userId=${userId}`);

    this.stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      connectHeaders: { userId },
    });

    this.stompClient.onConnect = () => {
      this.stompClient?.subscribe('/topic/public', msg => this.handleMessage(msg, 'IN_APP'));
      this.stompClient?.subscribe('/user/queue/notifications', msg => this.handleMessage(msg, 'IN_APP'));
      if (orgId) this.stompClient?.subscribe(`/topic/org.${orgId}`, msg => this.handleMessage(msg, 'IN_APP'));
      if (groupId) this.stompClient?.subscribe(`/topic/group.${groupId}`, msg => this.handleMessage(msg, 'IN_APP'));
    };

    this.stompClient.activate();
  }

  /** Gracefully close the WebSocket. */
  disconnect(): void {
    if (this.stompClient?.active) this.stompClient.deactivate();
  }

  private handleMessage(message: Message, channel: NotificationChannel): void {
    if (!message.body) return;

    // Backend sends the NotificationRequest as the WebSocket payload
    const payload: NotificationRequest = JSON.parse(message.body);

    const item: NotificationFeedItem = {
      localId: crypto.randomUUID(),
      subject: payload.subject,
      body: payload.body,
      type: payload.type ?? 'INFO',
      channel,
      targetScope: payload.targetScope,
      targetId: payload.targetId,
      isRead: false,
      receivedAt: new Date().toISOString(),
      metadata: payload.metadata,
    };

    this.feedSubject.next([item, ...this.feedSubject.getValue()]);
  }

  // ── Unified send ──────────────────────────────────────────────────────────────

  /**
   * Send a notification through any combination of channels and recipients.
   *
   * @example
   * this.notificationService.send({
   *   type: 'INFO',
   *   targetScope: 'USER',
   *   subject: 'Order Shipped',
   *   body: 'Your order is on its way.',
   *   distributors: [
   *     { channel: 'IN_APP',   recipientIds: ['user-uuid'] },
   *     { channel: 'EMAIL',    toEmails:     ['user@example.com'] },
   *     { channel: 'WHATSAPP', toPhones:     ['919876543210'] },
   *   ],
   * }).subscribe(r => console.log(r.totalSent, r.channelSummary));
   */
  send(request: NotificationRequest): Observable<NotificationResult> {
    return this.httpClient.post<NotificationResult>(
      `${this.apiUrl}/send`,
      request,
      { headers: this.buildHeaders() }
    );
  }

  // ── Convenience builders ──────────────────────────────────────────────────────

  /**
   * Broadcast to all connected users (GLOBAL / IN_APP).
   */
  sendGlobal(
    subject: string,
    body: string,
    type: NotificationType = 'INFO'
  ): Observable<NotificationResult> {
    return this.send({
      type, targetScope: 'GLOBAL', subject, body,
      distributors: [{ channel: 'IN_APP' }],
    });
  }

  /**
   * Send to a specific user. Add extra distributors for email / WhatsApp / push.
   *
   * @example
   * sendToUser('uuid-1', 'Subject', 'Body', {
   *   toEmails:  ['user@example.com'],
   *   toPhones:  ['919876543210'],
   * });
   */
  sendToUser(
    userId: string,
    subject: string,
    body: string,
    options: {
      type?: NotificationType;
      from?: string;
      toEmails?: string[];
      toPhones?: string[];
      deviceTokens?: string[];
      metadata?: Record<string, string>;
    } = {}
  ): Observable<NotificationResult> {
    const distributors: NotificationDistributor[] = [
      { channel: 'IN_APP', recipientIds: [userId] },
    ];
    if (options.toEmails?.length) distributors.push({ channel: 'EMAIL', toEmails: options.toEmails });
    if (options.toPhones?.length) distributors.push({ channel: 'WHATSAPP', toPhones: options.toPhones });
    if (options.deviceTokens?.length) distributors.push({ channel: 'PUSH', deviceTokens: options.deviceTokens });

    return this.send({
      type: options.type ?? 'INFO',
      targetScope: 'USER',
      targetId: userId,
      from: options.from,
      subject, body,
      distributors,
      metadata: options.metadata,
    });
  }

  /**
   * Broadcast to an entire organisation.
   * Add toEmails / toPhones for email or WhatsApp fan-out.
   */
  sendToOrg(
    orgId: string,
    subject: string,
    body: string,
    options: {
      type?: NotificationType;
      toEmails?: string[];
      toPhones?: string[];
    } = {}
  ): Observable<NotificationResult> {
    const distributors: NotificationDistributor[] = [{ channel: 'IN_APP' }];
    if (options.toEmails?.length) distributors.push({ channel: 'EMAIL', toEmails: options.toEmails });
    if (options.toPhones?.length) distributors.push({ channel: 'WHATSAPP', toPhones: options.toPhones });

    return this.send({
      type: options.type ?? 'INFO',
      targetScope: 'TENANT', targetId: orgId,
      subject, body, distributors,
    });
  }

  /**
   * Broadcast to a group / role.
   */
  sendToGroup(
    groupId: string,
    subject: string,
    body: string,
    options: {
      type?: NotificationType;
      toEmails?: string[];
      toPhones?: string[];
    } = {}
  ): Observable<NotificationResult> {
    const distributors: NotificationDistributor[] = [{ channel: 'IN_APP' }];
    if (options.toEmails?.length) distributors.push({ channel: 'EMAIL', toEmails: options.toEmails });
    if (options.toPhones?.length) distributors.push({ channel: 'WHATSAPP', toPhones: options.toPhones });

    return this.send({
      type: options.type ?? 'INFO',
      targetScope: 'GROUP', targetId: groupId,
      subject, body, distributors,
    });
  }

  /**
   * Send IN_APP to a list of users — one notification per user.
   * Optionally fan out to email / WhatsApp per user.
   */
  sendToUserList(
    userIds: string[],
    subject: string,
    body: string,
    type: NotificationType = 'INFO'
  ): Observable<NotificationResult> {
    return this.send({
      type, targetScope: 'USER',
      subject, body,
      distributors: [{ channel: 'IN_APP', recipientIds: userIds }],
    });
  }

  // ── Single-channel shortcuts ──────────────────────────────────────────────────

  /** IN_APP only — supply recipientIds for USER scope, omit for broadcasts. */
  sendInApp(
    targetScope: TargetType,
    subject: string,
    body: string,
    options: { targetId?: string; recipientIds?: string[]; type?: NotificationType } = {}
  ): Observable<NotificationResult> {
    return this.send({
      type: options.type ?? 'INFO',
      targetScope, targetId: options.targetId,
      subject, body,
      distributors: [{ channel: 'IN_APP', recipientIds: options.recipientIds }],
    });
  }

  /** EMAIL only — send to multiple addresses at once. */
  sendEmail(
    toEmails: string[],
    subject: string,
    body: string,
    options: { from?: string; targetScope?: TargetType; targetId?: string; type?: NotificationType } = {}
  ): Observable<NotificationResult> {
    return this.send({
      type: options.type ?? 'INFO',
      targetScope: options.targetScope ?? 'USER',
      targetId: options.targetId,
      from: options.from,
      subject, body,
      distributors: [{ channel: 'EMAIL', toEmails }],
    });
  }

  /** WHATSAPP only — send to multiple phone numbers at once. */
  sendWhatsApp(
    toPhones: string[],
    subject: string,
    body: string,
    options: { targetScope?: TargetType; targetId?: string; type?: NotificationType } = {}
  ): Observable<NotificationResult> {
    return this.send({
      type: options.type ?? 'INFO',
      targetScope: options.targetScope ?? 'USER',
      targetId: options.targetId,
      subject, body,
      distributors: [{ channel: 'WHATSAPP', toPhones }],
    });
  }

  /** PUSH only — send to multiple device tokens at once. */
  sendPush(
    deviceTokens: string[],
    subject: string,
    body: string,
    options: { targetScope?: TargetType; targetId?: string; type?: NotificationType } = {}
  ): Observable<NotificationResult> {
    return this.send({
      type: options.type ?? 'INFO',
      targetScope: options.targetScope ?? 'USER',
      targetId: options.targetId,
      subject, body,
      distributors: [{ channel: 'PUSH', deviceTokens }],
    });
  }

  // ── Read state ────────────────────────────────────────────────────────────────

  /**
   * Mark a specific delivery record as read on the backend.
   * Use this when you have the {@link NotificationDelivery#id} (fetched via API).
   */
  markDeliveryAsRead(deliveryId: number, successFn?: any, errorFn?: any): void {
    this.http.postHttp(
      `${this.apiUrl}/delivery/${deliveryId}/read`,
      {},
      successFn ?? (() => { }),
      errorFn ?? (() => { })
    );
  }

  /**
   * Mark all unread IN_APP deliveries as read for a user in one backend call.
   * Pass the user's UUID as the {@code recipientRef}.
   */
  markAllDeliveriesAsRead(recipientRef: string, successFn?: any, errorFn?: any): void {
    this.http.postHttp(
      `${this.apiUrl}/delivery/read-all?recipientRef=${encodeURIComponent(recipientRef)}`,
      {},
      successFn ?? (() => { }),
      errorFn ?? (() => { })
    );
  }

  /** Optimistically update a single feed item as read in local state. */
  markLocalAsRead(localId: string): void {
    this.feedSubject.next(
      this.feedSubject.getValue().map(n =>
        n.localId === localId ? { ...n, isRead: true } : n
      )
    );
  }

  /** Optimistically mark all local feed items as read. */
  markAllLocalAsRead(): void {
    this.feedSubject.next(
      this.feedSubject.getValue().map(n => ({ ...n, isRead: true }))
    );
  }

  clearFeed(): void {
    this.feedSubject.next([]);
  }

  private buildHeaders(): HttpHeaders {
    return new HttpHeaders({ 'app-key': environment.appKey });
  }
}
