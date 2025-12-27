import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { StandardTableComponent } from "../../../layouts/components/standard-table/standard-table.component";
import { Router } from '@angular/router';
import { DrawerService } from '../../../layouts/components/drawer/drawerService';
import { TableColumn, PaginationConfig, HeaderAction, TableAction } from '../../../layouts/components/standard-table/standard-table.model';
import { ToastService } from '../../../layouts/components/toast/toastService';
import { UserManagementService } from '../userManagement.service';
import { LoaderService } from '../../../layouts/components/loader/loaderService';
import { Building, User, Mail, Phone, Key, FilePlusCorner } from 'lucide-angular';
import { FormField, DynamicFormComponent } from '../../../layouts/UI/dynamic-form/dynamic-form.component';

@Component({
  selector: 'app-tenants',
  standalone: true,
  imports: [CommonModule, StandardTableComponent, DynamicFormComponent],
  templateUrl: './tenants.component.html',
  styleUrl: './tenants.component.css'
})
export class TenantsComponent {

  @ViewChild('register') registerTemplate!: TemplateRef<any>;

  tenants: any = [];

  columns: TableColumn[] = [
    { key: 'id', label: 'id', width: '130px', type: 'text' },
    { key: 'tenantUuid', label: 'UUID', width: '130px', type: 'text' },
    { key: 'tenantName', label: 'Tenant Name', width: '150px', type: 'profile' }, // Adjusted based on DTO
    { key: 'tenantCode', label: 'Code', width: '100px', type: 'text' },
    { key: 'isActive', label: 'Active', width: '100px', type: 'toggle', align: 'center' },
    { key: 'actions', label: 'Actions', width: '120px', type: 'action', align: 'center', sortable: false }
  ];

  myHeaderActions: HeaderAction[] = [
    {
      label: 'Create',
      icon: FilePlusCorner,
      variant: 'primary',
      action: () => this.openRegisterTenant() // Direct callback
    },
  ];

  createTenantFields: FormField[] = [
    {
      key: 'tenantName',
      label: 'Tenant Name',
      type: 'text',
      required: true,
      minLength: 2,
      icon: Building,
      placeholder: 'e.g. Acme Corp'
    },
    {
      key: 'adminFullName',
      label: 'Admin Full Name',
      type: 'text',
      required: true,
      minLength: 2,
      icon: User,
      placeholder: 'John Doe'
    },
    {
      key: 'adminEmail',
      label: 'Admin Email',
      type: 'email',
      required: true,
      icon: Mail,
      pattern: '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'
    },
    {
      key: 'adminPhone',
      label: 'Phone Number',
      type: 'tel',
      icon: Phone,
      placeholder: '+1 (555) 000-0000'
    },
    {
      key: 'password',
      label: 'Password',
      type: 'password',
      required: true,
      minLength: 6,
      icon: Lock
    },
    {
      key: 'appKey',
      label: 'App Key',
      type: 'text',
      icon: Key,
      placeholder: 'Optional API Key'
    },
    {
      key: 'isPersonal',
      label: 'Account Type',
      type: 'checkbox',
      placeholder: 'Is this a personal account?'
    }
  ];

  pagination: PaginationConfig = { pageSize: 15, currentPage: 1, totalItems: 0 };

  constructor(
    private router: Router,
    public drawerService: DrawerService,
    private toastSvc: ToastService,
    private userManagementService: UserManagementService,
    private loaderSvc: LoaderService
  ) {

  }

  ngOnInit() {
    this.loadTenants();
  }

  loadTenants() {
    this.loaderSvc.show();
    const apiPage = this.pagination.currentPage > 0 ? this.pagination.currentPage - 1 : 0;
    this.userManagementService.getAllTenants(
      apiPage,
      this.pagination.pageSize,
      {},
      (response: any) => {
        this.tenants = response.data.content;
        this.pagination = {
          currentPage: this.pagination.currentPage,
          totalItems: response.data.totalElements,
          pageSize: response.data.size
        };
        this.loaderSvc.hide();
      },
      (error: any) => {
        this.loaderSvc.hide();
        this.toastSvc.show('Failed to load Items', 'error');
        console.error('Error fetching items:', error);
      }
    );
  }

  handleRegisterSubmit(formData: any) {
    this.loaderSvc.show();
    // Call your service
    // Assuming userManagementService has a createTenant method
    this.userManagementService.createTenant(formData,
      (response: any) => {
        this.loaderSvc.hide();
        this.toastSvc.show('Tenant created successfully', 'success');
        this.drawerService.close() // Close drawer
        this.loadTenants(); // Refresh table
      },
      (err: any) => {
        this.loaderSvc.hide();
        this.toastSvc.show(err.error?.message || 'Failed to create tenant', 'error');
      }
    )
  };


  openRegisterTenant(){
    this.drawerService.openTemplate(
      this.registerTemplate,
      "",
      'lg'
    )
  }

  onCancelDrawer() {
    this.drawerService.close();
  }

  onTableAction(event: TableAction) {
    const { type, row, key } = event;

    switch (type) {
      case 'view':
        console.log("View:", row.id);
        break;
      case 'edit':
        break;
      case 'delete':
        console.log("Delete:", row.id);
        break;
      case 'toggle':
        break;
    }
  }

  

  handleHeaderAction(event: HeaderAction) {
    if (event.key === 'create_route') {
    }
  }

  onPageChange(newPage: number) {
    this.pagination = { ...this.pagination, currentPage: newPage };
  }

  onLoadMore() {
  }

}
