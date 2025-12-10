import { Routes } from '@angular/router';
import { SalesOrderRoutes } from './sales-order/sales-order.routes';
import { InvoiceRoutes } from './invoices/invoice.routes';


export const SalesRoutes: Routes = [
    { path: 'order', children: SalesOrderRoutes },
    { path: 'invoice', children: InvoiceRoutes }
];
