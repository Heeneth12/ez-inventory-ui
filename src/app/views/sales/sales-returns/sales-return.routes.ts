import { Routes } from '@angular/router';
import { SalesReturnsComponent } from './sales-returns.component';
import { SalesReturnformComponent } from './sales-returnform/sales-returnform.component';
import { SalesReturnAdapterComponent } from './sales-retrun-adapter.component';


export const SalesReturnRoutes: Routes = [
    {
        path: '',
        component: SalesReturnAdapterComponent,
        children: [
            { path: '', component: SalesReturnsComponent },
            { path: 'create', component: SalesReturnformComponent },
            { path: '', redirectTo: '', pathMatch: 'full' },
        ]
    }
];
