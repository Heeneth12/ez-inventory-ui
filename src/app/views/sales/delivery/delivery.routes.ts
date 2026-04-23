import { Routes } from '@angular/router';
import { DeliveryAdapterComponent } from './delivery-adapter.component';
import { DeliveryComponent } from './delivery.component';
import { RoutesComponent } from './routes/routes.component';
import { DeliveryDetailsComponent } from './delivery-details/delivery-details.component';



export const DeliveryRoutes: Routes = [
    {
        path: '',
        component: DeliveryAdapterComponent,
        children: [
            { path: '', component: DeliveryComponent },
            { path: 'detail/:id', component: DeliveryDetailsComponent },
            { path: 'routes', component: RoutesComponent },
        ]
    }
];
