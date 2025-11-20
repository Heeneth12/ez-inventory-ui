import { Routes } from '@angular/router';
import { InventoryLayoutComponent } from './layouts/components/inventory-layout/inventory-layout.component';
import { ForbiddenComponent } from './views/forbidden/forbidden.component';
import { DashboardComponent } from './views/dashboard/dashboard.component';

export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'inventory', component: InventoryLayoutComponent },
    { path: 'forbidden', component: ForbiddenComponent },
];
