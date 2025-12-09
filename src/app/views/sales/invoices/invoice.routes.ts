import { Routes } from '@angular/router';
import { InvoicesComponent } from './invoices.component';
import { InvoiceFormComponent } from './invoice-form/invoice-form.component';
import { InvoiceAdapterComponent } from './invoice-adapter.component';



export const InvoiceRoutes: Routes = [
    {
        path: '',
        component: InvoiceAdapterComponent,
        children: [
            { path: '', component: InvoicesComponent },
            { path: 'create', component: InvoiceFormComponent },
            { path: 'edit/:id', component: InvoiceFormComponent },
            { path: '', redirectTo: 'employee', pathMatch: 'full' },
        ]
    }
];
