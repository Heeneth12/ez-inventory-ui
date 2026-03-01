import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ArrowRight, CloudCog, CloudDownloadIcon, UserPenIcon, UserRoundCog } from 'lucide-angular';
import { DrawerService } from '../../layouts/components/drawer/drawerService';
import { ToastService } from '../../layouts/components/toast/toastService';
import { UserManagementService } from './userManagement.service';
import { StandardTableComponent } from "../../layouts/components/standard-table/standard-table.component";
import { HeaderAction, PaginationConfig, TableAction, TableActionConfig, TableColumn } from '../../layouts/components/standard-table/standard-table.model';
import { RoleModel, ApplicationModel, ModuleModel, PrivilegeModel } from './models/application.model';
import { UserFilterModel, UserModel } from './models/user.model';
import { TenantModel } from './models/tenant.model';
import { CreateUserRequest } from './models/user.interfaces';
import { USER_ACTIONS, USER_COLUMNS, USER_FILTER_OPTIONS } from './user-managementConfig';
import { FilterOption } from '../../layouts/UI/filter-dropdown/filter-dropdown.component';

interface ApplicationUI extends ApplicationModel {
  isExpanded?: boolean;       // Is the accordion open?
  isLoadingModules?: boolean; // Are we currently fetching modules for this app?
  modules?: ModuleModel[];    // The loaded modules
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, StandardTableComponent],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {

  @ViewChild('tenantDetailsTemplate') tenantDetailsTemplate!: TemplateRef<any>;
  @ViewChild('createRoleTemplate') createRoleTemplate!: TemplateRef<any>;
  @ViewChild('configApplicationsTemplate') configApplicationsTemplate!: TemplateRef<any>;
  @ViewChild('userDetailsTemplate') userDetailsTemplate!: TemplateRef<any>;

  users: UserModel[] = [];
  roles: RoleModel[] = [];
  applications: ApplicationUI[] = [];
  tenants: TenantModel[] = [];
  tenantDetails: TenantModel | null = null;
  userDetails: CreateUserRequest | null = null;
  userData: any = {};
  roleForm: RoleModel = new RoleModel();

  userFilter: UserFilterModel = new UserFilterModel();

  isConfigEditMode: boolean = false;
  isLoadingApps: boolean = false;
  isLoading: boolean = false;


  pagination: PaginationConfig = { pageSize: 20, currentPage: 1, totalItems: 0 };

  columns: TableColumn[] = USER_COLUMNS;
  viewActions: TableActionConfig[] = USER_ACTIONS;
  filterOptions: FilterOption[] = USER_FILTER_OPTIONS;

  headerActions: HeaderAction[] = [
    {
      label: 'Create User',
      icon: UserPenIcon,
      variant: 'outline',
      key: 'create_user',
      action: () => this.openCreateUser()
    },
    {
      label: 'Create Role',
      icon: UserRoundCog,
      variant: 'primary',
      key: 'create_role',
      action: () => this.openCreateRole()
    }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public drawerService: DrawerService,
    private toast: ToastService,
    private userManagementService: UserManagementService
  ) { }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    this.userManagementService.getAllUsers(0, 100,
      this.userFilter,
      (res: any) => {
        this.users = res.data.content;
        this.isLoading = false;
      },
      (err: any) => {
        this.isLoading = false;
        this.toast.show('Failed to load users for tenant', 'error');
      }
    );
  }

  getTenantDetails(tenantId: number) {
    this.userManagementService.getTenantById(tenantId,
      (res: any) => {
        this.tenantDetails = res.data;
        this.drawerService.openTemplate(
          this.tenantDetailsTemplate,
          'Tenant Details',
          'lg'
        );
      },
      (err: any) => {
        this.toast.show('Failed to load tenant details', 'error');
      }
    );
  }

  getUserDetails(userId: number) {
    this.userManagementService.getUserById(userId,
      (res: any) => {
        this.userData = res.data;
        this.drawerService.openTemplate(
          this.userDetailsTemplate,
          'User Details',
          'lg'
        );
      },
      (err: any) => {
        this.toast.show('Failed to load user details', 'error');
      }
    );
  }


  getAllRoles() {
    this.userManagementService.getAllRoles(
      (res: any) => {
        this.roles = res.data;
      },
      (err: any) => {
        this.toast.show('Failed to load roles', 'error');
      }
    );
  }

  createRole() {
    this.userManagementService.createRole(this.roleForm,
      (res: any) => {
        this.toast.show('Role created successfully', 'success');
        this.drawerService.close();
      },
      (err: any) => {
        this.toast.show('Failed to create role', 'error');
      }
    );
  }

  openCreateRole() {
    this.getAllRoles();
    this.drawerService.openTemplate(
      this.createRoleTemplate,
      'Create Role',
      'lg'
    );
  }

  openCreateUser() {
    this.router.navigate(['form'], { relativeTo: this.route });
  }

  editUser(tenantId: number | string) {
    this.router.navigate(['form', tenantId], { relativeTo: this.route });
  }

  viewTenantDetails(tenantId: number) {
    this.getTenantDetails(tenantId);
  }

  toggleUserStatus(item: UserModel) {
    this.userManagementService.toggleUserStatus(item.id,
      (response: any) => {
        this.toast.show(
          response.data.message,
          response.data.status === 'SUCCESS' ? 'success' : 'warning'
        );
        this.loadUsers();
      },
      (error: any) => {
        this.toast.show('Failed to update item status', 'error');
      }
    );
  }

  openConfigApplications() {
    this.isConfigEditMode = false;
    this.isLoadingApps = true;
    this.drawerService.openTemplate(
      this.configApplicationsTemplate,
      'Application Registry',
      'xl'
    );

    this.userManagementService.getAllApplications(
      (res: any) => {
        this.applications = res.data.map((app: any) => ({
          ...app,
          isExpanded: false,
          isLoadingModules: false,
          modules: []
        }));
        this.isLoadingApps = false;
      },
      (err: any) => {
        this.isLoadingApps = false;
        this.toast.show('Failed to load applications', 'error');
      }
    );
  }

  toggleAppExpansion(app: ApplicationUI) {
    // 1. Toggle the UI flag
    app.isExpanded = !app.isExpanded;

    // 2. Lazy Load: If opening AND modules are empty, fetch them
    if (app.isExpanded && (!app.modules || app.modules.length === 0)) {

      app.isLoadingModules = true;

      this.userManagementService.getModulesByApplication(app.id,
        (res: any) => {
          app.modules = res.data; // Expecting ModuleDto[]
          app.isLoadingModules = false;
        },
        (err: any) => {
          app.isLoadingModules = false;
          app.isExpanded = false; // Collapse on error
          this.toast.show(`Failed to load modules for ${app.appName}`, 'error');
        }
      );
    }
  }

  toggleConfigEditMode() {
    this.isConfigEditMode = !this.isConfigEditMode;
  }

  saveApplicationConfig() {
    console.log('Saving configuration...', this.applications);
    // Call API update here
    this.isConfigEditMode = false;
    this.toast.show('Configuration saved successfully', 'success');
  }

  onTableAction(event: TableAction) {
    // console.log("Table action event:", event);
    const { type, row } = event;

    switch (type) {
      case 'view':
        break;
      case 'edit':
        this.editUser(row.id);
        break;
      case 'delete':
        break;
      case 'toggle':
        this.toggleUserStatus(row as UserModel);
        break;
    }
  }

  handleTableAction(event: TableAction) {
    if (event.type === 'custom' && event.key === 'view_tenant_details') {
      this.viewTenantDetails(Number(event.row.id));
    }
    if (event.type === 'custom' && event.key === 'view_user_details') {
      this.getUserDetails(Number(event.row.id));
    }
    if (event.type === 'custom' && event.key === 'view_profile') {
      this.router.navigate(['admin/user/profile', event.row.id]);
    }
    if (event.type === 'custom' && event.key === 'edit_profile') {
      this.editUser(Number(event.row.id));
    }
  }

  onSearchChange(searchQuery: string) {
    this.userFilter.searchQuery = searchQuery;
    this.pagination.currentPage = 1;
    this.loadUsers();
  }

  onFilterUpdate($event: Record<string, any>) {
    this.userFilter = $event;
    this.loadUsers();
  }

  onPageChange($event: number) {
    console.log("Page change event:", $event);
  }

  onLoadMore() {
    console.log("Load more event");
  }

}