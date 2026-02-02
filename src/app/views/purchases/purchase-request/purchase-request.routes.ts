import { Routes } from "@angular/router";
import { PurchaseRequestAdapterComponent } from "./purchase-request-adapter.component";
import { PurchaseRequestComponent } from "./purchase-request.component";
import { PurchaseRequestFormComponent } from "./purchase-request-form/purchase-request-form.component";


export const PurchasesRequestRoutes: Routes = [
    {
        path: '',
        component: PurchaseRequestAdapterComponent,
        children: [
            { path: '', component: PurchaseRequestComponent },
            { path: 'create', component: PurchaseRequestFormComponent },
            { path: 'edit/:id', component: PurchaseRequestFormComponent },
        ]
    }
];

