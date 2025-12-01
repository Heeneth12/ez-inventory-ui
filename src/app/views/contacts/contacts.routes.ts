import { Routes } from "@angular/router";
import { ContactsComponent } from "./contacts.component";
import { ContactFormComponent } from "./contact-form/contact-form.component";
import { ContactsManagementComponent } from "./contacts-management.component";


export const contactsRoutes: Routes = [
    {
        path: '',
        component: ContactsManagementComponent,
        children: [
            { path: '', component: ContactsComponent },
            { path: 'create', component: ContactFormComponent },
            { path: 'edit/:id', component: ContactFormComponent },
            { path: '', redirectTo: 'employee', pathMatch: 'full' },
        ]
    }
]