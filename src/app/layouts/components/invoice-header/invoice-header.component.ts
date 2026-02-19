import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, filter, switchMap, tap, finalize, of, catchError, Observable } from 'rxjs';
import { AuthService } from '../../guards/auth.service';
import { UserInitResponse } from '../../models/Init-response.model';
import { User, CheckCircle, Phone, Mail, MapPin, Search, Loader2, Building2, Store, LucideAngularModule, ChevronRight } from 'lucide-angular';
import { Router } from '@angular/router';
import { UserFilterModel, UserModel, UserType } from '../../../views/user-management/models/user.model';
import { UserManagementService } from '../../../views/user-management/userManagement.service';
import { TenantModel } from '../../../views/user-management/models/tenant.model';


@Component({
  selector: 'app-invoice-header',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './invoice-header.component.html'
})
export class InvoiceHeaderComponent implements OnInit, AfterViewInit {

  @ViewChild('searchInput') searchInput!: ElementRef;

  // Inputs: Allow parent to pass in an existing user (e.g. Edit Mode)
  @Input() selectedUser: UserModel | null = null;
  @Input() searchType: 'CUSTOMER' | 'VENDOR' | 'EMPLOYEE' = 'VENDOR'
  @Input() autoFocus: boolean = false;

  // Outputs: Tell parent when a user is chosen or cleared
  @Output() userSelected = new EventEmitter<UserModel>();
  @Output() userCleared = new EventEmitter<void>();

  // Search State
  searchTerm: string = '';
  searchResults: UserModel[] = [];
  isSearching: boolean = false;
  showResults: boolean = false;

  activeIndex: number = -1;

  userFilterModel: UserFilterModel = new UserFilterModel();

  // Use Observable for AsyncPipe in template (Best Practice)
  userData$: Observable<UserInitResponse | null>;
  tenantDetails: TenantModel | null = null;

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
  readonly ChevronRight = ChevronRight;


  private searchSubject = new Subject<string>();

  constructor(private userService: UserManagementService, private authSvs: AuthService, private router: Router) {
    this.userData$ = this.authSvs.currentUser$;
  }

  ngOnInit(): void {
    this.setupSearchPipeline();
    const tenantIdString = sessionStorage.getItem('tenantId');
    if (tenantIdString) {
      const tenantId = parseInt(tenantIdString, 10);
      this.userService.fetchTenantObservable(tenantId).subscribe(data => {
        this.tenantDetails = data;
        console.log('Tenant Details are ready:', this.tenantDetails);
      });
    }
  }

  ngAfterViewInit() {
    if (this.autoFocus) {
      this.searchInput.nativeElement.focus();
    }
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
        this.userFilterModel.searchQuery = query;

        if (this.searchType === 'VENDOR') {
          this.userFilterModel.userType = [UserType.VENDOR];
        } else if (this.searchType === 'CUSTOMER') {
          this.userFilterModel.userType = [UserType.CUSTOMER];
        } else if (this.searchType === 'EMPLOYEE') {
          this.userFilterModel.userType = [UserType.EMPLOYEE];
        }

        // Convert Service Call to Observable
        return new Promise<UserModel[]>((resolve) => {
          this.userService.searchUsers(
            this.userFilterModel,
            (res: any) => resolve(res?.data?.content || []),
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

  onSearchInput(value: string) {
    this.searchTerm = value;
    this.activeIndex = -1;
    this.searchSubject.next(value);
  }

  selectUser(user: UserModel) {
    this.selectedUser = user;
    this.showResults = false;
    this.searchTerm = '';
    this.userSelected.emit(user);
  }

  clearUser() {
    this.selectedUser = null;
    this.searchTerm = '';
    this.userCleared.emit();
  }

  // --- Helpers ---

  closeDropdown() {
    // Small delay to allow click event to register
    setTimeout(() => this.showResults = false, 200);
  }

  getFormattedAddress(): string {
    if (!this.selectedUser?.addresses?.length) return '';
    // Logic to find Billing address or default to first
    const addr = this.selectedUser.addresses.find(a => a.type === 'BILLING') || this.selectedUser.addresses[0];
    return `${addr.city}, ${addr.state}`;
  }

  onKeyDown(event: KeyboardEvent) {
    if (!this.showResults || this.searchResults.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault(); // Prevent cursor moving in input
        this.activeIndex = (this.activeIndex + 1) % this.searchResults.length;
        this.scrollToActive();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex = (this.activeIndex - 1 + this.searchResults.length) % this.searchResults.length;
        this.scrollToActive();
        break;
      case 'Enter':
        event.preventDefault();
        if (this.activeIndex >= 0 && this.activeIndex < this.searchResults.length) {
          this.selectUser(this.searchResults[this.activeIndex]);
        }
        break;
      case 'Escape':
        this.showResults = false;
        break;
    }
  }

  private scrollToActive() {
    const container = document.querySelector('.results-container');
    const activeItem = document.querySelector('.active-item') as HTMLElement;
    if (container && activeItem) {
      activeItem.scrollIntoView({ block: 'nearest' });
    }
  }

  moveToContactPage() {
    this.router.navigate(['/contacts/createa']);
  }
}