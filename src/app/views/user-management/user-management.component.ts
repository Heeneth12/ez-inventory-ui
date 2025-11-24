import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { DrawerService } from '../../layouts/components/drawer/drawerService';
import { ToastService } from '../../layouts/components/toast/toastService';

export interface Application {
  id: number;
  appCode: string;
  appName: string;
  description?: string;
  baseUrl?: string;
}

export interface Role {
  id: number;
  roleName: string;
  description?: string;
}

export interface UserDetail {
  id: number;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  isActive: boolean;
  isEmailVerified: boolean | null;
  lastLoginAt: string | null;
}

// The root object structure you provided
export interface UserComposite {
  user: UserDetail;
  applications: Application[];
  roles: Role[];
  privileges: any[];
  accessibleRoutes: any[];
  avatarColor?: string;
  initials?: string;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  @ViewChild('userFormTemplate') formTemplate!: TemplateRef<any>;

  users: UserComposite[] = [];
  filteredUsers: UserComposite[] = [];
  userForm: FormGroup;
  searchTerm = '';
  statusFilter = 'all';

  // Mock Available Data (In real app, fetch from API)
  availableApps: Application[] = [
    { id: 1, appCode: 'AUTH', appName: 'Auth Service', description: 'Identity management' },
    { id: 2, appCode: 'INVENTORY', appName: 'Inventory System', description: 'Stock tracking' },
    { id: 3, appCode: 'CRM', appName: 'Customer CRM', description: 'Client relations' }
  ];
  availableRoles: Role[] = [
    { id: 1, roleName: 'ADMIN' },
    { id: 2, roleName: 'MANAGER' },
    { id: 3, roleName: 'USER' },
    { id: 4, roleName: 'VIEWER' }
  ];

  // Temp storage for selections in the form
  selectedAppIds: Set<number> = new Set();
  selectedRoleIds: Set<number> = new Set();

  isEditing = false;
  editingId: number | null = null;

