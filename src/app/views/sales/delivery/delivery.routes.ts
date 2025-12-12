import { Routes } from '@angular/router';
import { DeliveryAdapterComponent } from './delivery-adapter.component';
import { DeliveryComponent } from './delivery.component';



export const DeliveryRoutes: Routes = [
    {
        path: '',
        component: DeliveryAdapterComponent,
        children: [
            { path: '', component: DeliveryComponent },
            { path: 'todo', component: DeliveryComponent },
        ]
    }
];
