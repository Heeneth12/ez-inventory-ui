import { Routes } from '@angular/router';
import { ForbiddenComponent } from './views/forbidden/forbidden.component';
import { DashboardComponent } from './views/dashboard/dashboard.component';
import { ItemsRoutes } from './views/items/items.routes';
import { InventoryRoutes } from './views/inventory/inventory.routes';
import { PurchasesRoutes } from './views/purchases/purchases.routes';
import { SalesRoutes } from './views/sales/sales.routes';
import { ReportsRoutes } from './views/reports/reports.routes';
import { DocumentsRoutes } from './views/documents/documents.routes';
import { AuthComponent } from './views/auth/auth.component';
import { UserManagementComponent } from './views/user-management/user-management.component';
import { ContactsComponent } from './views/contacts/contacts.component';

export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'items', children: ItemsRoutes },
    { path: 'inventory', children: InventoryRoutes },
    { path: 'purchases', children: PurchasesRoutes },
    { path: 'sales', children: SalesRoutes },
    { path: 'reports', children: ReportsRoutes },
    { path: 'contacts', component: ContactsComponent },
    { path: 'documents', children: DocumentsRoutes },
    { path: 'auth', component: AuthComponent },
    // admin routes
    { path: 'admin/user-management', component: UserManagementComponent },
    { path: 'forbidden', component: ForbiddenComponent },
];
