import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { StandardTableComponent } from "../../../layouts/components/standard-table/standard-table.component";
import { ActivatedRoute, Router } from '@angular/router';
import { DrawerService } from '../../../layouts/components/drawer/drawerService';
import { TableColumn, PaginationConfig, HeaderAction, TableAction, TableActionConfig } from '../../../layouts/components/standard-table/standard-table.model';
import { ToastService } from '../../../layouts/components/toast/toastService';
import { UserManagementService } from '../userManagement.service';
import { ArrowRight, Building2, CloudDownloadIcon, UserCheck } from 'lucide-angular';
import { RoleModel } from '../models/application.model';
import { TenantModel, TenantRegistrationModel } from '../models/tenant.model';
import { UserFilterModel, UserModel } from '../models/user.model';
import { error } from 'highcharts';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tenants',
  standalone: true,
  imports: [CommonModule, StandardTableComponent, FormsModule],
  templateUrl: './tenants.component.html',
  styleUrl: './tenants.component.css'
})
export class TenantsComponent {

  @ViewChild('tenantDetailsTemplate') tenantDetailsTemplate!: TemplateRef<any>;
  @ViewChild('tenantUserDetailsTemplate') tenantUserDetailsTemplate!: TemplateRef<any>;

  users: UserModel[] = [];
  roles: RoleModel[] = [];
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
      label: 'Create Tenant',
      icon: Building2,
      variant: 'primary',
      key: 'config_applications',
      action: () => this.openCreateTenant()
    }
  ];

  viewActions: TableActionConfig[] = [
    {
      key: 'view_tenant_details',
      label: 'View Details',
      icon: ArrowRight,
      color: 'primary',
      condition: (row) => true
    },
    {
      key: 'view_users_details',
      label: 'User Details',
      icon: UserCheck,
      color: 'success',
      condition: (row) => true
    }
  ];


  newTenant: TenantRegistrationModel = {
    tenantName: '',
    appKey: '',
    adminFullName: '',
    adminEmail: '',
    password: '',
    adminPhone: '',
    isPersonal: false,
    address: {
      id: 0,
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
    public drawerService: DrawerService,
    private toast: ToastService,
    private userManagementService: UserManagementService
  ) {
  }

  ngOnInit() {
    this.loadTenants();
  }

  loadTenants() {
    this.userManagementService.getAllTenants(0, 100, {},
      (res: any) => {
        this.tenants = res.data.content;
      },
      (err: any) => {
        this.toast.show('Failed to load tenants', 'error');
      }
    );
  }

  loadUsersByTenant(tenantId: number) {
    this.userFilter.tenantId = tenantId;
    this.isLoadingApps = true;

    this.userManagementService.getAllUsers(0, 100, this.userFilter,
      (res: any) => {
        this.users = res.data.content;
        this.isLoadingApps = false;
        this.openUserDrawer();
      },
      (err: any) => {
        this.isLoadingApps = false;
        this.toast.show('Failed to load users for tenant', 'error');
      }
    );
  }

  openUserDrawer() {
    this.drawerService.openTemplate(
      this.tenantUserDetailsTemplate,
      'Associated Users',
      'lg' // Size of the drawer
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

  createTenant() {
    this.isLoadingApps = true;
    console.log(this.newTenant);
    this.userManagementService.createTenant(
      this.newTenant,
      (response: any) => {
        this.isLoadingApps = false;
        this.drawerService.close();
        this.toast.show('Tenant created successfully', 'success');
        this.loadTenants();
        this.resetForm();
      },
      (error: any) => {
        this.isLoadingApps = false;
        this.toast.show('Failed to create tenant', 'error');
      }
    );
  }

  resetForm() {
    this.newTenant = {
      tenantName: '', appKey: '', adminFullName: '', adminEmail: '',
      password: '', adminPhone: '', isPersonal: false,
      address: { id: 0, addressLine1: '', city: '', state: '', country: '', pinCode: '', type: 'Billing' }
    };
  }

  openCreateTenant() {
    this.router.navigate(['form'], { relativeTo: this.route });
  }

  editTenant(tenantId: number | string) {
    this.router.navigate(['form', tenantId], { relativeTo: this.route });
  }

  viewTenantDetails(tenantId: number) {
    this.getTenantDetails(tenantId);
  }


  toggleConfigEditMode() {
    this.isConfigEditMode = !this.isConfigEditMode;
  }


  onTableAction(event: TableAction) {
    // console.log("Table action event:", event);
    const { type, row } = event;

    switch (type) {
      case 'view':
        break;
      case 'edit':
        this.editTenant(row.id);
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
    if (event.type === 'custom' && event.key === 'view_users_details') {
      this.loadUsersByTenant(Number(event.row.id))
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