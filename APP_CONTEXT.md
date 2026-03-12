# Project Context & Documentation

This document serves as a unified context file for both Large Language Models (LLMs) and developers to quickly understand the technical and business logic of the EZ Inventory System. It covers both the overall Application level and the specific Items Module level.

---

## 1. App-Level Architecture & Business Logic

### 1.1 Technical Stack & Configuration
- **Framework**: Angular 18 (Standalone and NgModule hybrid, primarily standalone/lazy loaded routes).
- **Styling**: Tailwind CSS & `@tailwindplus/elements` for modern UI components.
- **State & Reactivity**: RxJS extensively used (e.g., `Subject`, `debounceTime` for API rate-limiting).
- **Real-Time & WebSockets**: Used for real-time updates and chats (`@stomp/stompjs`, `socket.io-client`).
- **Data Visualization**: `chart.js` and `highcharts` for analytical dashboards.
- **Routing**: Highly modular, lazy-loaded routing structure (`app.routes.ts`) for performance optimization.
- **Authentication/Authorization**: Secured via `AuthGuard`, `RedirectGuard`, and `ngx-permissions` module key-based access control.

### 1.2 Core Business Domain
EZ Inventory is an enterprise-grade Inventory & Supply Chain Management tool encompassing multiple business modules:
- **Dashboards**: Main analytics and Vendor-specific dashboards.
- **Item Management**: Cataloging of products and services.
- **Stock**: Real-time view of current stock, Stock Ledger for tracking transactions over time, and Stock Adjustments for manual corrections.
- **Purchases**: End-to-end handling of Purchase Requests (PRQ), Purchase Orders (PO), Goods Receipt Notes (GRN), and Purchase Returns (PR).
- **Sales**: End-to-end handling of Quotes, Sales Orders (SO), Sales Invoices (INV), Delivery Challans (DC), Payments, and Sales Returns (SR).
- **Approval Console**: Workflow routing for document authorization (e.g., approving POs or SOs).
- **Vendor / Contact Management**: Maintaining supplier and client details.
- **Reports & Settings**: Generating Excel-based reports and managing app-level settings (like users/roles).

### 1.3 Key Architectural Patterns
- **API Communication**: Dedicated `HttpService` abstraction making calls to the backend (`environment.devUrl`).
- **Component Design**: Heavy use of `ViewChild`, `TemplateRef`, and shared layouts (e.g., `inventory-layout`).
- **Debounced Inputs**: Search/filtering API calls are piped through an RxJS `Subject` with `debounceTime` to handle frequent text changes effectively without blowing up backend servers.

---

## 2. Items Module Context & Logic

### 2.1 Technical Implementation Details
- **Routing Base**: Located in `src/app/views/items/items.routes.ts`.
- **Top-Level Component**: `ItemsManagementComponent` manages the wrapper.
- **Child Routes**: 
  - Listing & actions -> `ItemsComponent` (`path: ''`)
  - Create -> `AddItemsComponent` (`path: 'create'`)
  - Edit -> `AddItemsComponent` (`path: 'edit/:id'`)
- **Service Integration**: `ItemService` is explicitly injected for CRUD processes hitting the `/v1/items` HTTP endpoints.

### 2.2 Domain Model (`ItemModel`)
Every item in the system adheres to the following core attributes:
- **Identifiers**: `id`, `name`, `itemCode`, `sku`, `barcode`, `hsnSacCode`.
- **Classification**: `itemType` (`'SERVICE'` or `'PRODUCT'`), `category`, `unitOfMeasure`, `brand`, `manufacturer`.
- **Financials**: `purchasePrice`, `sellingPrice`, `mrp`, `taxPercentage`, `discountPercentage`.
- **Status Context**: `isActive` (boolean for enabling/disabling).

### 2.3 Business Logic & Rules
1. **Product vs Service**: Items are strictly categorized. 'SERVICES' do not hold physical stock but impact billing logic. 'PRODUCTS' are linked to stock ledgers and support batch expiration tracking. However, the Item itself only acts as a display catalog and does not store the current available quantity; all current quantities and stock movements are handled exclusively by the Stock module.
2. **Soft Deletes (Active Tracking)**: Items are not permanently deleted; instead, they are toggled via `toggleActiveStatus()` to prevent orphaned data in old sales/purchase orders.
3. **Inventory Linkage**: `ItemsComponent` connects to `StockService` to pull active batch details (`calculateTotalStock()`) and assess expiration metrics. Items show days remaining, with dynamic color-coding for expirations.
4. **Data Grid Integrity**: Item lists support Server-Side Pagination and debounced query searches using `ItemSearchFilter` (mapping fields like query, active status, types, categories, and brands).
5. **Bulk Operations**: Bulk upload of items is supported directly through the UI to fast-track cataloging.
6. **Detailed Overviews**: Items feature a slide-out/modal details page providing an interconnected view of available Master details and ItemStock details.

---

## 📦 3. Stock Module Context & Logic

### 3.1 Technical Implementation Details
- **Routing Base**: Located in `src/app/views/stock/stock.routes.ts`.
- **Top-Level Component**: `StockAdapterComponent` manages the wrapper.
- **Child Routes**:
  - Current Stock List -> `StockComponent` (`path: ''`)
  - Stock Ledger -> `StockLedgerComponent` (`path: 'ledger'`)
  - Adjustments List -> `StockAdjustmentComponent` (`path: 'adjustment'`)
  - Create Adjustment -> `StockAdjFormComponent` (`path: 'adjustment/create'`)
- **Service Integration**: `StockService` handles CRUD hitting the `/v1/stock` HTTP endpoints.

### 3.2 Domain Models (`StockModel`, `BatchDetailModel`)
- **StockModel**: Tracks core quantities per item and warehouse (`openingQty`, `inQty`, `outQty`, `closingQty`, `averageCost`, `stockValue`).
- **ItemStockSearchModel & BatchDetailModel**: Links items to specific trackable batches including `batchNumber`, `buyPrice`, `remainingQty`, and `expiryDate` timestamp.
- **StockDashboardModel**: Yields summary analytics like `totalStockValue`, `totalItemsOutOfStock`, and `fastMovingItems`.
- **StockFilterModel**: Used for complex debounced searches spanning item IDs, warehouses, and date ranges.

### 3.3 Business Logic & Rules
1. **Centralized Quantities**: The Stock module is the absolute source of truth for physical quantities. Items must refer to the Stock module to calculate available quantities and active batches.
2. **Current Stock View**: Shows aggregated current quantities and values for products across warehouses.
3. **Ledger Transactions**: The `Stock Ledger` records a granular history of every stock movement (e.g., from Sales Orders, Purchase Receipts, Adjustments).
4. **Stock Adjustments**: Allows manual correction of stock levels (e.g., for damages, shrinkage, or audit discrepancies). Adjustments directly feed into the Ledger and update the current stock snapshot.
5. **Batch Tracking & Expirations**: Stock is tracked on a batch level, making it possible to trace individual purchase values (`buyPrice`) and manage items approaching their `expiryDate`.
6. **Dashboard Summary**: Real-time KPI summaries are fetched via `/v1/stock/summary/{warehouseId}` to quickly analyze inventory health.

---
*Created dynamically for Developer & LLM Context Acceleration.*
