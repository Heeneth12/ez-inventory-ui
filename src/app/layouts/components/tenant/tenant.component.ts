import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  Edit, X, Save, Camera, Plus, MapPin, Info, Upload, Calendar,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  Clock,
  FileTextIcon,
  Activity,
  BarChart2,
  Bell,
  Database,
  Download,
  Eye,
  EyeOff,
  Key,
  Loader,
  LogOut,
  Mail,
  Monitor,
  Shield,
  Smartphone,
  Trash,
  User,
  Building2,
  Folder,
  ShieldCheckIcon
} from 'lucide-angular';
import { Observable, take } from 'rxjs';
import { TenantModel } from '../../../views/user-management/models/tenant.model';
import { UserManagementService } from '../../../views/user-management/userManagement.service';
import { AuthService } from '../../guards/auth.service';
import { UserInitResponse } from '../../models/Init-response.model';
import { ToastService } from '../toast/toastService';
import { ModalService } from '../modal/modalService';
import { IntegrationsComponent } from "../integrations/integrations.component";


export interface DocumentRecord {
  label: string;
  hint: string;
  status: 'verified' | 'pending' | 'rejected' | 'not_uploaded';
  fileName?: string;
}

export interface PrivacyPref {
  label: string;
  desc: string;
  enabled: boolean;
  color: 'blue' | 'green' | 'purple' | 'amber';
  icon: any;
}

@Component({
  selector: 'app-tenant',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LucideAngularModule, IntegrationsComponent],
  templateUrl: './tenant.component.html'
})
export class TenantComponent implements OnInit {

  isExpanded = false;
  isIntegrationsExpanded: boolean = false;

  @ViewChild('integrationConfigModalTemplate') integrationConfigModalTemplate!: any;
  @ViewChild('tenantAddressModalTemplate') tenantAddressModalTemplate!: any;


  // icons
  readonly EditIcon = Edit;
  readonly XIcon = X;
  readonly SaveIcon = Save;
  readonly CameraIcon = Camera;
  readonly PlusIcon = Plus;
  readonly MapPinIcon = MapPin;
  readonly InfoIcon = Info;
  readonly UploadIcon = Upload;
  readonly CalendarIcon = Calendar;
  readonly ChevronDownIcon = ChevronDown;
  readonly CheckCircleIcon = CheckCircle;
  readonly ClockIcon = Clock;
  readonly AlertCircleIcon = AlertCircle;
  readonly FileTextIcon = FileTextIcon;
  readonly UserIcon = User;
  readonly MailIcon = Mail;
  readonly ShieldIcon = Shield;
  readonly KeyIcon = Key;
  readonly BellIcon = Bell;
  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;
  readonly LoaderIcon = Loader;
  readonly MonitorIcon = Monitor;
  readonly SmartphoneIcon = Smartphone;
  readonly LogOutIcon = LogOut;
  readonly DownloadIcon = Download;
  readonly TrashIcon = Trash;
  readonly ActivityIcon = Activity;
  readonly DatabaseIcon = Database;
  readonly BarChart2Icon = BarChart2;
  readonly Building2Icon = Building2;
  readonly FolderIcon = Folder;
  readonly ShieldCogCornerIcon = ShieldCheckIcon;

  // UI state
  isLoading = signal(true);
  isSaving = signal(false);
  isSavingAddress = signal(false);
  isUploadingLogo = signal(false);

  isEditMode = signal(false);
  isAddressModalOpen = signal(false);
  editingAddressId = signal<number | null>(null);

  // Feature toggles
  eInvoiceEnabled = false;
  tdsEnabled = false;

  toggleEInvoice() { this.eInvoiceEnabled = !this.eInvoiceEnabled; }
  toggleTds() { this.tdsEnabled = !this.tdsEnabled; }

  // Data signals
  logoUrl = signal<string | null>(null);
  signatureUrl = signal<string | null>(null);
  addresses = signal<any[]>([]);

  // Auth / data
  userData$!: Observable<UserInitResponse | null>;
  currentTenantId: number | null = null;
  currentTenant: TenantModel | null = null;

  // Forms
  tenantForm!: FormGroup;
  addressForm!: FormGroup;

  constructor(
    private authSvs: AuthService,
    private userService: UserManagementService,
    private fb: FormBuilder,
    private toast: ToastService,
    private modalSvs: ModalService,
  ) { }

  ngOnInit() {
    this.initForms();
    this.userData$ = this.authSvs.currentUser$;
    this.userData$.pipe(take(1)).subscribe(user => {
      if (user?.tenantId) {
        this.currentTenantId = user.tenantId;
        this.loadTenantData(this.currentTenantId);
      } else {
        this.isLoading.set(false);
        this.toast.show('User session not found', 'error');
      }
    });
  }

  // Initializers
  private initForms() {
    this.tenantForm = this.fb.group({
      tenantName: [{ value: '', disabled: false }, Validators.required],
      phone: [''],
      email: ['', Validators.email],
      legalName: [''],
      gstNumber: [''],
      panNumber: [''],
      businessType: ['RETAIL'],
      baseCurrency: ['INR'],
      timeZone: ['IST'],
      website: [''],
      supportEmail: ['', Validators.email],
      contactPhone: [''],
    });

    this.addressForm = this.fb.group({
      type: ['OFFICE', Validators.required],
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['India', Validators.required],
      pinCode: ['', Validators.required],
    });
  }

  // Edit mode
  enterEditMode() { this.isEditMode.set(true); }

