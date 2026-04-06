import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, User, Mail, Shield, Key, Bell, CheckCircle, ShieldAlert } from 'lucide-angular';
import { AuthService } from '../../guards/auth.service';
import { UserInitResponse } from '../../models/Init-response.model';
import { ToastService } from '../toast/toastService';
import { UserManagementService } from '../../../views/user-management/userManagement.service';
import { UserAddressModel, UserModel } from '../../../views/user-management/models/user.model';
import { ModalService } from '../modal/modalService';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  @ViewChild('addressModal') addressModalTemplate!: any;
  @ViewChild('securityModal') securityModalTemplate!: any;

  readonly UserIcon = User;
  readonly MailIcon = Mail;
  readonly ShieldIcon = Shield;
  readonly KeyIcon = Key;
  readonly BellIcon = Bell;
  readonly CheckCircleIcon = CheckCircle;
  readonly ShieldAlertIcon = ShieldAlert;

  user = signal<UserInitResponse | null>(null);
  userDetails = signal<UserModel | null>(null);
  userAddress = signal<UserAddressModel | null>(null);

  personalForm!: FormGroup;
  securityForm!: FormGroup;
  addressForm!: FormGroup;

  isSavingPersonal = signal(false);
  isSavingSecurity = signal(false);
  isSavingAddress = signal(false);
  editingAddressId = signal<number | null>(null);

  constructor(
    private authSvc: AuthService,
    private modalService: ModalService,
    private userManagementSvc: UserManagementService,
    private fb: FormBuilder,
    private toastSvc: ToastService
  ) { }

  ngOnInit() {
    this.authSvc.currentUser$.subscribe(u => {
      this.user.set(u);
      this.initPersonalForm(u);
    });
    this.initSecurityForm();
    this.getUserDetails();
  }

  private initPersonalForm(u: UserInitResponse | null) {
    this.personalForm = this.fb.group({
      fullName: [u?.fullName || '', Validators.required],
      email: [{ value: u?.email || '', disabled: true }],
      phone: [u?.phone || '', Validators.required]
    });
    this.initAddressForm();
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

  onSavePersonal() {
    if (this.personalForm.invalid) return;
    this.isSavingPersonal.set(true);
    // Simulate API call
    setTimeout(() => {
      this.isSavingPersonal.set(false);
      this.toastSvc.show('Profile updated successfully', 'success');
    }, 1000);
  }

  onSaveSecurity() {
    if (this.securityForm.invalid) return;
    if (this.securityForm.value.newPassword !== this.securityForm.value.confirmPassword) {
      this.toastSvc.show('Passwords do not match', 'error');
      return;
    }

    this.isSavingSecurity.set(true);
    // Simulate API call
    setTimeout(() => {
      this.isSavingSecurity.set(false);
      this.toastSvc.show('Password changed successfully', 'success');
      this.closeSecurityModal();
    }, 1000);
  }

  getUserDetails() {
    this.userManagementSvc.getUserById(1,
      (response: any) => {
        this.userDetails.set(response.data);
      },
      (error: any) => {
        this.toastSvc.show(error.error.message, 'error');
      }
    )
  }

  addUserAddress(userId: number, data: UserAddressModel) {
    this.userManagementSvc.addUserAddress(userId, data,
      (response: any) => {
        this.toastSvc.show("Address added successfully", 'success');
      },
      (error: any) => {
        this.toastSvc.show(error.error.message, 'error');
      }
    )
  }

  updateUserAddress(userId: number, addressId: number, data: UserAddressModel) {
    this.userManagementSvc.updateUserAddress(userId, addressId, data,
      (response: any) => {
        this.toastSvc.show("Address updated successfully", 'success');
      },
      (error: any) => {
        this.toastSvc.show(error.error.message, 'error');
      }
    )
  }

  openFromAddress(address?: UserAddressModel) {
    if (address) {
      this.editingAddressId.set(address.id);
      this.addressForm.patchValue(address);
    } else {
      this.editingAddressId.set(null);
      this.addressForm.reset({ type: 'HOME' });
    }
    this.modalService.openTemplate(this.addressModalTemplate, null, 'lg');
  }

  closeAddressModal() {
    this.modalService.close();
    this.editingAddressId.set(null);
    this.addressForm.reset();
  }

  onSaveAddress() {
    const userId = this.userDetails()?.id;
    if (this.addressForm.invalid || !userId) return;

    this.isSavingAddress.set(true);
    const data = this.addressForm.value;
    const addrId = this.editingAddressId();

    if (addrId) {
      this.updateUserAddress(userId, addrId, data);
    } else {
      this.addUserAddress(userId, data);
    }
    // Note: Simulated timeout in API calls is handling success toast,
    // so we can just close the modal.
    setTimeout(() => {
      this.isSavingAddress.set(false);
      this.closeAddressModal();
      this.getUserDetails(); // Refresh list
    }, 500);
  }

  openSecurityModal() {
    this.modalService.openTemplate(this.securityModalTemplate, null, 'md');
  }

  closeSecurityModal() {
    this.modalService.close();
    this.securityForm.reset();
  }
}