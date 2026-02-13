import { Routes } from "@angular/router";
import { VendorDashboardComponent } from "./vendor-dashboard/vendor-dashboard.component";
import { NewOrdersComponent } from "./new-orders/new-orders.component";
import { NewOrderFormComponent } from "./new-orders/new-order-form/new-order-form.component";
import { AsnComponent } from "./asn/asn.component";
import { VPurchaseReturnComponent } from "./v-purchase-return/v-purchase-return.component";


export const vendorRoutes: Routes = [

    { path: 'dashboard', component: VendorDashboardComponent },
    { path: 'new-orders', component: NewOrdersComponent },
    { path: 'asn', component: AsnComponent },
    { path: 'sales-returns', component: VPurchaseReturnComponent },
    { path: 'new-orders/form/:id', component: NewOrderFormComponent },
];