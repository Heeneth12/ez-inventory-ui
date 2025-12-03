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
    { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
    { path: 'items', children: ItemsRoutes, canActivate: [AuthGuard] },
    { path: 'stock', children: stockRoutes, canActivate: [AuthGuard] },
    { path: 'purchases', children: PurchasesRoutes, canActivate: [AuthGuard] },
    { path: 'sales', children: SalesRoutes, canActivate: [AuthGuard] },
    { path: 'reports', children: ReportsRoutes, canActivate: [AuthGuard] },
    { path: 'contacts', children: contactsRoutes, canActivate: [AuthGuard] },
    { path: 'employee', children: employeeManagementRoutes, canActivate: [AuthGuard] },
    { path: 'documents', children: DocumentsRoutes, canActivate: [AuthGuard] },
    { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] },
    // auth routes
    { path: 'login', component: AuthComponent },
    // admin routes
    { path: 'admin/user-management', component: UserManagementComponent },
    { path: 'forbidden', component: ForbiddenComponent },
];
