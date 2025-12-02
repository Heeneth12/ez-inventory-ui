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

export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'items', children: ItemsRoutes },
    { path: 'stock', children: stockRoutes },
    { path: 'purchases', children: PurchasesRoutes },
    { path: 'sales', children: SalesRoutes },
    { path: 'reports', children: ReportsRoutes },
    { path: 'contacts', children: contactsRoutes },
    { path: 'employee', children: employeeManagementRoutes },
    { path: 'documents', children: DocumentsRoutes },
    { path: 'settings', component: SettingsComponent },
    // auth routes
    { path: 'auth', component: AuthComponent },
    // admin routes
    { path: 'admin/user-management', component: UserManagementComponent },
    { path: 'forbidden', component: ForbiddenComponent },
];
