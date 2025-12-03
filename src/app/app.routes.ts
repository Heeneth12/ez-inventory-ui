import { Routes } from '@angular/router';
import { ForbiddenComponent } from './views/forbidden/forbidden.component';
import { DashboardComponent } from './views/dashboard/dashboard.component';
import { ItemsRoutes } from './views/items/items.routes';
import { PurchasesRoutes } from './views/purchases/purchases.routes';
import { SalesRoutes } from './views/sales/sales.routes';
import { ReportsRoutes } from './views/reports/reports.routes';
import { DocumentsRoutes } from './views/documents/documents.routes';
import { AuthComponent } from './views/auth/auth.component';
import { UserManagementComponent } from './views/user-management/user-management.component';
import { stockRoutes } from './views/stock/stock.routes';
import { SettingsComponent } from './views/settings/settings.component';
import { employeeManagementRoutes } from './views/employee/employee-management.routes';
import { contactsRoutes } from './views/contacts/contacts.routes';
import { AuthGuard } from './layouts/guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AuthGuard],
        data: { moduleKey: 'EZH_INV_DASHBOARD' }
    },
    {
        path: 'items',
        children: ItemsRoutes,
        canActivate: [AuthGuard],
        data: { moduleKey: 'EZH_INV_ITEMS' }
    },
    {
        path: 'stock',
        children: stockRoutes,
        canActivate: [AuthGuard],
        data: { moduleKey: 'EZH_INV_STOCK' }
    },
    {
        path: 'purchases',
        children: PurchasesRoutes,
        canActivate: [AuthGuard],
        data: { moduleKey: 'EZH_INV_PURCHASES' }
    },
    {
        path: 'sales',
        children: SalesRoutes,
        canActivate: [AuthGuard],
        data: { moduleKey: 'EZH_INV_SALES' }
    },
    {
        path: 'reports',
        children: ReportsRoutes,
        canActivate: [AuthGuard],
        data: { moduleKey: 'EZH_INV_REPORTS' }
    },
    {
        path: 'contacts',
        children: contactsRoutes,
        canActivate: [AuthGuard],
        data: { moduleKey: 'EZH_INV_CONTACTS' }
    },
    {
        path: 'employee',
        children: employeeManagementRoutes,
        canActivate: [AuthGuard],
        data: { moduleKey: 'EZH_INV_EMPLOYEE' }
    },
    {
        path: 'documents',
        children: DocumentsRoutes,
        canActivate: [AuthGuard],
        data: { moduleKey: 'EZH_INV_DOCUMENTS' }
    },
    {
        path: 'settings',
        component: SettingsComponent,
        canActivate: [AuthGuard],
        data: { moduleKey: 'EZH_INV_SETTINGS' }
    },
    
    // User Management (Admin)
    {
        path: 'admin/user-management',
        component: UserManagementComponent,
        canActivate: [AuthGuard],
        data: { moduleKey: 'EZH_INV_USER_MGMT' }
    },

    // Public/Auth routes
    { path: 'login', component: AuthComponent },
    { path: 'forbidden', component: ForbiddenComponent },
];