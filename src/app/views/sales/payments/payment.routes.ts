import { Routes } from '@angular/router';
import { PaymentAdapterComponent } from './payment-adapter.component';
import { PaymentsComponent } from './payments.component';


export const PaymentRoutes: Routes = [
    {
        path: '',
        component: PaymentAdapterComponent,
        children: [
            { path: '', component: PaymentsComponent },
        ]
    }
];
