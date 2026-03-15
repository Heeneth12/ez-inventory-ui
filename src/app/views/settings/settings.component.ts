import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../layouts/components/toast/toastService';
import { AuthService } from '../../layouts/guards/auth.service';
import { UserManagementService } from '../user-management/userManagement.service';
import { UserInitResponse } from '../../layouts/models/Init-response.model';
import { TenantModel } from '../user-management/models/tenant.model';
import { Observable, take } from 'rxjs';

// Defined tabs based on your request
type Tab = 'General' | 'Tenant Details' | 'Payments' | 'Security' | 'Subscriptions';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  // State
  activeTab = signal<Tab>('General');
  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);

  userData$!: Observable<UserInitResponse | null>;

  // Tabs List for the UI loop
  tabs: Tab[] = ['General', 'Tenant Details', 'Payments', 'Security', 'Subscriptions'];

  // Forms
  generalForm: FormGroup;
  tenantForm: FormGroup;
  addressForm: FormGroup;

  // Data
  currentUser: any = null;
  currentTenantId: number | null = null;
  currentTenant: TenantModel | null = null;
  addresses = signal<any[]>([]);
  isAddressModalOpen = signal<boolean>(false);
  editingAddressId = signal<number | null>(null);
  isSavingAddress = signal<boolean>(false);
  
  userInitials = signal<string>('');
  avatarUrl = signal<string | null>(null); // Placeholder for avatar

  constructor(
    private authSvs: AuthService,
    private userService: UserManagementService,
    private fb: FormBuilder,
    private toast: ToastService
  ) {
    this.userData$ = this.authSvs.currentUser$;
    // General Form matches the Screenshot fields
    this.generalForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: [''],
      email: [{ value: '', disabled: false }, [Validators.required, Validators.email]], // Enabled in design
      city: [''],
      phone:[''],
      timezone: ['UTC/GMT -4 hours'], // Default mock
      dateFormat: ['dd/mm/yyyy 00:00'], // Default mock
      function: [''],
      jobTitle: ['']
    });

    this.tenantForm = this.fb.group({
      tenantName: [{ value: '', disabled: true }, Validators.required],
      tenantCode: [{ value: '', disabled: true }],
      email: [{ value: '', disabled: true }, [Validators.email]],
      phone: [{ value: '', disabled: true }],
      // Details
      businessType: ['RETAIL'],
      legalName: [''],
      baseCurrency: ['INR'],
      timeZone: ['UTC/GMT +5:30'],
      gstNumber: [''],
      panNumber: [''],
      supportEmail: [''],
      contactPhone: [''],
      website: [''],
    });

    this.addressForm = this.fb.group({
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['India', Validators.required],
      pinCode: ['', Validators.required],
      type: ['OFFICE', Validators.required]
    });
  }

  ngOnInit() {
    this.userData$.pipe(take(1)).subscribe(user => {
      if (user?.id) {
        this.currentTenantId = user.tenantId;
        this.loadUserData(user.id);
        if (this.currentTenantId) {
          this.loadTenantData(this.currentTenantId);
        }
      } else {
        this.isLoading.set(false);
        this.toast.show('User session not found', 'error');
      }
    });
  }

  loadUserData(userId: number) {
    this.isLoading.set(true);
    this.userService.getUserById(userId, (res: any) => {
      this.currentUser = res.data;
      this.patchForm(this.currentUser);
      this.generateInitials(this.currentUser.fullName);
      this.isLoading.set(false);
    }, (err: any) => {
      this.isLoading.set(false);
      this.toast.show('Failed to load profile', 'error');
    });
  }

  loadTenantData(tenantId: number) {
    this.userService.getTenantById(tenantId, (res: any) => {
      this.currentTenant = res.data;
      this.patchTenantForm(this.currentTenant);
    }, (err: any) => {
      this.toast.show('Failed to load tenant details', 'error');
    });
  }

  patchForm(user: any) {
    // Split full name for the UI logic
    const names = (user.fullName || '').split(' ');
    const firstName = names[0] || '';
    const lastName = names.slice(1).join(' ') || '';

    this.generalForm.patchValue({
      firstName: firstName,
      lastName: lastName,
      email: user.email,
      phone: user.phone
    });

    // If you have address data, patch city here
    if (user.addresses?.[0]) {
      this.generalForm.patchValue({ city: user.addresses[0].city });
    }
  }

  patchTenantForm(tenant: TenantModel | null) {
    if(!tenant) return;
    this.tenantForm.patchValue({
      tenantName: tenant.tenantName,
      tenantCode: tenant.tenantCode,
      email: tenant.email,
      phone: tenant.phone
    });
    
    if (tenant.tenantDetails) {
      this.tenantForm.patchValue({
        businessType: tenant.tenantDetails.businessType,
        legalName: tenant.tenantDetails.legalName,
        baseCurrency: tenant.tenantDetails.baseCurrency,
        timeZone: tenant.tenantDetails.timeZone,
        gstNumber: tenant.tenantDetails.gstNumber,
        panNumber: tenant.tenantDetails.panNumber,
        supportEmail: tenant.tenantDetails.supportEmail,
        contactPhone: tenant.tenantDetails.contactPhone,
        website: tenant.tenantDetails.website,
      });
    }

    if (tenant.tenantAddress) {
      this.addresses.set(tenant.tenantAddress);
    } else {
      this.addresses.set([]);
    }
  }

  generateInitials(name: string) {
    if (!name) return;
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      this.userInitials.set((parts[0][0] + parts[1][0]).toUpperCase());
    } else {
      this.userInitials.set(name.substring(0, 2).toUpperCase());
    }
  }

  switchTab(tab: Tab) {
    this.activeTab.set(tab);
  }

  onSave() {
    if (this.generalForm.invalid) return;
    this.isSaving.set(true);

    // Simulate API call
    setTimeout(() => {
      this.isSaving.set(false);
      this.toast.show('Settings saved successfully', 'success');
    }, 1000);
  }

  onSaveTenant() {
    if (this.tenantForm.invalid || !this.currentTenantId) return;
    this.isSaving.set(true);
    
    const formVals = this.tenantForm.getRawValue();
    
    // Prepare Tenant Details Data
    const tenantDetailsData = {
      businessType: formVals.businessType,
      legalName: formVals.legalName,
      baseCurrency: formVals.baseCurrency,
      timeZone: formVals.timeZone,
      gstNumber: formVals.gstNumber,
      panNumber: formVals.panNumber,
      supportEmail: formVals.supportEmail,
      contactPhone: formVals.contactPhone,
      website: formVals.website
    };

    // Update Details
    this.userService.updateTenantDetails(this.currentTenantId, tenantDetailsData, (res: any) => {
      this.isSaving.set(false);
      this.toast.show('Business details saved successfully', 'success');
      this.loadTenantData(this.currentTenantId!);
    }, (err: any) => {
      this.isSaving.set(false);
      this.toast.show('Failed to save business details', 'error');
    });
  }

  // Address Modal Methods
  openAddAddress() {
    this.editingAddressId.set(null);
    this.addressForm.reset({ country: 'India', type: 'OFFICE' });
    this.isAddressModalOpen.set(true);
  }

  openEditAddress(address: any) {
    this.editingAddressId.set(address.id);
    this.addressForm.patchValue({
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      city: address.city,
      state: address.state,
      country: address.country,
      pinCode: address.pinCode,
      type: address.type
    });
    this.isAddressModalOpen.set(true);
  }

  closeAddressModal() {
    this.isAddressModalOpen.set(false);
    this.addressForm.reset();
  }

  onSaveAddress() {
    if (this.addressForm.invalid || !this.currentTenantId) return;
    this.isSavingAddress.set(true);
    
    const addrData = this.addressForm.getRawValue();
    const addressId = this.editingAddressId();

    const onSuccess = (res: any) => {
      this.isSavingAddress.set(false);
      this.toast.show(addressId ? 'Address updated successfully' : 'Address added successfully', 'success');
      this.closeAddressModal();
      this.loadTenantData(this.currentTenantId!);
    };

    const onError = (err: any) => {
      this.isSavingAddress.set(false);
      this.toast.show('Failed to save address', 'error');
    };

    if (addressId) {
      this.userService.updateTenantAddress(this.currentTenantId, addressId, addrData, onSuccess, onError);
    } else {
      this.userService.createTenantAddress(this.currentTenantId, addrData, onSuccess, onError);
    }
  }
}