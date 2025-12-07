import { Routes } from "@angular/router";
import { PurchaseOrderAdapterComponent } from "./purchase-order-adapter.component";
import { PurchaseOrderComponent } from "./purchase-order.component";
import { PurchaseOrderFormComponent } from "./purchase-order-form/purchase-order-form.component";


export const PurchasesOrderRoutes: Routes = [
    {
        path: '',
        component: PurchaseOrderAdapterComponent,
        children: [
            { path: '', component: PurchaseOrderComponent },
            { path: 'create', component: PurchaseOrderFormComponent },
            { path: 'edit/:id', component: PurchaseOrderFormComponent },
        ]
    }
];