  constructor(
    private fb: FormBuilder,
    public drawerService: DrawerService,
    private toast: ToastService
  ) {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      firstName: [''],
      lastName: [''],
      phone: [''],
      isActive: [true]
    });
  }

  ngOnInit() {
    this.loadMockData();
    this.applyFilters();
  }


  openForm(item?: UserComposite) {
    this.isEditing = !!item;
    this.editingId = item ? item.user.id : null;
    
    // Reset selections
    this.selectedAppIds.clear();
    this.selectedRoleIds.clear();

    if (item) {
      this.userForm.patchValue({
        username: item.user.username,
        email: item.user.email,
        firstName: item.user.firstName,
        lastName: item.user.lastName,
        phone: item.user.phone,
        isActive: item.user.isActive
      });
      // Pre-select existing
      item.applications.forEach(app => this.selectedAppIds.add(app.id));
      item.roles.forEach(role => this.selectedRoleIds.add(role.id));
    } else {
      this.userForm.reset({ isActive: true });
    }

    this.drawerService.open(
      this.formTemplate,
      this.isEditing ? 'Edit User Details' : 'Create New User',
    );
  }

  saveUser() {
    if (this.userForm.invalid) return;
    const formVal = this.userForm.value;

    // Construct the composite object
    // Map selected IDs back to objects
    const assignedApps = this.availableApps.filter(a => this.selectedAppIds.has(a.id));
    const assignedRoles = this.availableRoles.filter(r => this.selectedRoleIds.has(r.id));

    const newUserDetail: UserDetail = {
      id: this.isEditing ? this.editingId! : Math.floor(Math.random() * 10000),
      username: formVal.username,
      email: formVal.email,
      firstName: formVal.firstName,
      lastName: formVal.lastName,
      phone: formVal.phone,
      isActive: formVal.isActive,
      isEmailVerified: true, // Defaulting for demo
      lastLoginAt: this.isEditing ? new Date().toISOString() : null
    };

    const newUserComposite: UserComposite = {
      user: newUserDetail,
      applications: assignedApps,
      roles: assignedRoles,
      privileges: [],
      accessibleRoutes: [],
      // Re-calc visuals
      initials: (formVal.firstName?.[0] || formVal.username?.[0] || '?').toUpperCase(),
      avatarColor: this.getRandomColor()
    };

    if (this.isEditing) {
      const idx = this.users.findIndex(u => u.user.id === this.editingId);
      if (idx !== -1) {
        // Keep original color/initials if desired, or update
        newUserComposite.avatarColor = this.users[idx].avatarColor; 
        this.users[idx] = newUserComposite;
        this.toast.show('User updated successfully', 'success');
      }
    } else {
      this.users.unshift(newUserComposite);
      this.toast.show('User created successfully', 'success');
    }

    this.applyFilters();
    this.drawerService.close();
  }

  deleteUser(item: UserComposite) {
    if (confirm(`Delete user ${item.user.username}?`)) {
      this.users = this.users.filter(u => u.user.id !== item.user.id);
      this.applyFilters();
      this.toast.show('User deleted', 'info');
    }
  }

  toggleStatus(item: UserComposite) {
    item.user.isActive = !item.user.isActive;
    this.toast.show(`User ${item.user.username} is now ${item.user.isActive ? 'Active' : 'Inactive'}`, 'info');
  }

  // --- Selection Helpers for Form ---

  isAppSelected(id: number): boolean { return this.selectedAppIds.has(id); }
  toggleApp(id: number) { 
    if (this.selectedAppIds.has(id)) this.selectedAppIds.delete(id);
    else this.selectedAppIds.add(id);
  }

  isRoleSelected(id: number): boolean { return this.selectedRoleIds.has(id); }
  toggleRole(id: number) {
    if (this.selectedRoleIds.has(id)) this.selectedRoleIds.delete(id);
    else this.selectedRoleIds.add(id);
  }

  // --- Filtering ---

  filterStatus(event: any) {
    this.statusFilter = event.target.value;
    this.applyFilters();
  }

  applyFilters() {
    this.filteredUsers = this.users.filter(u => {
      // 1. Text Search
      const term = this.searchTerm.toLowerCase();
      const matchesText = 
        u.user.username.toLowerCase().includes(term) ||
        u.user.email.toLowerCase().includes(term) ||
        (u.user.firstName && u.user.firstName.toLowerCase().includes(term)) ||
        (u.user.lastName && u.user.lastName.toLowerCase().includes(term));
      
      // 2. Status Filter
      let matchesStatus = true;
      if (this.statusFilter === 'active') matchesStatus = u.user.isActive;
      if (this.statusFilter === 'inactive') matchesStatus = !u.user.isActive;

      return matchesText && matchesStatus;
    });
  }

  // --- Utils ---

  getRandomColor() {
    const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  loadMockData() {
    this.users = [
      {
        user: { id: 7, username: 'john', email: 'john@test.com', firstName: 'John', lastName: 'Doe', phone: '555-1234', isActive: true, isEmailVerified: true, lastLoginAt: '2023-11-20T10:30:00Z' },
        applications: [{ id: 1, appCode: 'AUTH', appName: 'Authentication Service', description: 'Handles auth', baseUrl: '' }],
        roles: [{ id: 1, roleName: 'ADMIN' }],
        privileges: [], accessibleRoutes: [],
        initials: 'JD', avatarColor: '#3b82f6'
      },
      {
        user: { id: 8, username: 'jane_dev', email: 'jane@tech.com', firstName: null, lastName: null, phone: null, isActive: false, isEmailVerified: false, lastLoginAt: null },
        applications: [{ id: 2, appCode: 'INVENTORY', appName: 'Inventory System', description: '', baseUrl: '' }],
        roles: [{ id: 3, roleName: 'USER' }],
        privileges: [], accessibleRoutes: [],
        initials: 'JA', avatarColor: '#f59e0b'
      }
    ];
  }
}