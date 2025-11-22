import { Routes } from '@angular/router';
import { ItemsComponent } from './items.component';
import { AddItemsComponent } from './add-items/add-items.component';

export const ItemsRoutes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: '', component: ItemsComponent },
    { path: "add", component: AddItemsComponent },
];
