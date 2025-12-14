import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { ContactService } from '../contacts.service';
import { ToastService } from '../../../layouts/components/toast/toastService';
import { ContactModel } from '../contacts.model';
import { LucideAngularModule, Mail, MapPin, Phone, Building, FileText, ShoppingCart, CreditCard, StickyNote, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-angular';

@Component({
  selector: 'app-contact-profile',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, CurrencyPipe, DatePipe, DecimalPipe],
  templateUrl: './contact-profile.component.html',
})
export class ContactProfileComponent implements OnInit {

  contactDetails: ContactModel | null = null;
  activeTab: string = 'overview';
  isLoading = true;

  // Icons
  readonly Mail = Mail;
  readonly MapPin = MapPin;
  readonly Phone = Phone;
  readonly Building = Building;
  readonly FileText = FileText;
  readonly ShoppingCart = ShoppingCart;
  readonly CreditCard = CreditCard;
  readonly StickyNote = StickyNote;
  readonly ArrowUpRight = ArrowUpRight; // For Money In
  readonly ArrowDownLeft = ArrowDownLeft; // For Money Out
  readonly Clock = Clock;

  // Mock Financial Data (Replace with real API data later)
  financialStats = {
    balance: 12450.00,
    overdue: 2100.00,
    creditLimit: 50000.00,
    unusedCredits: 450.00,
    totalSales: 154000.00, // For Customer
    totalPurchases: 89000.00 // For Vendor
  };

  constructor(
    private contactService: ContactService,
    private toast: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.getContactDetails(Number(id));
    } else {
      this.router.navigate(['/contacts']);
    }
  }

  getContactDetails(id: number) {
    this.isLoading = true;
    this.contactService.getContactById(id,
      (response: any) => {
        this.contactDetails = response.data;
        // Logic to switch default tab based on type if needed
        this.isLoading = false;
      },
      (error: any) => {
        this.toast.show('Failed to load contact details.', 'error');
        this.isLoading = false;
      }
    );
  }

  // --- Computed Properties ---

  get isCustomer(): boolean {
    return this.contactDetails?.type === 'CUSTOMER';
  }

  get theme() {
    // Blue/Indigo for Customer (Receivable), Orange/Amber for Vendor (Payable)
    return this.isCustomer 
      ? { 
          bg: 'bg-indigo-600', 
          light: 'bg-indigo-50', 
          text: 'text-indigo-600', 
          border: 'border-indigo-200', 
          badge: 'bg-indigo-100 text-indigo-700' 
        } 
      : { 
          bg: 'bg-orange-500', 
          light: 'bg-orange-50', 
          text: 'text-orange-600', 
          border: 'border-orange-200', 
          badge: 'bg-orange-100 text-orange-700' 
        };
  }

  get tabs() {
    const common = [
      { id: 'overview', label: 'Overview', icon: this.FileText },
      { id: 'payments', label: 'Payments', icon: this.CreditCard },
      { id: 'notes', label: 'Notes', icon: this.StickyNote }
    ];

    if (this.isCustomer) {
      return [
        common[0], // Overview
        { id: 'sales_orders', label: 'Sales Orders', icon: this.ShoppingCart },
        { id: 'invoices', label: 'Invoices', icon: this.FileText },
        ...common.slice(1)
      ];
    } else {
      return [
        common[0], // Overview
        { id: 'purchase_orders', label: 'Purchase Orders', icon: this.ShoppingCart },
        { id: 'bills', label: 'Bills', icon: this.FileText },
        ...common.slice(1)
      ];
    }
  }

  get locationDisplay(): string {
    if (!this.contactDetails?.addresses?.length) return 'Location not set';
    const addr = this.contactDetails.addresses[0];
    return `${addr.city}, ${addr.state}`;
  }
}