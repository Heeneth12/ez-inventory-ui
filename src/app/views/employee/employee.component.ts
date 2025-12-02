import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { PaginationConfig, TableAction, TableColumn } from '../../layouts/components/standard-table/standard-table.model';
import { EmployeeService } from './employee.service';
import { Router } from '@angular/router';
import { DrawerService } from '../../layouts/components/drawer/drawerService';
import { ToastService } from '../../layouts/components/toast/toastService';
import { EmployeeModel } from './employee.model';
import { StandardTableComponent } from "../../layouts/components/standard-table/standard-table.component";
import { TabItem, } from '../../layouts/UI/tab-card/tab-card.component';
import { CircleUser, LucideAngularModule } from 'lucide-angular';
@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [CommonModule, StandardTableComponent, LucideAngularModule],
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent implements OnInit {

  emplayeeList: EmployeeModel[] = [];
  pagination: PaginationConfig = { pageSize: 20, currentPage: 1, totalItems: 0 };

  columns: TableColumn[] = [
    { key: 'id', label: 'ID', width: '60px', align: 'center', type: 'text' },
    { key: 'firstName', label: 'Employee Profile', width: '280px', type: 'profile' },
    { key: 'employeeCode', label: 'Employee Code', type: 'text' },
    { key: 'role', label: 'Job Title', type: 'badge' },
    { key: 'contactNumber', label: 'Contact Number', type: 'text' },
    { key: 'officialEmail', label: 'Email', type: 'text' },
    { key: 'active', label: 'Active', align: 'center', width: '80px', type: 'toggle' },
    { key: 'actions', label: 'Actions', align: 'center', width: '120px', type: 'action', sortable: false }
  ];


  // --- Configuration ---
  navigationTabs: TabItem[] = [
    { id: 'employee', label: 'All employees', icon: CircleUser },
    { id: 'create', label: 'Create employee', icon: CircleUser },
  ];

  // --- State ---
  activeTab = signal<string>('all');
  searchQuery = '';
  isLoading = signal<boolean>(false);

  constructor(
    private employeeService: EmployeeService,
    public drawerService: DrawerService,
    private toast: ToastService,
    private router: Router
  ) { }


  ngOnInit(): void {
    this.getAllEmployees();
  }

  getAllEmployees() {
    this.employeeService.getAllEmployees(0, 10, {},
      (response: any) => {
        this.emplayeeList = response.data.content;
        console.log('Employees fetched successfully:', response);
      },
      (error: any) => {
        this.toast.show('Error fetching employees', 'error');
        console.error('Error fetching employees:', error);
      });
  }

  toggleActiveStatus(employee: EmployeeModel) {
    const updatedStatus = employee.active;
    this.employeeService.toggleEmployeeStatus(employee.id, updatedStatus,
      (response: any) => {
        employee.active = updatedStatus;
        this.toast.show(`Employee ${updatedStatus ? 'enabled' : 'disabled'} successfully`, 'success');
      },
      (error: any) => {
        this.toast.show('Failed to update employee status', 'error');
        console.error('Error updating employee status:', error);
      }
    );
  }

  updateEmployee(employeeId: string | number) {
    this.router.navigate(['/employee/edit', employeeId]);
  }



  onPageChange($event: number) {
    console.log('Page changed to:', $event);
  }
  onLoadMore() {
    console.log('Load more triggered');
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
        this.updateEmployee(row.id);
        break;

      case 'delete':
        console.log("Delete action for item:", row.id);
        break;

      case 'toggle':
        console.log("Toggle active status for item:", row.id, "New status:");
        this.toggleActiveStatus(row as EmployeeModel);
        break;

      default:
        console.warn("Unhandled table action:", event);
    }
  }


  // --- Actions ---
  onTabChange(newTabId: string) {
    // Simulate API network delay for better UX feel
    this.isLoading.set(true);
    setTimeout(() => {
      this.activeTab.set(newTabId);
      this.isLoading.set(false);
    }, 400); // 400ms fake load
  }
}
