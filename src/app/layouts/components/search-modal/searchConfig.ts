export interface NavItem {
    title: string;          // What the user sees (Where to go)
    description: string;    // The action (What do you want to do?)
    route: string;          // The Angular router path
    module: string;         // For permission checking (moduleKey)
    keywords: string[];     // Synonyms for better search hits
    icon?: string;          // Optional UI icon
}

export const APP_NAVIGATION_MAP: NavItem[] = [
    // STOCK
    {
        title: 'Stock',
        description: 'Check current stock levels',
        route: '/stock',
        module: 'EZH_INV_STOCK',
        keywords: ['inventory', 'levels', 'quantity', 'available']
    },
    {
        title: 'Stock Ledger',
        description: 'See stock movement history',
        route: '/stock/ledger',
        module: 'EZH_INV_STOCK',
        keywords: ['history', 'movement', 'audit', 'tracking']
    },
    {
        title: 'Stock Adjustment',
        description: 'Correct a stock count',
        route: '/stock/adjustment/create',
        module: 'EZH_INV_STOCK',
        keywords: ['correct', 'edit stock', 'reconcile']
    },

    // PURCHASES
    {
        title: 'Create PRQ',
        description: 'Request items to be purchased',
        route: '/purchases/prq/form',
        module: 'EZH_INV_PURCHASES',
        keywords: ['requisition', 'buy', 'request']
    },
    {
        title: 'Create PO',
        description: 'Issue a Purchase Order to vendor',
        route: '/purchases/order/form',
        module: 'EZH_INV_PURCHASES',
        keywords: ['vendor order', 'purchase', 'external']
    },

    // SALES
    {
        title: 'Create Invoice',
        description: 'Generate a customer Invoice',
        route: '/sales/invoice/form',
        module: 'EZH_INV_SALES',
        keywords: ['billing', 'sell', 'customer bill']
    },

    // ADMIN/SETTINGS
    {
        title: 'Create User',
        description: 'Add a new user',
        route: '/admin/users/form',
        module: 'EZH_INV_SETTINGS',
        keywords: ['staff', 'employee', 'access', 'permissions']
    }
];


//   allNavItems: NavItem[] = [
//     {
//       label: 'Dashboard',
//       link: '/dashboard',
//       icon: LayoutDashboard,
//       moduleKey: 'EZH_INV_DASHBOARD'
//     },
//     {
//       label: 'Items',
//       link: '/items',
//       icon: PackagePlus,
//       moduleKey: 'EZH_INV_ITEMS'
//     },
//     {
//       label: 'Stock', // Stock in your routes
//       link: '/stock',
//       icon: Warehouse,
//       moduleKey: 'EZH_INV_STOCK'
//     },
//     {
//       label: 'Purchases',
//       link: '/purchases',
//       icon: HandbagIcon,
//       moduleKey: 'EZH_INV_PURCHASES',
//       subItems: [
//         { label: 'Purchase Request (PRQ)', link: '/purchases/prq' },
//         { label: 'Purchase Order', link: '/purchases/order' },
//         { label: 'Goods Receipt (GRN)', link: '/purchases/grn' },
//         { label: 'Purchase Return', link: '/purchases/return' },
//       ]
//     },
//     {
//       label: 'Sales',
//       link: '/sales',
//       icon: ShoppingCart,
//       moduleKey: 'EZH_INV_SALES',
//       subItems: [
//         { icon: ShoppingCart, label: 'Sales Order', link: '/sales/order' },
//         { icon: Receipt, label: 'Invoices', link: '/sales/invoice' },
//         { icon: Truck, label: 'Delivery', link: '/sales/delivery' },
//         { icon: Undo2, label: 'Sales Return', link: '/sales/return' },
//       ]
//     },
//     {
//       label: 'Payments',
//       link: '/payment',
//       icon: CreditCard,
//       moduleKey: 'EZH_INV_SALES',
//     },
//     {
//       label: 'Approval',
//       link: '/approval',
//       icon: ListChecks,
//       moduleKey: 'EZH_INV_EMPLOYEE',
//       badge: 2,
//     },
//     {
//       label: 'Reports',
//       link: '/reports',
//       icon: FileChartColumn,
//       moduleKey: 'EZH_INV_REPORTS'
//     },
//     {
//       label: 'Documents',
//       link: '/documents',
//       icon: Folder,
//       moduleKey: 'EZH_INV_DOCUMENTS'
//     },
//     {
//       label: 'Users',
//       link: '/admin/users',
//       icon: UsersRound,
//       moduleKey: 'EZH_INV_USER_MGMT',
//       section: 'Settings'
//     },
//     {
//       label: 'AI Chat',
//       link: '/ai-chat',
//       icon: MessageSquareText,
//       moduleKey: 'EZH_INV_REPORTS',
//       badge: 'Pro',
//       badgeVariant: 'pro',
//       isDisabled: false,
//       section: 'Settings'
//     },
//     {
//       label: 'Settings',
//       link: '/settings',
//       icon: Settings,
//       moduleKey: 'EZH_INV_SETTINGS',
//       section: 'Settings'
//     },
//   ];
