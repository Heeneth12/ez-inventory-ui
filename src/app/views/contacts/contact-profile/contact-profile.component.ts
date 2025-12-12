import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ContactService } from '../contacts.service';
import { ToastService } from '../../../layouts/components/toast/toastService';
import { ContactModel } from '../contacts.model';

@Component({
  selector: 'app-contact-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact-profile.component.html',
})
export class ContactProfileComponent implements OnInit {

  contactDetails: ContactModel | null = null;
  activeTab: string = 'overview';
  isLoading = true;

  // Keep specific financial mocks separate until your API provides them
  financialMock = {
    balance: 12500.00,
    creditLimit: 20000.00,
    overdueAmount: 2500.00,
    ytdVolume: 120441.00
  };

  constructor(
    private contactService: ContactService,
    private toast: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    // 1. Get ID from URL
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
        this.isLoading = false;
      },
      (error: any) => {
        this.toast.show('Failed to load contact details.', 'error');
        this.isLoading = false;
      }
    );
  }

  // --- UI GETTERS (Mappers) ---

  // Safety check if we have data
  get hasData(): boolean {
    return !!this.contactDetails;
  }

  // Determine Primary Location from Address Array
  get locationDisplay(): string {
    if (!this.contactDetails?.addresses || this.contactDetails.addresses.length === 0) {
      return 'No Location Set';
    }
    const addr = this.contactDetails.addresses[0];
    return `${addr.city}, ${addr.state}`;
  }

  // Check type for UI Styling
  get isCustomer(): boolean {
    return this.contactDetails?.type === 'CUSTOMER';
  }

  // Dynamic Colors based on Real Data Type
  get theme() {
    return this.isCustomer 
      ? { text: 'text-orange-600', bg: 'bg-orange-600', light: 'bg-orange-50', badge: 'bg-orange-600' } 
      : { text: 'text-emerald-600', bg: 'bg-emerald-600', light: 'bg-emerald-50', badge: 'bg-emerald-600' };
  }

  get actionLabel() {
    return this.isCustomer ? 'Create Invoice' : 'Record Bill';
  }
}