  cancelEdit() {
    this.isEditMode.set(false);
    if (this.currentTenant) {
      this.patchTenantForm(this.currentTenant);
    }
  }

  // Data loading
  loadTenantData(tenantId: number) {
    this.isLoading.set(true);
    this.userService.getTenantById(tenantId,
      (res: any) => {
        this.currentTenant = res.data;
        this.patchTenantForm(this.currentTenant);
        this.isLoading.set(false);
      },
      (err: any) => {
        this.isLoading.set(false);
        this.toast.show('Failed to load business details', 'error');
      }
    );
  }

  patchTenantForm(tenant: TenantModel | null) {
    if (!tenant) return;
    this.tenantForm.patchValue({
      tenantName: tenant.tenantName,
      phone: tenant.phone,
      email: tenant.email,
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
    this.addresses.set(tenant.tenantAddress ?? []);
  }

  // Save
  onSaveTenant() {
    if (this.tenantForm.invalid || !this.currentTenantId) return;
    this.isSaving.set(true);

    const vals = this.tenantForm.getRawValue();
    const payload = {
      businessType: vals.businessType,
      legalName: vals.legalName,
      baseCurrency: vals.baseCurrency,
      timeZone: vals.timeZone,
      gstNumber: vals.gstNumber,
      panNumber: vals.panNumber,
      supportEmail: vals.supportEmail,
      contactPhone: vals.contactPhone,
      website: vals.website,
    };

    this.userService.updateTenantDetails(this.currentTenantId, payload,
      () => {
        this.isSaving.set(false);
        this.isEditMode.set(false);
        this.toast.show('Business configuration saved', 'success');
        this.loadTenantData(this.currentTenantId!);
      },
      (err: any) => {
        this.isSaving.set(false);
        this.toast.show(err?.error?.message || 'Failed to save configuration', 'error');
      }
    );
  }

  // Address modal
  openAddAddress() {
    this.editingAddressId.set(null);
    this.addressForm.reset({ type: 'OFFICE', country: 'India' });
    this.modalSvs.openTemplate(this.tenantAddressModalTemplate);
  }

  openEditAddress(address: any) {
    this.editingAddressId.set(address.id ?? null);
    this.addressForm.patchValue(address);
    this.modalSvs.openTemplate(this.tenantAddressModalTemplate);
  }

  closeAddressModal() {
    this.modalSvs.close();
    this.isAddressModalOpen.set(false);
    this.editingAddressId.set(null);
    this.addressForm.reset({ type: 'OFFICE', country: 'India' });
  }

  onSaveAddress() {
    if (this.addressForm.invalid || !this.currentTenantId) return;
    this.isSavingAddress.set(true);

    const data = this.addressForm.getRawValue();
    const addrId = this.editingAddressId();

    const onSuccess = () => {
      this.isSavingAddress.set(false);
      this.toast.show(addrId ? 'Address updated' : 'Address added', 'success');
      this.closeAddressModal();
      this.loadTenantData(this.currentTenantId!);
    };
    const onError = (err: any) => {
      this.isSavingAddress.set(false);
      this.toast.show(err?.error?.message || 'Failed to save address', 'error');
    };

    if (addrId) {
      this.userService.updateTenantAddress(this.currentTenantId, addrId, data, onSuccess, onError);
    } else {
      this.userService.createTenantAddress(this.currentTenantId, data, onSuccess, onError);
    }
  }

  // Logo upload
  onLogoSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.isUploadingLogo.set(true);
    // TODO: call file upload API, then set logoUrl signal
    const reader = new FileReader();
    reader.onload = (e) => {
      this.logoUrl.set(e.target?.result as string);
      this.isUploadingLogo.set(false);
    };
    reader.readAsDataURL(file);
  }

  // Signature upload
  onSignatureSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => this.signatureUrl.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  // Financial year
  closeFinancialYear() {
    // TODO: confirm dialog then API call
    this.toast.show('Financial year close initiated', 'info');
  }


  // Documents
  documents: DocumentRecord[] = [
    { label: 'PAN Card', hint: 'Permanent Account Number — required for tax', status: 'verified', fileName: 'pan_arjun.pdf' },
    { label: 'Aadhaar Card', hint: 'Government-issued 12-digit UID', status: 'verified', fileName: 'aadhaar.jpg' },
    { label: 'GST Certificate', hint: 'GSTIN registration document', status: 'pending', fileName: 'gst_cert.pdf' },
    { label: 'Business Licence', hint: 'Shop & Establishment Act certificate', status: 'rejected', fileName: 'biz_licence.pdf' },
    { label: 'Bank Statement', hint: 'Last 3 months — for account verification', status: 'not_uploaded' },
    { label: 'Address Proof', hint: 'Utility bill or lease agreement', status: 'not_uploaded' },
  ];

  uploadDocument(doc: DocumentRecord) {
    console.log('Upload document:', doc.label);
  }


  // Privacy
  privacyPrefs: PrivacyPref[] = [
    { label: 'Activity tracking', desc: 'Allow session activity to improve your experience', enabled: true, color: 'blue', icon: Activity },
    { label: 'Profile visibility', desc: 'Make your name visible to other users in workspace', enabled: true, color: 'purple', icon: Eye },
  ];

  togglePrivacy(pref: PrivacyPref) {
    pref.enabled = !pref.enabled;
    // TODO: call API
  }

  exportData() { console.log('Export data'); }
  deactivateAccount() { console.log('Deactivate'); }
  deleteAccount() { console.log('Delete account'); }
}