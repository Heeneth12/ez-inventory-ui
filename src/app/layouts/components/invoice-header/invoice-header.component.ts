import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, filter, switchMap, tap, finalize, of, catchError, Observable } from 'rxjs';
import { ContactModel, ContactFilter, ContactType } from '../../../views/contacts/contacts.model';
import { ContactService } from '../../../views/contacts/contacts.service';
import { AuthService } from '../../guards/auth.service';
import { UserInitResponse } from '../../models/Init-response.model';
import { User, CheckCircle, Phone, Mail, MapPin, Search, Loader2, Building2, Store, LucideAngularModule } from 'lucide-angular';
import { Router } from '@angular/router';


@Component({
  selector: 'app-invoice-header',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './invoice-header.component.html'
})
export class InvoiceHeaderComponent implements OnInit {

  // Inputs: Allow parent to pass in an existing contact (e.g. Edit Mode)
  @Input() selectedContact: ContactModel | null = null;
  @Input() searchType: 'CUSTOMER' | 'SUPPLIER' | 'BOTH' = 'BOTH'
  
  // Outputs: Tell parent when a contact is chosen or cleared
  @Output() contactSelected = new EventEmitter<ContactModel>();
  @Output() contactCleared = new EventEmitter<void>();

  // Search State
  searchTerm: string = '';
  searchResults: ContactModel[] = [];
  isSearching: boolean = false;
  showResults: boolean = false;

  // Use Observable for AsyncPipe in template (Best Practice)
  userData$: Observable<UserInitResponse | null>;

  // Status Logic
  status: 'online' | 'away' | 'dnd' = 'online';
  isDND = false;

  readonly User = User;
  readonly CheckCircle = CheckCircle;
  readonly Phone = Phone;
  readonly Mail = Mail;
  readonly MapPin = MapPin;
  readonly Search = Search;
  readonly Loader2 = Loader2;
  readonly Building2 = Building2;
  readonly Store = Store;


  private searchSubject = new Subject<string>();

  constructor(private contactService: ContactService, private authSvs: AuthService, private router: Router) {
    this.userData$ = this.authSvs.currentUser$;
  }

  ngOnInit(): void {
    this.setupSearchPipeline();
  }

  // --- Search Logic ---
  private setupSearchPipeline() {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      filter(query => {
        const isValid = query.length >= 2;
        if (!isValid) {
          this.searchResults = [];
          this.showResults = false;
        }
        return isValid;
      }),
      tap(() => {
        this.isSearching = true;
        this.showResults = true;
      }),
      switchMap(query => {
        const filter = new ContactFilter();
        filter.searchQuery = query;

        if(this.searchType === 'SUPPLIER'){
          filter.type = ContactType.SUPPLIER;
        }else if(this.searchTerm === 'CUSTOMER') {
          filter.type = ContactType.CUSTOMER;
        }

        // Convert Service Call to Observable
        return new Promise<ContactModel[]>((resolve) => {
          this.contactService.searchContacts(filter, 
            (res: any) => resolve(res.data || []),
            () => resolve([])
          );
        });
      }),
      finalize(() => this.isSearching = false)
    ).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.isSearching = false;
      },
      error: () => {
        this.isSearching = false;
        this.searchResults = [];
      }
    });
  }

  // --- UI Actions ---

  onSearchInput(value: string) {
    this.searchTerm = value;
    this.searchSubject.next(value);
  }

  selectContact(contact: ContactModel) {
    this.selectedContact = contact;
    this.showResults = false;
    this.searchTerm = '';
    this.contactSelected.emit(contact);
  }

  clearContact() {
    this.selectedContact = null;
    this.searchTerm = '';
    this.contactCleared.emit();
  }

  // --- Helpers ---

  closeDropdown() {
    // Small delay to allow click event to register
    setTimeout(() => this.showResults = false, 200);
  }

  getFormattedAddress(): string {
    if (!this.selectedContact?.addresses?.length) return '';
    // Logic to find Billing address or default to first
    const addr = this.selectedContact.addresses.find(a => a.type === 'BILLING') || this.selectedContact.addresses[0];
    return `${addr.city}, ${addr.state}`;
  }

  moveToContactPage() {
    this.router.navigate(['/contacts/createa']);
  }
}