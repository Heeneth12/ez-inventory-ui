import { Routes } from "@angular/router";
import { VendorDashboardComponent } from "./vendor-dashboard/vendor-dashboard.component";
import { NewOrdersComponent } from "./new-orders/new-orders.component";


export const vendorRoutes: Routes = [

    { path: 'dashboard', component: VendorDashboardComponent },
    { path: 'new-orders', component: NewOrdersComponent },
];