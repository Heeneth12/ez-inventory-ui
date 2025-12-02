import { Routes } from '@angular/router';
import { SalesComponent } from './sales.component';
import { InvoicesComponent } from './invoices/invoices.component';
import { SalesOrderRoutes } from './sales-order/sales-order.routes';


export const SalesRoutes: Routes = [
    { path: '', component: SalesComponent },
    { path: 'order', children: SalesOrderRoutes },
    { path: 'invoices', component: InvoicesComponent }
];
