import { Routes } from '@angular/router';
import { AuthGuard } from './layouts/guards/auth.guard';
import { ExampleComponent } from './views/example/example.component';
import { AiChatComponent } from './views/ai-chat/ai-chat.component';

export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

    // 1. DASHBOARD (Lazy load single component)
    {
        path: 'dashboard',
        loadComponent: () => import('./views/dashboard/dashboard.component')
            .then(c => c.DashboardComponent),
        canActivate: [AuthGuard],
        data: { moduleKey: 'EZH_INV_DASHBOARD' }
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

    // 6. REPORTS
    {
        path: 'reports',
        loadChildren: () => import('./views/reports/reports.routes')
            .then(m => m.ReportsRoutes),
        canActivate: [AuthGuard],
        data: { moduleKey: 'EZH_INV_REPORTS' }
    },

    // 7. CONTACTS
    {
        path: 'contacts',
        loadChildren: () => import('./views/contacts/contacts.routes')
            .then(m => m.contactsRoutes),
        canActivate: [AuthGuard],
        data: { moduleKey: 'EZH_INV_CONTACTS' }
    },

    // 8. EMPLOYEE
    {
        path: 'employee',
        loadChildren: () => import('./views/employee/employee-management.routes')
            .then(m => m.employeeManagementRoutes),
        canActivate: [AuthGuard],
        data: { moduleKey: 'EZH_INV_EMPLOYEE' }
    },

    // 9. DOCUMENTS
    {
        path: 'documents',
        loadChildren: () => import('./views/documents/documents.routes')
            .then(m => m.DocumentsRoutes),
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
        path: 'login',
        loadComponent: () => import('./views/auth/auth.component')
            .then(c => c.AuthComponent)
    },
    {
        path: 'forbidden',
        loadComponent: () => import('./views/forbidden/forbidden.component')
            .then(c => c.ForbiddenComponent)
    },
];