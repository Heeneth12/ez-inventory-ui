import { Routes } from '@angular/router';
import { UserManagementAdapterComponent } from './user-management-adapter.component';
import { UserFormComponent } from './user-form/user-form.component';
import { TenantsComponent } from './tenants/tenants.component';
import { ApplicationsComponent } from './applications/applications.component';
import { UserManagementComponent } from './user-management.component';

export const UserManagementRoutes: Routes = [
    {
        path: '',
        component: UserManagementAdapterComponent,
        children: [
            { path: '', redirectTo: 'tenants', pathMatch: 'full' },
            { path: 'tenants', component: TenantsComponent },
            { path: 'apps', component: ApplicationsComponent },
            { path: 'users', component: UserManagementComponent },
        ]
    },
];
