import { Routes } from '@angular/router';
import { ItemsComponent } from './items.component';
import { AddItemsComponent } from './add-items/add-items.component';
import { ItemsManagementComponent } from './items-management.component';

export const ItemsRoutes: Routes = [
    {
        path: '',
        component: ItemsManagementComponent,
        children: [
            { path: '', component: ItemsComponent },
            { path: 'create', component: AddItemsComponent },
            { path: 'edit/:id', component: AddItemsComponent },
        ]
    }
];
