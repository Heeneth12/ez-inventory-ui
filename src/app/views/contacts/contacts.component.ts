import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { DrawerService } from '../../layouts/components/drawer/drawerService';
import { ToastService } from '../../layouts/components/toast/toastService';
import { ContactService } from './contacts.service';
import { ContactFilter, ContactModel } from './contacts.model';
import { SmartTableComponent, TableColumn } from "../../layouts/components/smart-table/smart-table.component";
import { TableToolbarComponent } from "../../layouts/components/table-toolbar/table-toolbar.component";
import { Router } from '@angular/router';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SmartTableComponent, TableToolbarComponent],
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.css']
})
export class ContactsComponent implements OnInit {
  @ViewChild('contactProfile') contactProfile!: TemplateRef<any>;

  contacts: ContactModel[] = [];
  filteredContacts: ContactModel[] = [];
  contact?: ContactModel;
  contactFilter: ContactFilter = new ContactFilter();
  searchTerm = '';

  activeTab: 'ALL' | 'CUSTOMER' | 'SUPPLIER' = 'ALL';
  tabs = [
    { id: 'ALL', label: 'All Contacts' },
    { id: 'CUSTOMER', label: 'Customers' },
    { id: 'SUPPLIER', label: 'Suppliers' }
  ];

  editingId: number | null = null;

  tableColumns: TableColumn[] = [
    { key: 'id', label: 'Sl No', type: 'index', sortable: false },
    { key: 'name', label: 'Name', type: 'user-profile', sortable: true, minWidth: '250px' },
    { key: 'contactCode', label: 'Contact Code', type: 'text', sortable: true },
    { key: 'name', label: 'Name', type: 'text', sortable: true },
    { key: 'email', label: 'Email', type: 'text', sortable: true },
    { key: 'phone', label: 'Phone', type: 'text', sortable: true },
    { key: 'gstNumber', label: 'GST Number', type: 'text', sortable: true },
    { key: 'type', label: 'Type', type: 'text', sortable: true },
    { key: 'actions', label: 'Actions', type: 'actions' }
  ];


  constructor(
    private contactService: ContactService,
    public drawerService: DrawerService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit() {
    this.getAllContacts();
  }

  getAllContacts() {
    this.contactService.getContacts(0, 100, {},
      (response: any) => {
        this.contacts = response.data.content;
        this.filteredContacts = [...this.contacts];
      },
      (error: any) => {
        this.toast.show('Failed to load contacts', 'error');
      }
    );
  }

  getContactById(id: number) {
    this.contactService.getContactById(id,
      (response: any) => {
        this.contact = response.data;
      },
      (error: any) => {
        this.toast.show('Failed to load contact details', 'error');
      }
    );
  }

  createContact(contact: ContactModel) {
    this.contactService.createContact(contact,
      (response: any) => {
        if (response && response.data) {
          this.toast.show('Contact created successfully', 'success');
          this.contacts.push(response.data);
        }
      },
      (error: any) => {
        this.toast.show('Failed to create contact', 'error');
      }
    );
  }

  updateContact(contact: ContactModel) {
    this.contactService.updateContact(contact,
      (response: any) => {  
        this.toast.show('Contact updated successfully', 'success');
        const index = this.contacts.findIndex(c => c.id === contact.id);
        if (index !== -1) {
          this.contacts[index] = response.data;
        }
      },
      (error: any) => {
        this.toast.show('Failed to update contact', 'error');
      }
    );
  }

  toggleStatus(active: boolean, id: number) {
    this.contactService.toggleContactStatus(id, active,
      (response: any) => {
        this.toast.show('Contact status updated', 'success'); 
      },
      (error: any) => {
        this.toast.show('Failed to update contact status', 'error');
      }
    );
  }


   // Event Handlers
  onTabChange() {
   
  }


  
  // export const contactsRoutes: Routes = [
  
  //     { path: '', redirectTo: '', pathMatch: 'full' },
  //     { path: '', component: ContactsComponent },
  //     { path: 'create', component: ContactFormComponent },
  //     { path: 'edit/:id', component: ContactFormComponent },
  
  // ]
  openEditContact(contactId: number) {
    this.editingId = contactId;
    this.router.navigate(['/contacts/edit', 1]);

  }

  onToolbarAction(action: 'export' | 'create') {
    console.log('Action triggered:', action);
    if (action === 'create') {
        // Logic to open create modal
        alert('Open Create Modal');
    }
  }

}