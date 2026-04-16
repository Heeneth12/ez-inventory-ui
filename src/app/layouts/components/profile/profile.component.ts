import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  LucideAngularModule,
  User, Mail, Shield, Key, Bell, CheckCircle, ShieldAlert,
  Edit, Camera, Lock, Eye, EyeOff, Plus, X, MapPin, Save, Loader,
  Activity,
  AlertCircle,
  BarChart2,
  Clock,
  Database,
  Download,
  FileText,
  Info,
  LogOut,
  Monitor,
  Smartphone,
  Trash,
  Upload,
  ChevronDown
} from 'lucide-angular';
import { AuthService } from '../../guards/auth.service';
import { UserInitResponse } from '../../models/Init-response.model';
import { ToastService } from '../toast/toastService';
import { UserManagementService } from '../../../views/user-management/userManagement.service';
import { UserAddressModel, UserModel } from '../../../views/user-management/models/user.model';
import { ModalService } from '../modal/modalService';
import { FileManagerService } from '../../../views/file-manager/file-manager.service';
import { ɵEmptyOutletComponent } from "@angular/router";

export interface NotificationRow {
  label: string;
  desc: string;
  email: boolean;
  push: boolean;
  sms: boolean;
}

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
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, ɵEmptyOutletComponent],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  @ViewChild('addressModal') addressModalTemplate!: any;

  isExpanded: boolean = false;
  isNotifExpanded: boolean = false;

  // icons
  readonly UserIcon = User;
  readonly MailIcon = Mail;
  readonly ShieldIcon = Shield;
  readonly KeyIcon = Key;
  readonly BellIcon = Bell;
  readonly CheckCircleIcon = CheckCircle;
  readonly ShieldAlertIcon = ShieldAlert;
  readonly EditIcon = Edit;
  readonly CameraIcon = Camera;
  readonly LockIcon = Lock;
  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;
  readonly PlusIcon = Plus;
  readonly XIcon = X;
  readonly MapPinIcon = MapPin;
  readonly SaveIcon = Save;
  readonly LoaderIcon = Loader;
  readonly ClockIcon = Clock;
  readonly MonitorIcon = Monitor;
  readonly SmartphoneIcon = Smartphone;
  readonly LogOutIcon = LogOut;
  readonly AlertCircleIcon = AlertCircle;
  readonly UploadIcon = Upload;
  readonly FileTextIcon = FileText;
  readonly InfoIcon = Info;
  readonly DownloadIcon = Download;
  readonly TrashIcon = Trash;
  readonly ActivityIcon = Activity;
  readonly DatabaseIcon = Database;
  readonly BarChart2Icon = BarChart2;
  readonly ChevronDownIcon = ChevronDown;

  // UI state
  isEditMode = signal(false);
  isUploading = signal(false);
  isSavingPersonal = signal(false);
  isSavingAddress = signal(false);
  showPasswordFields = signal(false);
  showCurrentPw = signal(false);
  showNewPw = signal(false);
  showConfirmPw = signal(false);
  showAddressModal = signal(false);

  // Data
  profilePicUrl = signal<string | null>(null);
  user = signal<UserInitResponse | null>(null);
  userDetails = signal<UserModel | null>(null);
  editingAddressId = signal<number | null>(null);

  // Forms
  personalForm!: FormGroup;
  securityForm!: FormGroup;
  addressForm!: FormGroup;

  constructor(
    private authSvc: AuthService,
    private modalService: ModalService,
    private userManagementSvc: UserManagementService,
    private fb: FormBuilder,
    private toastSvc: ToastService,
    private fileManagementService: FileManagerService
  ) { }

  ngOnInit() {
    this.authSvc.currentUser$.subscribe(u => {
      this.user.set(u);
      this.initPersonalForm(u);
    });
    this.initSecurityForm();
    this.initAddressForm();
    this.getUserDetails();
  }

  // Initializers
  private initPersonalForm(u: UserInitResponse | null) {
    this.personalForm = this.fb.group({
      fullName: [u?.fullName || '', Validators.required],
      email: [{ value: u?.email || '', disabled: true }],
      phone: [u?.phone || '', Validators.required]
    });
  }

  private initAddressForm() {
    this.addressForm = this.fb.group({
      type: ['HOME', Validators.required],
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['', Validators.required],
      pinCode: ['', Validators.required]
    });
  }

  private initSecurityForm() {
    this.securityForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });
  }

  // Edit mode
  enterEditMode() {
    this.isEditMode.set(true);
  }

  cancelEdit() {
    this.isEditMode.set(false);
    this.showPasswordFields.set(false);
    // Reset to current saved values
    const u = this.user();
    this.personalForm.patchValue({
      fullName: u?.fullName || '',
      phone: u?.phone || ''
    });
    this.securityForm.reset();
  }

  // Password visibility toggles (arrow fns not allowed in templates)
  toggleCurrentPw() { this.showCurrentPw.set(!this.showCurrentPw()); }
  toggleNewPw() { this.showNewPw.set(!this.showNewPw()); }
  toggleConfirmPw() { this.showConfirmPw.set(!this.showConfirmPw()); }

  togglePasswordFields() {
    this.showPasswordFields.update(v => !v);
    if (!this.showPasswordFields()) {
      this.securityForm.reset();
    }
  }

  // Save personal
  onSavePersonal() {
    if (this.personalForm.invalid) return;

    // If password fields are shown and filled, validate them first
    if (this.showPasswordFields()) {
      if (this.securityForm.invalid) {
        this.toastSvc.show('Please fill in all password fields correctly', 'error');
        return;
      }
      if (this.securityForm.value.newPassword !== this.securityForm.value.confirmPassword) {
        this.toastSvc.show('Passwords do not match', 'error');
        return;
      }
    }

    this.isSavingPersonal.set(true);

    // TODO: replace with actual API calls
    setTimeout(() => {
      this.isSavingPersonal.set(false);
      this.isEditMode.set(false);
      this.showPasswordFields.set(false);
      this.securityForm.reset();
      this.toastSvc.show('Profile updated successfully', 'success');
    }, 1000);
  }

  // Address CRUD
  openAddressModal(address?: UserAddressModel) {
    if (address) {
      this.editingAddressId.set(address.id ?? null);
      this.addressForm.patchValue(address);
    } else {
      this.editingAddressId.set(null);
      this.addressForm.reset({ type: 'HOME' });
    }
    this.showAddressModal.set(true);
  }

  closeAddressModal() {
    this.showAddressModal.set(false);
    this.editingAddressId.set(null);
    this.addressForm.reset({ type: 'HOME' });
  }

  onSaveAddress() {
    const userId = this.userDetails()?.id;
    if (this.addressForm.invalid || !userId) return;

    this.isSavingAddress.set(true);
    const data = this.addressForm.value as UserAddressModel;
    const addrId = this.editingAddressId();

    const onSuccess = (msg: string) => () => {
      this.toastSvc.show(msg, 'success');
      this.isSavingAddress.set(false);
      this.closeAddressModal();
      this.getUserDetails();
    };
    const onError = (err: any) => {
      this.isSavingAddress.set(false);
      this.toastSvc.show(err?.error?.message || 'Something went wrong', 'error');
    };

    if (addrId) {
      this.userManagementSvc.updateUserAddress(userId, addrId, data, onSuccess('Address updated'), onError);
    } else {
      this.userManagementSvc.addUserAddress(userId, data, onSuccess('Address added'), onError);
    }
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.uploadProfileImage(file);
  }

  uploadProfileImage(file: File) {
    const user = this.user();
    const details = this.userDetails();
    if (!user || !details) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('referenceId', user.userUuid);
    formData.append('referenceType', 'EMPLOYEE');
    formData.append('fileType', 'EMPLOYEE_PHOTO');
    formData.append('tenantId', user.tenantId.toString());
    formData.append('isPublic', 'false');

    this.isUploading.set(true);
    this.fileManagementService.uploadFile(formData,
      () => {
        this.isUploading.set(false);
        this.toastSvc.show('Profile picture updated', 'success');
        this.getUserDetails();
      },
      (err: any) => {
        this.isUploading.set(false);
        this.toastSvc.show(err?.error?.message || 'Upload failed', 'error');
      }
    );
  }

  getUserDetails() {
    this.userManagementSvc.getUserById(
      this.user()?.id ?? 1,
      (response: any) => {
        const userData = response.data;
        this.userDetails.set(userData);
        if (userData.profilePictureUuid) {
          this.fetchProfilePicUrl(userData.profilePictureUuid);
        }
      },
      (error: any) => this.toastSvc.show(error?.error?.message, 'error')
    );
  }

  fetchProfilePicUrl(uuid: string) {
    this.fileManagementService.getPresignedUrl(uuid, 60,
      (res: any) => this.profilePicUrl.set(res.url || res.data?.url),
      (err: any) => console.error('Could not load profile picture', err)
    );
  }

  get userInitials(): string {
    const name = this.user()?.fullName || '';
    return name
      .split(' ')
      .slice(0, 2)
      .map(n => n.charAt(0).toUpperCase())
      .join('');
  }

  getAddressTypeBadgeClass(type: string): string {
    const map: Record<string, string> = {
      HOME: 'badge-blue',
      OFFICE: 'badge-gray',
      BILLING: 'badge-amber',
      SHIPPING: 'badge-green',
      WAREHOUSE: 'badge-purple',
    };
    return map[type] ?? 'badge-gray';
  }

  notificationRows: NotificationRow[] = [
    { label: 'Low stock alerts', desc: 'When inventory drops below reorder level', email: true, push: true, sms: false },
    { label: 'Purchase orders', desc: 'New PO raised or status changed', email: true, push: true, sms: false },
    { label: 'Goods received', desc: 'Inward delivery confirmed', email: true, push: false, sms: false },
    { label: 'Invoice due', desc: 'Payment due within 3 days', email: true, push: true, sms: true },
    { label: 'Report generated', desc: 'Scheduled reports ready to download', email: true, push: false, sms: false },
    { label: 'Login from new device', desc: 'Security alert for unrecognised sign-in', email: true, push: true, sms: true },
  ];

  toggleNotif(row: NotificationRow, channel: 'email' | 'push' | 'sms') {
    row[channel] = !row[channel];
  }

  saveNotifications() {
    // TODO: call API
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