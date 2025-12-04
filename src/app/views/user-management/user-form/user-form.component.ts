import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastService } from '../../../layouts/components/toast/toastService';
import { RoleModel, ApplicationModel, ModuleModel } from '../models/application.model';
import { PrivilegeAssignRequest } from '../models/user.interfaces';
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
  roles: RoleModel[] = [];
  applications: ApplicationModel[] = [];
  appModulesMap: Map<number, ModuleModel[]> = new Map();

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
      isActive: [true]
    });
  }

  ngOnInit() {
    this.isLoading = true;
    // Check Edit Mode
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.userId = Number(idParam);
      this.isEditing = true;
      this.userForm.get('email')?.disable();
      this.userForm.get('password')?.removeValidators(Validators.required);
    } else {
      this.userForm.get('password')?.addValidators([Validators.required, Validators.minLength(8)]);
    }

    this.loadDependencies();
  }

  loadDependencies() {
    this.userService.getAllRoles((resRoles: any) => {
      this.roles = resRoles.data;

      this.userService.getAllApplications((resApps: any) => {
        this.applications = resApps.data;

        if (this.isEditing && this.userId) {
          // this.loadUserData(this.userId);
        } else {
          this.isLoading = false;
        }
      }, (err: any) => this.handleError(err));
    }, (err: any) => this.handleError(err));
  }

  // loadUserData(id: number) {
  //   this.userService.getUserById(id, (res: any) => {
  //     this.patchUserToForm(res.data);
  //     this.isLoading = false;
  //   }, (err: any) => {
  //     this.toast.show('Failed to load user', 'error');
  //     this.onCancel();
  //   });
  // }

  patchUserToForm(user: any) {
    this.userForm.patchValue({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      isActive: user.isActive
    });

    user.userRoles?.forEach((ur: any) => this.selectedRoleIds.add(ur.role.id));

    user.userApplications?.forEach((ua: any) => {
      const appId = ua.application.id;
      this.selectedAppIds.add(appId);
      this.loadModulesForApp(appId);

      if (ua.modulePrivileges) {
        ua.modulePrivileges.forEach((ump: any) => {
          this.addPrivilegeToMap(appId, ump.module.id, ump.privilege.id);
        });
      }
    });
  }


  onCancel() {
    this.location.back();
  }

  onSubmit() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formVal = this.userForm.value;
    const privilegeMapping: PrivilegeAssignRequest[] = [];
    this.selectedPrivileges.forEach((modulesMap, appId) => {
      if (this.selectedAppIds.has(appId)) {
        modulesMap.forEach((privIds, moduleId) => {
          if (privIds.size > 0) {
            privilegeMapping.push({
              applicationId: appId,
              moduleId: moduleId,
              privilegeIds: Array.from(privIds)
            });
          }
        });
      }
    });

    const requestBody: any = {
      fullName: formVal.fullName,
      phone: formVal.phone,
      isActive: formVal.isActive,
      roleIds: Array.from(this.selectedRoleIds),
      applicationIds: Array.from(this.selectedAppIds),
      privilegeMapping: privilegeMapping
    };

    if (!this.isEditing) {
      requestBody.email = formVal.email;
      requestBody.password = formVal.password;
    } else {
      if (formVal.password) requestBody.password = formVal.password;
      requestBody.id = this.userId;
    }

    const callback = (res: any) => {
      this.toast.show(this.isEditing ? 'User updated' : 'User created', 'success');
      this.onCancel();
    };

    const errCallback = (err: any) => {
      this.isSubmitting = false;
      this.toast.show(err.error?.message || 'Operation failed', 'error');
    };

    if (this.isEditing) {
      this.userService.updateUser(requestBody, callback, errCallback);
    } else {
      this.userService.createUser(requestBody, callback, errCallback);
    }
  }

  // --- HELPER LOGIC ---

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
  };
}