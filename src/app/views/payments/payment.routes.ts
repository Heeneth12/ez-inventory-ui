import { Routes } from '@angular/router';
import { PaymentAdapterComponent } from './payment-adapter.component';
import { PaymentsComponent } from './payments.component';
import { CreditNoteComponent } from './credit-note/credit-note.component';
import { AdvancePaymentComponent } from './advance-payment/advance-payment.component';


export const PaymentRoutes: Routes = [
    {
        path: '',
        component: PaymentAdapterComponent,
        children: [
            { path: '', component: PaymentsComponent },
            { path: 'advance', component: AdvancePaymentComponent },
            { path: 'credit-note', component: CreditNoteComponent },
        ]
    }
];
