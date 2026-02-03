import { Routes } from '@angular/router';
import { UserManagementAdapterComponent } from './user-management-adapter.component';
import { UserFormComponent } from './user-form/user-form.component';
import { TenantsComponent } from './tenants/tenants.component';
import { ApplicationsComponent } from './applications/applications.component';
import { UserManagementComponent } from './user-management.component';
import { TenantFormComponent } from './tenants/tenant-form/tenant-form.component';

export const UserManagementRoutes: Routes = [
    {
        path: '',
        component: UserManagementAdapterComponent,
        children: [
            { path: '', redirectTo: 'users', pathMatch: 'full' },
            {
                path: 'tenants',
                children: [
                    { path: '', component: TenantsComponent },
                    { path: 'form', component: TenantFormComponent },
                    { path: 'form/:id', component: TenantFormComponent }
                ]
            },
            {
                path: 'users',
                children: [
                    { path: '', component: UserManagementComponent },
                    { path: 'form', component: UserFormComponent },
                    { path: 'form/:id', component: UserFormComponent },

                ]
            },
            { path: 'apps', component: ApplicationsComponent },
        ]
    },
];
