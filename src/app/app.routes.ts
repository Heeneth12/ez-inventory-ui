import { Routes } from '@angular/router';
import { AuthGuard } from './layouts/guards/auth.guard';
import { RedirectGuard } from './layouts/guards/redirect.guard';
import { ExampleComponent } from './views/example/example.component';

export const routes: Routes = [
    {
        path: '',
        canActivate: [RedirectGuard],
        children: []
    },

    // 1. DASHBOARD (Lazy load single component)
    {
        path: 'dashboard',
        loadComponent: () => import('./views/dashboard/dashboard.component')
            .then(c => c.DashboardComponent),
        canActivate: [AuthGuard],
        data: { moduleKey: 'EZH_INV_DASHBOARD' }
    },

    // 1.5. VENDOR DASHBOARD (Lazy load single component)
    {
        path: 'vendor',
        loadChildren: () => import('./views/vendor/vendor.routes')
            .then(m => m.vendorRoutes),
        canActivate: [AuthGuard],
        data: { moduleKey: 'EZH_INV_VENDOR' }
    },

    // 1.6. DEVELOPER DASHBOARD (Lazy load single component)
    {
        path: 'developer',
        loadComponent: () => import('./views/developer/developer.component')
            .then(c => c.DeveloperComponent),
        canActivate: [AuthGuard],
        data: { moduleKey: 'EZH_INV_DEVELOPER' }
    },

    // 2. ITEMS (Lazy load route file)
    {
        path: 'items',
        loadChildren: () => import('./views/items/items.routes')
            .then(m => m.ItemsRoutes),
        canActivate: [AuthGuard],
        data: { moduleKey: 'EZH_INV_ITEMS' }
    },

    // 3. STOCK
    {
        path: 'stock',
        loadChildren: () => import('./views/stock/stock.routes')
            .then(m => m.stockRoutes),
        canActivate: [AuthGuard],
        data: { moduleKey: 'EZH_INV_STOCK' }
    },

    // 4. PURCHASES
    {
        path: 'purchases',
        loadChildren: () => import('./views/purchases/purchase.routes')
            .then(m => m.PurchasesRoutes),
        canActivate: [AuthGuard],
        data: { moduleKey: 'EZH_INV_PURCHASES' }
    },

    // 5. SALES
    {
        path: 'sales',
        loadChildren: () => import('./views/sales/sales.routes')
            .then(m => m.SalesRoutes),
        canActivate: [AuthGuard],
        data: { moduleKey: 'EZH_INV_SALES' }
    },

    // 5.1. PAYMENTS
    {
        path: 'payment',
        loadChildren: () => import('./views/payments/payment.routes')
            .then(m => m.PaymentRoutes),
        canActivate: [AuthGuard],
        data: { moduleKey: 'EZH_INV_SALES' }
    },

    // 6. REPORTS
    {
        path: 'reports',
        loadChildren: () => import('./views/reports/reports.routes')
            .then(m => m.ReportsRoutes),
        canActivate: [AuthGuard],
        data: { moduleKey: 'EZH_INV_REPORTS' }
    },

    // 7. CONTACTS
    // {
    //     path: 'contacts',
    //     loadChildren: () => import('./views/contacts/contacts.routes')
    //         .then(m => m.contactsRoutes),
    //     canActivate: [AuthGuard],
    //     data: { moduleKey: 'EZH_INV_CONTACTS' }
    // },

    // 8. EMPLOYEE
    // {
    //     path: 'employee',
    //     loadChildren: () => import('./views/employee/employee-management.routes')
    //         .then(m => m.employeeManagementRoutes),
    //     canActivate: [AuthGuard],
    //     data: { moduleKey: 'EZH_INV_EMPLOYEE' }
    // },

    // 9. DOCUMENTS
    {
        path: 'documents',
        loadComponent: () => import('./views/file-manager/file-manager.component')
            .then(c => c.FileManagerComponent),
        canActivate: [AuthGuard],
        data: { moduleKey: 'EZH_INV_DOCUMENTS' }
    },

    // 10. DOCUMENTS
    {
        path: 'approval',
        loadChildren: () => import('./views/approval-console/approval-console.routes')
            .then(m => m.ApprovalConsoleRoutes),
        canActivate: [AuthGuard],
        data: { moduleKey: 'EZH_INV_DOCUMENTS' }
    },


    // 10. SETTINGS
    {
        path: 'settings',
        loadComponent: () => import('./views/settings/settings.component')
            .then(c => c.SettingsComponent),
        canActivate: [AuthGuard],
        data: { moduleKey: 'EZH_INV_SETTINGS' }
    },

    // 11. USER MANAGEMENT (Admin)
    {
        path: 'admin',
        loadChildren: () => import('./views/user-management/user-management.routes')
            .then(m => m.UserManagementRoutes),
        canActivate: [AuthGuard],
        data: { moduleKey: 'EZH_INV_SETTINGS' }
    },

    // 11. USER MANAGEMENT (Admin)
    {
        path: 'ai-chat',
        loadComponent() {
            return import('./views/ai-chat/ai-chat.component')
                .then(c => c.AiChatComponent);
        },
        canActivate: [AuthGuard],
        data: { moduleKey: 'EZH_INV_SETTINGS' }
    },

    // 12. PUBLIC ROUTES
    {
        path: 'auth',
        loadChildren: () => import('./views/auth/auth.routes')
            .then(m => m.AuthRoutes)
    },
    {
        path: 'forbidden',
        loadComponent: () => import('./views/forbidden/forbidden.component')
            .then(c => c.ForbiddenComponent)
    },

    {
        path: 'example',
        loadComponent: () => import('./views/example/example.component')
            .then(c => c.ExampleComponent)
    },
];  