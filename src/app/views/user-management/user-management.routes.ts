import { Routes } from '@angular/router';
import { UserManagementAdapterComponent } from './user-management-adapter.component';
import { UserManagementComponent } from './user-management.component';
import { UserFormComponent } from './user-form/user-form.component';
import { TenantsComponent } from './tenants/tenants.component';
import { ApplicationsComponent } from './applications/applications.component';

export const UserManagementRoutes: Routes = [
    {
        path: '',
        component: UserManagementAdapterComponent,
        children: [
            { path: 'tenant', component: UserManagementComponent },
            { path: 'app', component: ApplicationsComponent },
            { path: 'create', component: UserFormComponent },
            { path: 'edit/:id', component: UserFormComponent },
            { path: 'tenants', component: TenantsComponent },
        ]
    },
];
