import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DrawerService } from '../../layouts/components/drawer/drawerService';
import { ToastService } from '../../layouts/components/toast/toastService';
import { UserManagementService } from './userManagement.service';
import { StandardTableComponent } from "../../layouts/components/standard-table/standard-table.component";
import { PaginationConfig, TableAction, TableColumn } from '../../layouts/components/standard-table/standard-table.model';
import { RoleModel, ApplicationModel } from './models/application.model';
import { UserModel } from './models/user.model';


@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, StandardTableComponent],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  @ViewChild('userFormTemplate') formTemplate!: TemplateRef<any>;

  // Data Sources
  users: UserModel[] = [];
  roles: RoleModel[] = [];
  applications: ApplicationModel[] = [];

  columns: TableColumn[] = [
    { key: 'fullName', label: 'User', width: '130px', type: 'profile' },
    { key: 'email', label: 'Email', width: '100px', type: 'text' },
    { key: 'phone', label: 'Phone', width: '220px', type: 'text' },
    { key: 'roles', label: 'Role', width: '100px', type: 'badge' },
    { key: 'isActive', label: 'Active', width: '130px', type: 'toggle', align: 'center' },
    { key: 'actions', label: 'Actions', width: '120px', type: 'action', align: 'center', sortable: false }
  ];

  pagination: PaginationConfig = { pageSize: 20, currentPage: 1, totalItems: 0 };

  constructor(
    public drawerService: DrawerService,
    private toast: ToastService,
    private userManagementService: UserManagementService
  ) {

  }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userManagementService.getAllUsers(
      (res: any) => {
        this.users = res.data;
      },
      (err: any) => {
        this.toast.show('Failed to load users', 'error');
      }
    );
  }

  onTableAction(event: TableAction) {
    console.log("Table action event:", event);
    const { type, row, key } = event;

    switch (type) {

      case 'view':
        console.log("View action for item:", row.id);
        break;

      case 'edit':
        console.log("Edit action for item:", row.id);
        break;

      case 'delete':
        console.log("Delete action for item:", row.id);
        break;

      case 'toggle': // enable/disable item
        console.log("Toggle active status for item:", row.id, "New status:");
        break;

      default:
        console.warn("Unhandled table action:", event);
    }
  }

  onPageChange($event: number) {
    console.log("Page change event:", $event);
  }
  onLoadMore() {
    console.log("Load more event");
  }
}