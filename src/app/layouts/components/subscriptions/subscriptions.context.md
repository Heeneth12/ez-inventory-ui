# Subscriptions Component — Context & Documentation

## Overview

The `SubscriptionsComponent` provides a full-featured subscription management UI for both **regular users** and **admins**. It handles plan discovery, tenant subscription, cancellation, and admin plan creation.

---

## Files

| File | Purpose |
|---|---|
| `subscriptions.component.ts` | Component logic, state, API calls |
| `subscriptions.component.html` | Template: header, current subscription, plan cards, 3 modals |
| `subscriptions.model.ts` | `SubscriptionModel`, `SubscriptionPlanModel` interfaces |
| `subscriptions.service.ts` | HTTP service wrapping all API endpoints |
| `subscriptions.context.md` | This file |

---

## API Endpoints (via `SubscriptionsService`)

| Method | Service Call | HTTP | Endpoint |
|---|---|---|---|
| Subscribe tenant to plan | `subscribeTenant(tenantId, planId)` | POST | `/api/v1/subscriptions/tenant/{tenantId}/plan/{planId}` |
| Get current subscription | `getCurrentSubscription(tenantId)` | GET | `/api/v1/subscriptions/tenant/{tenantId}/current` |
| Cancel subscription | `cancelSubscription(subscriptionId)` | PUT | `/api/v1/subscriptions/{subscriptionId}/cancel` |
| Create plan (admin) | `createPlan(planDto)` | POST | `/api/v1/subscriptions` |
| Get all active plans | `getActivePlans()` | GET | `/api/v1/subscriptions/active` |
| Get plan by ID | `getPlanById(id)` | GET | `/api/v1/subscriptions/{id}` |

---

## Models

### `SubscriptionModel`
```ts
{
  id: number;
  plan: SubscriptionPlanModel;
  status: string;         // 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING'
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  createdAt: string;
  isValid: boolean;
  daysRemaining: number;
}
```

### `SubscriptionPlanModel`
```ts
{
  id: number;
  name: string;
  description: string;
  type: string;           // 'BASIC' | 'STANDARD' | 'PREMIUM' | 'ENTERPRISE'
  price: number;
  durationDays: number;
  maxUsers: number;
  isActive: boolean;
}
```

### Create Plan DTO (sent by admin)
```ts
{
  name: string;
  description: string;
  type: string;
  price: number;
  durationDays: number;
  maxUsers: number;
  isActive: boolean;
}
```

---

## UI Sections

### 1. Page Header
- Title + subtitle
- **Admin only**: "Create Plan" button → opens `createPlanModal`

### 2. Current Subscription Card
- Loads on init via `getCurrentSubscription(tenantId)`
- **Loading state**: spinner
- **No subscription**: empty state with icon
- **Active subscription**: plan name, status badge, start/end dates, days remaining, max users, auto-renew indicator
- **Cancel button**: visible only when `status === 'ACTIVE'` → opens `cancelConfirmModal`
- Days remaining turns red when ≤ 7

### 3. Available Plans Grid
- Loads via `getActivePlans()` on init
- Responsive grid: 1 → 2 → 3 → 4 columns
- Each card: plan type badge, name, description, users/duration meta, price, subscribe button
- **Current plan** shows ring highlight + "Current Plan" pill + disabled "Active" button
- Plan colors: BASIC=slate, STANDARD=blue, PREMIUM=purple, ENTERPRISE=amber

---

## Modals (3 total)

### `subscribePlanModal`
- Confirms subscription to selected plan
- Shows plan name, description, price, duration, max users
- Calls `subscribeTenant(tenantId, planId)` on confirm
- On success: toast + reload current subscription

### `cancelConfirmModal`
- Confirms cancellation with warning
- Calls `cancelSubscription(subscriptionId)` on confirm
- On success: toast + reload current subscription

### `createPlanModal` (admin only)
- Form: name, description, type (select), price, durationDays, maxUsers, isActive toggle
- Calls `createPlan(planDto)` on submit
- On success: toast + reload active plans
- Validations: name ≥ 3 chars, price ≥ 0, durationDays ≥ 1, maxUsers ≥ 1

---

## Role Detection

Admin is determined at runtime from `AuthService.currentUser$`:
```ts
isAdmin = user.userRoles?.includes('ADMIN') ||
          user.userRoles?.includes('SUPER_ADMIN') ||
          user.userType === 'ADMIN'
```

`tenantId` is read from `user.tenantId` (stored in session via auth init).

---

## Dependencies

- `SubscriptionsService` — all API calls
- `AuthService` — current user, tenantId, role detection
- `ModalService` — open/close modals via template refs
- `ToastService` — success/error notifications
- `LucideAngularModule` — icons (Crown, Calendar, Users, etc.)
- `ReactiveFormsModule` — create plan form
- `CommonModule` — `*ngIf`, `*ngFor`, `date` pipe

---

## State Signals

| Signal | Type | Purpose |
|---|---|---|
| `currentSubscription` | `SubscriptionModel \| null` | Active subscription data |
| `activePlans` | `SubscriptionPlanModel[]` | Available plans list |
| `isAdmin` | `boolean` | Show/hide admin features |
| `tenantId` | `number` | Current tenant ID |
| `isLoading` | `boolean` | Current subscription loading |
| `isPlansLoading` | `boolean` | Plans list loading |
| `isSubscribing` | `boolean` | Subscribe action in progress |
| `isCancelling` | `boolean` | Cancel action in progress |
| `isCreatingPlan` | `boolean` | Create plan action in progress |
| `selectedPlan` | `SubscriptionPlanModel \| null` | Plan chosen for subscription |
