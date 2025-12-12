import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DrawerService } from '../../layouts/components/drawer/drawerService';
import { ToastService } from '../../layouts/components/toast/toastService';
import { ContactService } from './contacts.service';
import { ContactFilter, ContactModel } from './contacts.model';
import { Router } from '@angular/router';
import { PaginationConfig, TableAction, TableColumn } from '../../layouts/components/standard-table/standard-table.model';
import { StandardTableComponent } from "../../layouts/components/standard-table/standard-table.component";

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, StandardTableComponent],
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

  pagination: PaginationConfig = { pageSize: 20, currentPage: 1, totalItems: 0 };

  columns: TableColumn[] = [
    { key: 'id', label: 'ID', width: '60px', align: 'center', type: 'text' },
    { key: 'name', label: 'Contact Profile', width: '280px', type: 'profile' },
    { key: 'contactCode', label: 'Contact Code', type: 'text' },
    { key: 'type', label: 'Type', type: 'badge' },
    { key: 'phone', label: 'Contact Number', type: 'text' },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'active', label: 'Active', align: 'center', width: '80px', type: 'toggle' },
    { key: 'actions', label: 'Actions', align: 'center', width: '120px', type: 'action', sortable: false }
  ];


  constructor(
    private contactService: ContactService,
    public drawerService: DrawerService,
    private toast: ToastService,
    private router: Router
  ) { }

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

  onPageChange($event: number) {
    console.log('Page changed to:', $event);
  }

  onLoadMore() {
    console.log('Load more triggered');
  }

  openContactProfile(contactId: any) {
    this.router.navigate(['/contacts/profile', contactId]);
  }

  onTableAction(event: TableAction) {
    console.log("Table action event:", event);
    const { type, row, key } = event;

    switch (type) {

      case 'view':
        this.openContactProfile(row.id);
        console.log("View action for item:", row.id);
        break;

      case 'edit':
        console.log("Edit action for item:", row.id);
        break;

      case 'delete':
        console.log("Delete action for item:", row.id);
        break;

      case 'toggle':
        console.log("Toggle active status for item:", row.id, "New status:");
        break;

      default:
        console.warn("Unhandled table action:", event);
    }
  }
}