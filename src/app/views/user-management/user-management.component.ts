import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ArrowRight, CloudDownloadIcon, UserPenIcon } from 'lucide-angular';
import { DrawerService } from '../../layouts/components/drawer/drawerService';
import { ToastService } from '../../layouts/components/toast/toastService';
import { UserManagementService } from './userManagement.service';
import { StandardTableComponent } from "../../layouts/components/standard-table/standard-table.component";
import { HeaderAction, PaginationConfig, TableAction, TableActionConfig, TableColumn } from '../../layouts/components/standard-table/standard-table.model';
import { RoleModel, ApplicationModel, ModuleModel, PrivilegeModel } from './models/application.model';
import { UserFilterModel, UserModel } from './models/user.model';
import { TenantModel } from './models/tenant.model';

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
  @ViewChild('configApplicationsTemplate') configApplicationsTemplate!: TemplateRef<any>;

  users: UserModel[] = [];
  roles: RoleModel[] = [];
  applications: ApplicationUI[] = [];
  tenants: TenantModel[] = [];
  tenantDetails: TenantModel | null = null;

  userFilter: UserFilterModel = new UserFilterModel();

  isConfigEditMode: boolean = false;
  isLoadingApps: boolean = false;

  pagination: PaginationConfig = { pageSize: 20, currentPage: 1, totalItems: 0 };

  columns: TableColumn[] = [
    { key: 'tenantName', label: 'Tenant', width: '130px', type: 'profile' },
    { key: 'tenantCode', label: 'Tenant Id', width: '100px', type: 'text' },
    { key: 'email', label: 'Email', width: '220px', type: 'link' },
    { key: 'phone', label: 'Phone', width: '100px', type: 'text' },
    { key: 'isActive', label: 'Active', width: '130px', type: 'toggle', align: 'center' },
    { key: 'actions', label: 'Actions', width: '120px', type: 'action', align: 'center', sortable: false }
  ];

  headerActions: HeaderAction[] = [
    {
      label: 'Create User',
      icon: UserPenIcon,
      variant: 'primary',
      key: 'create_user',
      action: () => this.router.navigateByUrl('/admin/users/form')
    }
  ];

  viewActions: TableActionConfig[] = [
    {
      key: 'view_tenant_details',
      label: 'View Details',
      icon: ArrowRight,
      color: 'primary',
      condition: (row) => true
    }
  ];

  constructor(
    private router: Router,
    public drawerService: DrawerService,
    private toast: ToastService,
    private userManagementService: UserManagementService
  ) { }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoadingApps = true; // Optional: Use a loading state if you have one
    this.userManagementService.getAllUsers(0, 100,
      this.userFilter,
      (res: any) => {
        this.users = res.data.content;
      },
      (err: any) => {
        this.isLoadingApps = false;
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

  viewTenantDetails(tenantId: number) {
    this.getTenantDetails(tenantId);
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
        break;
    }
  }

  handleTableAction(event: TableAction) {
    if (event.type === 'custom' && event.key === 'view_tenant_details') {
      this.viewTenantDetails(Number(event.row.id));
    }
  }

  onPageChange($event: number) {
    console.log("Page change event:", $event);
  }

  onLoadMore() {
    console.log("Load more event");
  }

  editUser(userId: any) {
    this.router.navigate(['/admin/user-management/edit', userId]);
  }
}