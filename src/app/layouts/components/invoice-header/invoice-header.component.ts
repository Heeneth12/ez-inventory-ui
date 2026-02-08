import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, filter, switchMap, tap, finalize, of, catchError, Observable } from 'rxjs';
import { AuthService } from '../../guards/auth.service';
import { UserInitResponse } from '../../models/Init-response.model';
import { User, CheckCircle, Phone, Mail, MapPin, Search, Loader2, Building2, Store, LucideAngularModule } from 'lucide-angular';
import { Router } from '@angular/router';
import { UserFilterModel, UserModel, UserType } from '../../../views/user-management/models/user.model';
import { UserManagementService } from '../../../views/user-management/userManagement.service';


@Component({
  selector: 'app-invoice-header',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './invoice-header.component.html'
})
export class InvoiceHeaderComponent implements OnInit {

  // Inputs: Allow parent to pass in an existing user (e.g. Edit Mode)
  @Input() selectedUser: UserModel | null = null;
  @Input() searchType: 'CUSTOMER' | 'VENDOR' | 'EMPLOYEE' = 'VENDOR'
  
  // Outputs: Tell parent when a user is chosen or cleared
  @Output() userSelected = new EventEmitter<UserModel>();
  @Output() userCleared = new EventEmitter<void>();

  // Search State
  searchTerm: string = '';
  searchResults: UserModel[] = [];
  isSearching: boolean = false;
  showResults: boolean = false;

  userFilterModel: UserFilterModel = new UserFilterModel(); 

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

  constructor(private userService: UserManagementService, private authSvs: AuthService, private router: Router) {
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
        this.userFilterModel.searchQuery = query;

        if(this.searchType === 'VENDOR'){
          this.userFilterModel.type = UserType.VENDOR;
        }else if(this.searchType === 'CUSTOMER') {
          this.userFilterModel.type = UserType.CUSTOMER;
        }else if(this.searchType === 'EMPLOYEE') {
          this.userFilterModel.type = UserType.EMPLOYEE;
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

  // --- UI Actions ---

  onSearchInput(value: string) {
    this.searchTerm = value;
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

  moveToContactPage() {
    this.router.navigate(['/contacts/createa']);
  }
}