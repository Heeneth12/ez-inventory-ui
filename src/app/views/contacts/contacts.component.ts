import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DrawerService } from '../../layouts/components/drawer/drawerService';
import { ToastService } from '../../layouts/components/toast/toastService';
import { ContactService } from './contacts.service';
import { ContactFilter, ContactModel } from './contacts.model';
import { Router } from '@angular/router';
import { HeaderAction, PaginationConfig, TableAction, TableActionConfig, TableColumn } from '../../layouts/components/standard-table/standard-table.model';
import { StandardTableComponent } from "../../layouts/components/standard-table/standard-table.component";
import { CONTACT_COLUMNS } from '../../layouts/config/tableConfig';
import { ArrowRight, Building2, Calendar, CheckCircle2, ChevronDown, CreditCard, FilePlusCorner, FileText, Mail, MapPin, Phone, User, UserPlus, XCircle, Zap, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, StandardTableComponent, LucideAngularModule],
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.css']
})
export class ContactsComponent implements OnInit {

  @ViewChild('contactDetailsTemplate') contactDetailsTemplate!: TemplateRef<any>;

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

  contactActions: TableActionConfig[] = [
    {
      key: 'view_contact_details',
      label: 'View Details',
      icon: ArrowRight,
      color: 'primary',
      condition: (row) => true
    }
  ];

  myHeaderActions: HeaderAction[] = [
    {
      label: 'Create',
      icon: UserPlus,
      variant: 'primary',
      action: () => console.log("hello")
    },
  ];

  columns: TableColumn[] = CONTACT_COLUMNS;

  readonly ArrowRight = ArrowRight;
  readonly UserPlus = UserPlus;
  readonly FilePlusCorner = FilePlusCorner;
  readonly Mail = Mail;
  readonly Phone = Phone;
  readonly MapPin = MapPin;
  readonly Building2 = Building2;
  readonly CreditCard = CreditCard;
  readonly CheckCircle2 = CheckCircle2;
  readonly XCircle = XCircle;
  readonly User = User;
  readonly FileText = FileText;
  readonly ChevronDown = ChevronDown;
  readonly Calendar = Calendar;
  readonly Zap = Zap;

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


  viewContactDetails(id: number) {
    this.getContactById(id);
    this.drawerService.openTemplate(
      this.contactDetailsTemplate,
      'Contact Details',
      'xl',
    );
  }

  handleTableAction(event: TableAction) {
    if (event.type === 'custom' && event.key === 'view_contact_details') {
      console.log('View stock adj details:', event.row.id);
      this.viewContactDetails(Number(event.row.id));
    }
    if (event.type === 'edit') {
      // Standard edit logic
    }
  }

  openEditContact(contactId: number) {
    this.editingId = contactId;
    this.drawerService.close();
    this.router.navigate(['/contacts/edit', 1]);

  }

  onToolbarAction(action: 'export' | 'create') {
    console.log('Action triggered:', action);
    if (action === 'create') {
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