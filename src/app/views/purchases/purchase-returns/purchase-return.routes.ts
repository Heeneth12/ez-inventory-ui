import { Routes } from "@angular/router";
import { PurchaseReturnsComponent } from "./purchase-returns.component";
import { PurchaseReturnFormComponent } from "./purchase-return-form/purchase-return-form.component";
import { PurchaseReturnAdapterComponent } from "./purchase-return-adapter.component";

export const PurchaseReturnRoutes: Routes = [
    {
        path: '',
        component: PurchaseReturnAdapterComponent,
        children: [
            { path: '', component: PurchaseReturnsComponent },
            { path: 'create', component: PurchaseReturnFormComponent },
            { path: 'edit/:id', component: PurchaseReturnFormComponent },
        ]
    }
];

