import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { DrawerService } from '../../layouts/components/drawer/drawerService';
import { ToastService } from '../../layouts/components/toast/toastService';

// 1. Interfaces based on your Java Entity
export enum ContactType {
  CUSTOMER = 'CUSTOMER',
  SUPPLIER = 'SUPPLIER',
  BOTH = 'BOTH'
}

export interface Contact {
  contactCode: string;
  name: string;
  email: string;
  phone: string;
  gstNumber: string;
  type: ContactType;
  active: boolean;
  // UI helper props
  avatarColor?: string;
  initials?: string;
}

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.css']
})
export class ContactsComponent implements OnInit {
  @ViewChild('contactFormTemplate') formTemplate!: TemplateRef<any>;

  contacts: Contact[] = [];
  filteredContacts: Contact[] = [];
  contactForm: FormGroup;
  
  // Filters
  searchTerm = '';
  activeTab: 'ALL' | 'CUSTOMER' | 'SUPPLIER' = 'ALL';
  tabs = [
    { id: 'ALL', label: 'All Contacts' },
    { id: 'CUSTOMER', label: 'Customers' },
    { id: 'SUPPLIER', label: 'Suppliers' }
  ];

  isEditing = false;
  editingId: string | null = null;

  constructor(
    private fb: FormBuilder,
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
    this.loadMockData();
    this.applyFilters();
  }

  // --- CRUD Logic ---

  openForm(contact?: Contact) {
    this.isEditing = !!contact;
    this.editingId = contact ? contact.contactCode : null;

    if (contact) {
      this.contactForm.patchValue(contact);
    } else {
      this.contactForm.reset({
        contactCode: this.generateCode(),
        type: 'CUSTOMER',
        active: true
      });
    }

    this.drawerService.open(
      this.formTemplate, 
      this.isEditing ? 'Edit Contact' : 'New Contact',
    );
  }

  saveContact() {
    if (this.contactForm.invalid) return;

    const formVal = this.contactForm.value;
    // Helper to generate visuals
    const enhancedData: Contact = {
      ...formVal,
      initials: formVal.name.substring(0, 2).toUpperCase(),
      avatarColor: this.getRandomColor()
    };

    if (this.isEditing) {
      // Update
      const index = this.contacts.findIndex(c => c.contactCode === this.editingId);
      if (index !== -1) {
        this.contacts[index] = enhancedData;
        this.toast.show('Contact updated successfully', 'success');
      }
    } else {
      // Create
      this.contacts.unshift(enhancedData);
      this.toast.show('New contact created', 'success');
    }

    this.applyFilters();
    this.drawerService.close();
  }

  deleteContact(contact: Contact) {
    if(confirm(`Are you sure you want to delete ${contact.name}?`)) {
      this.contacts = this.contacts.filter(c => c.contactCode !== contact.contactCode);
      this.applyFilters();
      this.toast.show('Contact deleted', 'info');
    }
  }

  toggleStatus(contact: Contact) {
    contact.active = !contact.active;
    this.toast.show(`${contact.name} is now ${contact.active ? 'Active' : 'Inactive'}`, 'info');
  }

  // --- Filtering Logic ---

  applyFilters() {
    this.filteredContacts = this.contacts.filter(c => {
      // 1. Tab Filter
      const matchesType = this.activeTab === 'ALL' || 
                          c.type === this.activeTab || 
                          c.type === 'BOTH'; // Both usually shows in both tabs

      // 2. Search Filter
      const term = this.searchTerm.toLowerCase();
      const matchesSearch = c.name.toLowerCase().includes(term) || 
                            c.email.toLowerCase().includes(term) || 
                            c.contactCode.toLowerCase().includes(term);

      return matchesType && matchesSearch;
    });
  }

  // --- Helpers for UI ---

  getTypeBadgeClass(type: ContactType): string {
    switch (type) {
      case ContactType.CUSTOMER: return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case ContactType.SUPPLIER: return 'bg-purple-50 text-purple-700 border-purple-200';
      case ContactType.BOTH: return 'bg-teal-50 text-teal-700 border-teal-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  getTypeDotClass(type: ContactType): string {
    switch (type) {
      case ContactType.CUSTOMER: return 'bg-indigo-500';
      case ContactType.SUPPLIER: return 'bg-purple-500';
      case ContactType.BOTH: return 'bg-teal-500';
      default: return 'bg-gray-500';
    }
  }

  generateCode() {
    return 'C-' + Math.floor(1000 + Math.random() * 9000);
  }

  getRandomColor() {
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  loadMockData() {
    this.contacts = [
      { contactCode: 'C-1023', name: 'Acme Corp', email: 'billing@acme.com', phone: '+1 555-0101', gstNumber: '29ABCDE1234F1Z5', type: ContactType.CUSTOMER, active: true, initials: 'AC', avatarColor: '#6366f1' },
      { contactCode: 'S-4021', name: 'Global Supplies Inc', email: 'sales@globalsupplies.com', phone: '+1 555-0202', gstNumber: '19XYZDE1234F1Z1', type: ContactType.SUPPLIER, active: true, initials: 'GS', avatarColor: '#8b5cf6' },
      { contactCode: 'B-9901', name: 'Tech Solutions Ltd', email: 'contact@techsol.com', phone: '+1 555-0303', gstNumber: '07PQRST1234F1Z9', type: ContactType.BOTH, active: false, initials: 'TS', avatarColor: '#10b981' },
    ];
  }
}