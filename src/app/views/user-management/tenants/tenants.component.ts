import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { StandardTableComponent } from "../../../layouts/components/standard-table/standard-table.component";
import { Router } from '@angular/router';
import { DrawerService } from '../../../layouts/components/drawer/drawerService';
import { TableColumn, PaginationConfig, HeaderAction, TableAction, TableActionConfig } from '../../../layouts/components/standard-table/standard-table.model';
import { ToastService } from '../../../layouts/components/toast/toastService';
import { UserManagementService } from '../userManagement.service';
import {ArrowRight, CloudDownloadIcon } from 'lucide-angular';
import { RoleModel } from '../models/application.model';
import { TenantModel } from '../models/tenant.model';
import { UserModel } from '../models/user.model';

@Component({
  selector: 'app-tenants',
  standalone: true,
  imports: [CommonModule, StandardTableComponent],
  templateUrl: './tenants.component.html',
  styleUrl: './tenants.component.css'
})
export class TenantsComponent {

  @ViewChild('tenantDetailsTemplate') tenantDetailsTemplate!: TemplateRef<any>;
  @ViewChild('configApplicationsTemplate') configApplicationsTemplate!: TemplateRef<any>;

  users: UserModel[] = [];
  roles: RoleModel[] = [];
  tenants: TenantModel[] = [];
  tenantDetails: TenantModel | null = null;

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
      label: 'Config Applications',
      icon: CloudDownloadIcon,
      variant: 'primary',
      key: 'config_applications',
      action: () => console.log('Config Applications clicked')
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
