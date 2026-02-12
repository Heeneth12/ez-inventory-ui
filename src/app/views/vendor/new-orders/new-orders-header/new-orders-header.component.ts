import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserFilterModel, UserModel, UserType } from '../../../user-management/models/user.model';
import { UserInitResponse } from '../../../../layouts/models/Init-response.model';
import { debounceTime, distinctUntilChanged, filter, finalize, Observable, Subject, switchMap, tap } from 'rxjs';
import { TenantModel } from '../../../user-management/models/tenant.model';
import { Router } from '@angular/router';
import { User, CheckCircle, Phone, Mail, MapPin, Search, Loader2, Building2, Store, ChevronRight, LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../../layouts/guards/auth.service';
import { UserManagementService } from '../../../user-management/userManagement.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-new-orders-header',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './new-orders-header.component.html',
  styleUrl: './new-orders-header.component.css'
})
export class NewOrdersHeaderComponent {
  
  // Outputs: Tell parent when a user is chosen or cleared
  @Output() userSelected = new EventEmitter<UserModel>();

  // Search State
  searchTerm: string = '';
  searchResults: UserModel[] = [];
  isSearching: boolean = false;
  showResults: boolean = false;

  userFilterModel: UserFilterModel = new UserFilterModel();

  // Use Observable for AsyncPipe in template (Best Practice)
  userData$: Observable<UserInitResponse | null>;
  tenantDetails: TenantModel | null = null;
  currentUserDetails: UserModel | null = null;

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

    const currentUserDetails = sessionStorage.getItem('userId');
    if (currentUserDetails) {
      const userId = parseInt(currentUserDetails, 10);
      this.userService.fetchUserObservable(userId).subscribe(data => {
        this.currentUserDetails = data;
        console.log('Tenant Details are ready:', this.tenantDetails);
      });
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

  // --- UI Actions ---

  onSearchInput(value: string) {
    this.searchTerm = value;
    this.searchSubject.next(value);
  }

  // --- Helpers ---

  closeDropdown() {
    // Small delay to allow click event to register
    setTimeout(() => this.showResults = false, 200);
  }

  getFormattedAddress(): string {
    if (!this.currentUserDetails?.addresses?.length) return '';
    // Logic to find Billing address or default to first
    const addr = this.currentUserDetails.addresses.find(a => a.type === 'BILLING') || this.currentUserDetails.addresses[0];
    return `${addr.city}, ${addr.state}`;
  }

  moveToContactPage() {
    this.router.navigate(['/contacts/createa']);
  }
}