import { Routes } from '@angular/router';
import { UserManagementAdapterComponent } from './user-management-adapter.component';
import { UserManagementComponent } from './user-management.component';
import { UserFormComponent } from './user-form/user-form.component';
import { TenantsComponent } from './tenants/tenants.component';

export const UserManagementRoutes: Routes = [
    {
        path: 'user-management',
        component: UserManagementAdapterComponent,
        children: [
            { path: '', component: UserManagementComponent },
            { path: 'create', component: UserFormComponent },
            { path: 'edit/:id', component: UserFormComponent },
            { path: 'tenants', component: TenantsComponent },
        ]
    }
];
