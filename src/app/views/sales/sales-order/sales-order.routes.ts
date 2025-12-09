import { Routes } from '@angular/router';
import { SalesOrderAdapterComponent } from './sales-order-adapter.component';
import { SalesOrderComponent } from './sales-order.component';
import { SalesOrderFormComponent } from './sales-order-form/sales-order-form.component';


export const SalesOrderRoutes: Routes = [
    {
        path: '',
        component: SalesOrderAdapterComponent,
        children: [
            { path: '', component: SalesOrderComponent },
            { path: 'create', component: SalesOrderFormComponent },
            { path: 'edit/:id', component: SalesOrderFormComponent },
            { path: '', redirectTo: '', pathMatch: 'full' },
        ]
    }
];
