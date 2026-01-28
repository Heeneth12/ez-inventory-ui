import { Routes } from "@angular/router";
import { ContactsComponent } from "./contacts.component";
import { ContactFormComponent } from "./contact-form/contact-form.component";
import { ContactsManagementComponent } from "./contacts-management.component";
import { ContactProfileComponent } from "./contact-profile/contact-profile.component";
import { MyNetworkComponent } from "./my-network/my-network.component";


export const contactsRoutes: Routes = [
    {
        path: '',
        component: ContactsManagementComponent,
        children: [
            { path: '', component: ContactsComponent },
            { path: 'create', component: ContactFormComponent },
            { path: 'edit/:id', component: ContactFormComponent },
            { path: 'network', component: MyNetworkComponent },
        ]
    },
    { path: 'profile/:id', component: ContactProfileComponent },
]