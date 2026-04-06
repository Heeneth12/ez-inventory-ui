export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
export type TargetType = 'GLOBAL' | 'USER' | 'TENANT' | 'GROUP';
export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'WHATSAPP' | 'PUSH';
export type DeliveryStatus = 'PENDING' | 'SENT' | 'FAILED' | 'READ';


/**
 * One entry per channel in a {@link NotificationRequest}.
 * Each distributor owns the full recipient list for that channel.
 *
 * @example
 * { channel: 'EMAIL',    toEmails:     ['a@x.com', 'b@x.com'] }
 * { channel: 'WHATSAPP', toPhones:     ['919876543210'] }
 * { channel: 'IN_APP',   recipientIds: ['user-uuid-1', 'user-uuid-2'] }
 * { channel: 'PUSH',     deviceTokens: ['fcm-token-a'] }
 */
export interface NotificationDistributor {
  channel: NotificationChannel;
  recipientIds?: string[];
  toEmails?: string[];
  toPhones?: string[];
  deviceTokens?: string[];
}


/**
 * Unified notification request — mirrors backend {@code NotificationRequest}.
 *
 * @example
 * const req: NotificationRequest = {
 *   type: 'INFO',
 *   targetScope: 'USER',
 *   subject: 'Order Shipped',
 *   body: 'Your order #4521 is on its way.',
 *   distributors: [
 *     { channel: 'IN_APP',   recipientIds: ['uuid-1'] },
 *     { channel: 'EMAIL',    toEmails:     ['alice@example.com'] },
 *     { channel: 'WHATSAPP', toPhones:     ['919876543210'] },
 *   ],
 * };
 */
export interface NotificationRequest {
  /** Severity / intent. */
  type?: NotificationType;

  /**
   * Audience scope — one notification has exactly one scope.
   * Individual recipients are listed inside each {@link NotificationDistributor}.
   */
  targetScope: TargetType;

  /** Org ID / Group ID / User ID. Null for GLOBAL. */
  targetId?: string;

  /** Sender display name or address. */
  from?: string;

  /** Subject line / notification title. */
  subject: string;

  /** Full notification body. */
  body: string;

  /**
   * One entry per channel, each carrying its own recipient list.
   * At least one distributor is required.
   */
  distributors: NotificationDistributor[];

  /** Optional key/value metadata (e.g. sentBy, orderId). */
  metadata?: Record<string, string>;
}

// ── Result ────────────────────────────────────────────────────────────────────

/** Per-channel delivery counts returned inside {@link NotificationResult}. */
export interface ChannelSummary {
  /** Successfully dispatched recipient count. */
  sent: number;
  /** Failed recipient count. */
  failed: number;
  /** Recipient refs (email / phone / userId / token) that failed. */
  failedRecipients: string[];
}

/**
 * Response from {@code POST /api/notifications/send}.
 *
 * @example
 * {
 *   notificationId: 42,
 *   totalDispatched: 6,
 *   totalSent: 5,
 *   totalFailed: 1,
 *   channelSummary: {
 *     EMAIL:    { sent: 2, failed: 0, failedRecipients: [] },
 *     WHATSAPP: { sent: 1, failed: 1, failedRecipients: ['9198XXXXXXXX'] },
 *     IN_APP:   { sent: 2, failed: 0, failedRecipients: [] },
 *   }
 * }
 */
export interface NotificationResult {
  notificationId: number;
  totalDispatched: number;
  totalSent: number;
  totalFailed: number;
  channelSummary: Partial<Record<NotificationChannel, ChannelSummary>>;
}

// ── DB record (NotificationDelivery) ─────────────────────────────────────────

/**
 * Mirrors the backend {@code NotificationDelivery} entity.
 * One row per recipient × channel. Fetched via API for history / inbox views.
 */
export interface NotificationDelivery {
  id: number;

  /** email / phone / userId / deviceToken depending on channel. */
  recipientRef: string;

  channel: NotificationChannel;
  status: DeliveryStatus;
  isRead: boolean;
  readAt?: string;
  failureReason?: string;
  createdAt?: string;

  /** Parent notification message (populated when joined in the response). */
  notification?: {
    id: number;
    subject: string;
    body: string;
    type: NotificationType;
    targetScope: TargetType;
    targetId?: string;
    sentBy?: string;
    createdAt?: string;
  };
}

// ── UI feed item ──────────────────────────────────────────────────────────────

/**
 * What the notification dropdown actually displays.
 *
 * Built from either:
 * - An incoming WebSocket push (channel = IN_APP, no deliveryId initially), or
 * - A fetched {@link NotificationDelivery} row (has deliveryId for per-item read sync).
 */
export interface NotificationFeedItem {
  /** Client-generated ID for local list management (UUID or timestamp string). */
  localId: string;
  deliveryId?: number;
  subject: string;
  body: string;
  type: NotificationType;
  channel: NotificationChannel;
  targetScope: TargetType;
  targetId?: string;
  isRead: boolean;
  receivedAt: string;
  metadata?: Record<string, string>;
}
