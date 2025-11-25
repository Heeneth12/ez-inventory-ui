import { Routes } from "@angular/router";
import { ContactsComponent } from "./contacts.component";
import { ContactFormComponent } from "./contact-form/contact-form.component";


export const contactsRoutes: Routes = [

    { path: '', redirectTo: '', pathMatch: 'full' },
    { path: '', component: ContactsComponent },
    { path: 'create', component: ContactFormComponent },
    { path: 'edit/:id', component: ContactFormComponent },

]