import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { DrawerService } from '../../layouts/components/drawer/drawerService';
import { ToastService } from '../../layouts/components/toast/toastService';
import { ContactService } from './contacts.service';
import { ContactFilter, ContactModel } from './contacts.model';
import { SmartTableComponent, TableColumn } from "../../layouts/components/smart-table/smart-table.component";
import { TableToolbarComponent } from "../../layouts/components/table-toolbar/table-toolbar.component";

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SmartTableComponent, TableToolbarComponent],
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.css']
})
export class ContactsComponent implements OnInit {
  @ViewChild('contactFormTemplate') formTemplate!: TemplateRef<any>;

  contacts: ContactModel[] = [];
  filteredContacts: ContactModel[] = [];
  contact?: ContactModel;
  contactFilter: ContactFilter = new ContactFilter();
  contactForm: FormGroup;

  searchTerm = '';

  activeTab: 'ALL' | 'CUSTOMER' | 'SUPPLIER' = 'ALL';
  tabs = [
    { id: 'ALL', label: 'All Contacts' },
    { id: 'CUSTOMER', label: 'Customers' },
    { id: 'SUPPLIER', label: 'Suppliers' }
  ];

  isEditing = false;
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

    // { key: 'employee', label: 'Employee name', type: 'user-profile', sortable: true, minWidth: '250px' },
    // { key: 'amount', label: 'Amount', type: 'currency', sortable: true },
    // { key: 'releaseAmount', label: 'Release amount', type: 'currency', sortable: true },
    // { key: 'date', label: 'Salary month', type: 'date', sortable: true },
    // { key: 'status', label: 'Status', type: 'status', sortable: true },
    // { key: 'actions', label: 'Actions', type: 'actions' }
  ];


  constructor(
    private fb: FormBuilder,
    private contactService: ContactService,
    public drawerService: DrawerService,
    private toast: ToastService
  ) {
    this.contactForm = this.fb.group({
      contactCode: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      gstNumber: [''],
      type: ['CUSTOMER', Validators.required],
      active: [true]
    });
  }

  ngOnInit() {
    this.getAllContacts();
  }

  // --- CRUD Logic ---

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

  onToolbarAction(action: 'export' | 'create') {
    console.log('Action triggered:', action);
    if (action === 'create') {
        // Logic to open create modal
        alert('Open Create Modal');
    }
  }

}