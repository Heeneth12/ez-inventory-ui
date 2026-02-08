import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../layouts/components/toast/toastService';
import { AuthService } from '../../layouts/guards/auth.service';
import { UserManagementService } from '../user-management/userManagement.service';
import { UserInitResponse } from '../../layouts/models/Init-response.model';
import { Observable, take } from 'rxjs';

// Defined tabs based on your request
type Tab = 'General' | 'Payments' | 'Security' | 'Subscriptions';

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
  tabs: Tab[] = ['General', 'Payments', 'Security', 'Subscriptions'];

  // Forms
  generalForm: FormGroup;

  // Data
  currentUser: any = null;
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
  }

  ngOnInit() {
    this.userData$.pipe(take(1)).subscribe(user => {
      if (user?.id) {
        this.loadUserData(user.id);
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
}