import { Routes } from '@angular/router';
import { SalesOrderRoutes } from './sales-order/sales-order.routes';
import { InvoiceRoutes } from './invoices/invoice.routes';
import { DeliveryComponent } from './delivery/delivery.component';


export const SalesRoutes: Routes = [
    { path: 'order', children: SalesOrderRoutes },
    { path: 'invoice', children: InvoiceRoutes },
    { path: 'delivery', component: DeliveryComponent }
];
