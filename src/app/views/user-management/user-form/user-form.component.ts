import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastService } from '../../../layouts/components/toast/toastService';
import { RoleModel, ApplicationModel, ModuleModel } from '../models/application.model';
import { PrivilegeAssignRequest } from '../models/user.interfaces';
import { AddressType, UserAddressModel } from '../models/user.model';
import { UserManagementService } from '../userManagement.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.css'
})
export class UserFormComponent implements OnInit {

  userForm: FormGroup;
  isEditing = false;
  userId: number | null = null;
  isLoading = false;
  isSubmitting = false;

  // Data Sources
  roles: RoleModel[] = []; // Actual roles from database
  applications: ApplicationModel[] = [];
  
  // Default ADMIN role for vendors
  private defaultAdminRole: RoleModel = {
    id: -1,
    roleName: 'ADMIN',
    roleKey: 'ADMIN',
    description: 'Administrator role for vendor users'
  };
  appModulesMap: Map<number, ModuleModel[]> = new Map();

  // Enums for Template
  addressTypes = Object.values(AddressType);
  userTypes: string[] = []; // Loaded from backend

  // Selection State
  selectedAppIds: Set<number> = new Set();
  selectedRoleIds: Set<number> = new Set();
  selectedPrivileges: Map<number, Map<number, Set<number>>> = new Map();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private userService: UserManagementService,
    private toast: ToastService
  ) {
    this.userForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      password: [''],
      isActive: [true],
      userType: ['', Validators.required], // Will be set after loading user types
      address: this.fb.array([])
    });
  }

  get addressArray(): FormArray {
    return this.userForm.get('address') as FormArray;
  }

  ngOnInit() {
    this.isLoading = true;
    // Check Edit Mode
    this.route.paramMap.subscribe(params => {
      this.userId = Number(params.get('id'));
      if (this.userId) {
        this.isEditing = true;
        this.userForm.get('email')?.disable();
        this.userForm.get('password')?.removeValidators(Validators.required);
      } else {
        this.userForm.get('password')?.addValidators([Validators.required, Validators.minLength(8)]);
        // Optional: Add one empty address block by default for new users
        this.addAddress();
      }
      this.userForm.get('password')?.updateValueAndValidity();
    });

    this.loadDependencies();

    // Listen to userType changes to auto-select ADMIN for vendors
    this.userForm.get('userType')?.valueChanges.subscribe(userType => {
      if (userType === 'VENDOR') {
        this.autoSelectAdminRole();
      }
    });
  }

  loadDependencies() {
    // Load user types first
    this.userService.getUserTypes((resTypes: any) => {
      this.userTypes = resTypes.data;
      
      // Set default user type if creating new user
      if (!this.isEditing && this.userTypes.length > 0) {
        this.userForm.patchValue({ userType: this.userTypes[0] });
      }

      this.userService.getAllRoles((resRoles: any) => {
        this.roles = resRoles.data;

        this.userService.getAllApplications((resApps: any) => {
          this.applications = resApps.data;

          if (this.isEditing && this.userId) {
            this.loadUserData(this.userId);
          } else {
            this.isLoading = false;
          }
        }, (err: any) => this.handleError(err));
      }, (err: any) => this.handleError(err));
    }, (err: any) => this.handleError(err));
  }

  loadUserData(id: number) {
    this.userService.getUserById(id, (res: any) => {
      this.patchUserToForm(res.data);
      this.isLoading = false;
    }, (err: any) => {
      this.toast.show('Failed to load user', 'error');
      this.onCancel();
    });
  }

  patchUserToForm(user: any) {
    // 1. Patch Basic Fields
    this.userForm.patchValue({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      isActive: user.isActive,
      userType: user.userType
    });

    // 2. Patch Roles
    // Backend sends: userRoles: [{ roleId: 1, roleName: "Admin"... }]
    this.selectedRoleIds.clear();
    if (user.userRoles) {
      user.userRoles.forEach((ur: any) => {
        // IMPORTANT: Use 'roleId' if your DTO has it, otherwise check the object structure
        if (ur.roleId) this.selectedRoleIds.add(ur.roleId);
      });
    }

    // 3. Patch Applications & Privileges
    // Backend sends: userApplications: [{ applicationId: 1, modulePrivileges: [...] }]
    this.selectedAppIds.clear();
    this.selectedPrivileges.clear();

    if (user.userApplications) {
      user.userApplications.forEach((appDto: any) => {

        const appId = appDto.applicationId;

        // A. Mark App as Selected
        this.selectedAppIds.add(appId);

        // B. Load modules for this app (so the accordion UI works)
        this.loadModulesForApp(appId);

        // C. Map the Privileges
        // Backend DTO field is 'modulePrivileges' (List of { moduleId, privilegeId })
        if (appDto.modulePrivileges) {
          appDto.modulePrivileges.forEach((privDto: any) => {
            // Add to the Map: appId -> moduleId -> Set(privilegeIds)
            this.addPrivilegeToMap(appId, privDto.moduleId, privDto.privilegeId);
          });
        }
      });
    }

    // 4. Patch Addresses
    this.addressArray.clear();
    const incomingAddresses = user.addresses || [];
    if (incomingAddresses.length > 0) {
      incomingAddresses.forEach((addr: any) => {
        this.addressArray.push(this.createAddressGroup(addr));
      });
    }

    // 5. If user is VENDOR, ensure ADMIN role is selected
    if (user.userType === 'VENDOR') {
      this.autoSelectAdminRole();
    }
  }


  createAddressGroup(addr?: UserAddressModel): FormGroup {
    return this.fb.group({
      id: [addr?.id || null], // Keep ID for updates
      addressLine1: [addr?.addressLine1 || '', Validators.required],
      addressLine2: [addr?.addressLine2 || ''],
      route: [addr?.route || ''],
      area: [addr?.area || ''],
      city: [addr?.city || '', Validators.required],
      state: [addr?.state || '', Validators.required],
      country: [addr?.country || '', Validators.required],
      pinCode: [addr?.pinCode || '', Validators.required],
      type: [addr?.type || AddressType.HOME, Validators.required]
    });
  }

  addAddress() {
    this.addressArray.push(this.createAddressGroup());
  }

  removeAddress(index: number) {
    this.addressArray.removeAt(index);
  }

  // --- SUBMISSION ---

  onSubmit() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this.toast.show('Please fill in all required fields', 'warning');
      return;
    }

    this.isSubmitting = true;
    const formVal = this.userForm.getRawValue();

    // --- FIX STARTS HERE ---
    const privilegeMapping: PrivilegeAssignRequest[] = [];

    this.selectedPrivileges.forEach((modulesMap, appId) => {
      // Only process privileges if the App itself is still selected
      if (this.selectedAppIds.has(appId)) {
        modulesMap.forEach((privIds, moduleId) => {

          // REMOVED THE "if (privIds.size > 0)" CHECK
          // We must send the entry even if empty, so the backend knows to delete existing privileges.

          privilegeMapping.push({
            applicationId: appId,
            moduleId: moduleId,
            privilegeIds: Array.from(privIds)
          });

        });
      }
    });
    // --- FIX ENDS HERE ---

    const requestBody: any = {
      fullName: formVal.fullName,
      phone: formVal.phone,
      isActive: formVal.isActive,
      userType: formVal.userType,
      roleIds: Array.from(this.selectedRoleIds),
      applicationIds: Array.from(this.selectedAppIds),
      privilegeMapping: privilegeMapping,
      address: formVal.address
    };

    if (!this.isEditing) {
      requestBody.email = formVal.email;
      requestBody.password = formVal.password;
    } else {
      if (formVal.password) requestBody.password = formVal.password;
      requestBody.id = this.userId;
    }

    const callback = (res: any) => {
      this.toast.show(this.isEditing ? 'User updated successfully' : 'User created successfully', 'success');
      this.onCancel();
    };

    const errCallback = (err: any) => {
      this.isSubmitting = false;
      this.toast.show(err.error?.message || 'Operation failed', 'error');
    };

    if (this.isEditing) {
      this.userService.updateUser(requestBody, this.userId!, callback, errCallback);
    } else {
      this.userService.createUser(requestBody, callback, errCallback);
    }
  }

  onCancel() {
    this.location.back();
  }

  loadModulesForApp(appId: number) {
    if (this.appModulesMap.has(appId)) return;
    this.userService.getModulesByApplication(appId, (res: any) => {
      this.appModulesMap.set(appId, res.data);
    }, this.handleError);
  }

  toggleModuleExpand(appId: number, module: ModuleModel) {
    module.isExpanded = !module.isExpanded;
    if (module.isExpanded && (!module.privileges || !module.privileges.length)) {
      this.userService.getPrivilegesByModule(module.id, (res: any) => {
        module.privileges = res.data;
      }, this.handleError);
    }
  }

  toggleApp(appId: number) {
    this.selectedAppIds.has(appId) ? this.selectedAppIds.delete(appId) : this.selectedAppIds.add(appId);
    if (this.selectedAppIds.has(appId)) this.loadModulesForApp(appId);
  }

  toggleRole(id: number) {
    this.selectedRoleIds.has(id) ? this.selectedRoleIds.delete(id) : this.selectedRoleIds.add(id);
  }

  togglePrivilege(appId: number, modId: number, privId: number) {
    this.addPrivilegeToMap(appId, modId, privId, true);
  }

  addPrivilegeToMap(appId: number, modId: number, privId: number, isToggle = false) {
    if (!this.selectedPrivileges.has(appId)) this.selectedPrivileges.set(appId, new Map());
    const appMap = this.selectedPrivileges.get(appId)!;

    if (!appMap.has(modId)) appMap.set(modId, new Set());
    const privSet = appMap.get(modId)!;

    if (isToggle && privSet.has(privId)) {
      privSet.delete(privId);
    } else {
      privSet.add(privId);
    }
  }

  isPrivilegeSelected(appId: number, modId: number, privId: number): boolean {
    return this.selectedPrivileges.get(appId)?.get(modId)?.has(privId) ?? false;
  }

  handleError = (err: any) => {
    console.error(err);
    this.isLoading = false;
    this.toast.show('An error occurred', 'error');
  };

  // Computed property to get roles based on user type
  get displayedRoles(): RoleModel[] {
    const userType = this.userForm.get('userType')?.value;
    if (userType === 'VENDOR') {
      // For vendors, only show the default ADMIN role
      return [this.defaultAdminRole];
    }
    // For employees, show actual database roles
    return this.roles;
  }

  autoSelectAdminRole() {
    // For vendors, use the default ADMIN role
    this.selectedRoleIds.clear();
    this.selectedRoleIds.add(this.defaultAdminRole.id);
  }

  onUserTypeChange() {
    const userType = this.userForm.get('userType')?.value;
    if (userType === 'VENDOR') {
      this.autoSelectAdminRole();
    }
  }

  isRoleDisabled(role: RoleModel): boolean {
    const userType = this.userForm.get('userType')?.value;
    
    // If only one role is available, disable it (keep it selected)
    if (this.displayedRoles.length === 1) {
      return true;
    }
    
    if (userType === 'VENDOR') {
      // Only allow ADMIN role for vendors
      return role.roleKey !== 'ADMIN' && role.roleName.toUpperCase() !== 'ADMIN';
    }
    return false;
  }
}