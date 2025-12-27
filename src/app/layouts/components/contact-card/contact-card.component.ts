import { Component, Input } from '@angular/core';
import { Mail, MapPin, Phone, Building, FileText, ShoppingCart, CreditCard, StickyNote, ArrowUpRight, ArrowDownLeft, Clock, Home, Users, MapPinCheckIcon, ChevronDown, UserSquare, Pencil, User, Fingerprint, Calendar, Hash, Plus, Star, LucideAngularModule, PlusIcon } from 'lucide-angular';
import { ContactModel } from '../../../views/contacts/contacts.model';
import { ContactService } from '../../../views/contacts/contacts.service';
import { PaymentService } from '../../../views/sales/payments/payment.service';
import { ToastService } from '../toast/toastService';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './contact-card.component.html',
  styleUrl: './contact-card.component.css'
})
export class ContactCardComponent {

  //contactDetails
  @Input() contactId: number | string | null = null;
  contactDetails: ContactModel | null = null;

  financialSummary: any = {
    totalOutstandingAmount: 0,
    walletBalance: 0
  };
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
  readonly ArrowUpRight = ArrowUpRight;
  readonly ArrowDownLeft = ArrowDownLeft;
  readonly Clock = Clock;
  readonly Home = Home;
  readonly Users = Users;
  readonly Location = MapPinCheckIcon
  readonly ChevronDown = ChevronDown;
  readonly UserSquare = UserSquare;
  readonly Pencil = Pencil;
  readonly User = User;
  readonly Fingerprint = Fingerprint;
  readonly Hash = Hash;
  readonly Plus = PlusIcon;

  constructor(
    private contactService: ContactService,
    private paymentService: PaymentService,
    private toast: ToastService,
  ) { }

  ngOnInit() {
    if (this.contactId != null) {
      this.getContactDetails(this.contactId);
    }
  }

  ngOnChanges() {
    if (this.contactId) {
      this.getContactDetails(this.contactId);
    }
  }

  getContactDetails(id: number | string) {
    this.isLoading = true;
    this.contactService.getContactById(id,
      (response: any) => {
        this.contactDetails = response.data;
        this.isLoading = false;
      },
      (error: any) => {
        this.isLoading = false;
      }
    );
  }

  getFinancialSummary(id: number) {
    this.paymentService.getCustomerSummary(id,
      (res: any) => {
        this.financialSummary = res.data;
      },
      (err: any) => console.error("Could not load summary", err)
    );
  }

  // Method to handle PDF Receipt download
  downloadReceipt(paymentId: number) {
    this.paymentService.downloadPaymentPdf(paymentId, (res: any) => {
      // Logic to open blob as PDF
      const blob = new Blob([res], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url);
    }, (err: any) => this.toast.show("Error generating PDF", "error"));
  }

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

  get locationDisplay(): string {
    if (!this.contactDetails?.addresses?.length) return 'Location not set';
    const addr = this.contactDetails.addresses[0];
    return `${addr.city}, ${addr.state}`;
  }
}
