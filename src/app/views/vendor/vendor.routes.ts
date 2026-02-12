import { Routes } from "@angular/router";
import { VendorDashboardComponent } from "./vendor-dashboard/vendor-dashboard.component";
import { NewOrdersComponent } from "./new-orders/new-orders.component";
import { NewOrderFormComponent } from "./new-orders/new-order-form/new-order-form.component";


export const vendorRoutes: Routes = [

    { path: 'dashboard', component: VendorDashboardComponent },
    { path: 'new-orders', component: NewOrdersComponent },
    { path: 'new-orders/form/:id', component: NewOrderFormComponent },
];