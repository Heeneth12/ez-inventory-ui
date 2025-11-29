import { Routes } from '@angular/router';
import { SalesOrderFormComponent } from './sales-order-form/sales-order-form.component';
import { SalesOrderComponent } from './sales-order.component';


export const SalesOrderRoutes: Routes = [
    { path: '', component: SalesOrderComponent },
    { path: 'add', component: SalesOrderFormComponent },
    { path: 'edit/:id', component: SalesOrderFormComponent },
];
