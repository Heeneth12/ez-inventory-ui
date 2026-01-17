import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserManagementService } from '../../userManagement.service';
import { ToastService } from '../../../../layouts/components/toast/toastService';

export type FormMode = 'create' | 'edit' | 'view';

@Component({
  selector: 'app-tenant-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tenant-form.component.html',
  styleUrl: './tenant-form.component.css'
})
export class TenantFormComponent implements OnInit {

  mode: FormMode = 'create';
  tenantId: number | null = null;
  isLoading: boolean = false;
  isSubmitting: boolean = false;

  formData: any = {
    tenantName: '',
    appKey: '',
    tenantCode: '',
    adminFullName: '',
    adminEmail: '',
    password: '',
    adminPhone: '',
    isPersonal: false,
    isActive: true,
    address: {
      id: null,
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      country: '',
      pinCode: '',
      type: 'OFFICE'
    }
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserManagementService,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const queryMode = this.route.snapshot.queryParamMap.get('mode');

    if (idParam) {
      this.tenantId = Number(idParam);
      this.mode = (queryMode === 'view') ? 'view' : 'edit';
      this.loadTenantData(this.tenantId);
    } else {
      this.mode = 'create';
      this.resetForm();
    }
  }

  loadTenantData(id: number) {
    this.isLoading = true;
    this.userService.getTenantById(id,
      (res: any) => {
        this.isLoading = false;
        if (res && res.data) {
          this.mapResponseToForm(res.data);
        }
      },
      (err: any) => {
        this.isLoading = false;
        this.toast.show('Failed to load tenant details', 'error');
        this.goBack();
      }
    );
  }

  handleSubmit() {
    if (this.mode === 'view') return;
    this.isSubmitting = true;

    const successCb = (res: any) => {
      this.isSubmitting = false;
      this.toast.show(
        this.mode === 'create' ? 'Tenant created successfully' : 'Tenant updated successfully',
        'success'
      );
      this.goBack();
    };

    const errorCb = (err: any) => {
      this.isSubmitting = false;
      this.toast.show('Operation failed. Please check your inputs.', 'error');
    };

    if (this.mode === 'create') {
      this.userService.createTenant(this.formData, successCb, errorCb);
    } else {
      const payload = {
        phone: this.formData.adminPhone,
        address: this.formData.address
      };
      this.userService.updateTenant(this.tenantId!, payload, successCb, errorCb);
    }
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  mapResponseToForm(data: any) {
    // Basic Details
    this.formData.tenantName = data.tenantName;
    this.formData.tenantCode = data.tenantCode;
    this.formData.appKey = (data.applications && data.applications.length > 0)
      ? data.applications[0].appKey : '';
    this.formData.isActive = data.isActive;

    // Admin Details
    if (data.tenantAdmin) {
      this.formData.adminFullName = data.tenantAdmin.fullName;
      this.formData.adminEmail = data.tenantAdmin.email;
      this.formData.adminPhone = data.tenantAdmin.phone;
    }

    // Address Details (Take first one found)
    if (data.tenantAddress && data.tenantAddress.length > 0) {
      const addr = data.tenantAddress[0];
      this.formData.address = {
        id: addr.id,
        addressLine1: addr.addressLine1,
        addressLine2: addr.addressLine2,
        city: addr.city,
        state: addr.state,
        country: addr.country,
        pinCode: addr.pinCode,
        type: addr.type || 'OFFICE'
      };
    } else {
      this.formData.address = { type: 'OFFICE' };
    }
  }

  resetForm() {
    this.formData = {
      tenantName: '', appKey: '', tenantCode: '',
      adminFullName: '', adminEmail: '', password: '', adminPhone: '',
      isPersonal: false, isActive: true,
      address: { type: 'OFFICE' }
    };
  }

  // UI Helper: Determines field state
  isReadOnly(field: 'meta' | 'contact'): boolean {
    if (this.mode === 'view') return true;
    if (this.mode === 'create') return false;

    // In Edit Mode:
    if (field === 'meta') return true;    // Name, Email, Code are locked
    if (field === 'contact') return false; // Phone, Address are editable
    return false;
  }

  getPageTitle(): string {
    if (this.mode === 'create') return 'Register New Tenant';
    return this.mode === 'edit' ? 'Update Tenant Profile' : 'Tenant Details';
  }
}