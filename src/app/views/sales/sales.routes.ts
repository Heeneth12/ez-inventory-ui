import { Routes } from '@angular/router';
import { SalesOrderRoutes } from './sales-order/sales-order.routes';
import { InvoiceRoutes } from './invoices/invoice.routes';
import { DeliveryRoutes } from './delivery/delivery.routes';
import { PaymentRoutes } from './payments/payment.routes';


export const SalesRoutes: Routes = [
    { path: 'order', children: SalesOrderRoutes },
    { path: 'invoice', children: InvoiceRoutes },
    { path: 'delivery', children: DeliveryRoutes },
    { path: 'payments', children: PaymentRoutes },

    { path: '', redirectTo: 'order', pathMatch: 'full' }
];
