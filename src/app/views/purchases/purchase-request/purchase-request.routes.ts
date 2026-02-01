




import { Routes } from "@angular/router";
import { PurchaseRequestAdapterComponent } from "./purchase-request-adapter.component";
import { PurchaseRequestComponent } from "./purchase-request.component";


export const PurchasesRequestRoutes: Routes = [
    {
        path: '',
        component: PurchaseRequestAdapterComponent,
        children: [
            { path: '', component: PurchaseRequestComponent },
            // { path: 'create', component: PurchaseOrderFormComponent },
            // { path: 'edit/:id', component: PurchaseOrderFormComponent },
        ]
    }
];

