import { Routes } from '@angular/router';
import { DeliveryAdapterComponent } from './delivery-adapter.component';
import { DeliveryComponent } from './delivery.component';
import { RoutesComponent } from './routes/routes.component';



export const DeliveryRoutes: Routes = [
    {
        path: '',
        component: DeliveryAdapterComponent,
        children: [
            { path: '', component: DeliveryComponent },
            { path: 'routes', component: RoutesComponent },
        ]
    }
];
