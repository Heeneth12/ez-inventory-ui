import { Component, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DrawerService } from '../../layouts/components/drawer/drawerService';
import { ToastService } from '../../layouts/components/toast/toastService';
import { ModalService } from '../../layouts/components/modal/modalService';
import { StandardTableComponent } from '../../layouts/components/standard-table/standard-table.component';
import { LoadMode, TableRow, PaginationConfig, TableColumn, TableAction } from '../../layouts/components/standard-table/standard-table.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule,StandardTableComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  // 1. Dropdown Options
  brandOptions = [
    { label: 'All Brands', value: 'all' },
    { label: 'Alvarado Street Bakery', value: 'alvarado' },
    { label: 'Surreal Brewing', value: 'surreal' },
    { label: 'Keto Seeds', value: 'keto' },
    { label: 'Cherrich', value: 'cherrich' },
  ];

  warehouseOptions = [
    { label: 'All Warehouses', value: 'all' },
    { label: 'TOP Warehouse', value: 'top' },
    { label: 'ARTART Warehouse', value: 'artart' },
  ];

  // 2. Mock Data for the Table
  orders: PurchaseOrder[] = [
    { id: '1', date: '2022-10-28', brand: 'Surreal Brewing', warehouse: 'ARTART Warehouse', orderNo: 'PO-22-000056', status: 'Pending' },
    { id: '2', date: '2022-10-28', brand: 'Alvarado Street Bakery', warehouse: 'TOP Warehouse', orderNo: 'PO-22-000055', status: 'Waiting for Approval' },
    { id: '3', date: '2022-10-28', brand: 'Alvarado Street Bakery', warehouse: 'TOP Warehouse', orderNo: 'PO-22-000054', status: 'Received' },
    { id: '4', date: '2022-10-28', brand: 'Alvarado Street Bakery', warehouse: 'TOP Warehouse', orderNo: 'PO-22-000053', status: 'Received' },
    { id: '5', date: '2022-10-28', brand: 'Keto Seeds', warehouse: 'TOP Warehouse', orderNo: 'PO-22-000052', status: 'Rejected' },
    { id: '6', date: '2022-10-28', brand: 'Mi Rancho', warehouse: 'TOP Warehouse', orderNo: 'PO-22-000051', status: 'Canceled' },
  ];

    constructor(private drawer: DrawerService, private toast :ToastService , private modal : ModalService) {
    this.generateData(500); 
    this.setMode('pagination');
    }

  /**
   * 3. Helper to map Data Status -> Badge Variant
   * This allows the visual component to stay dumb and the parent to decide logic.
   */
  getStatusVariant(status: string): 'success' | 'error' | 'warning' | 'info' | 'pending' | 'neutral' {
    switch (status) {
      case 'Received': return 'success';
      case 'Rejected': return 'error';
      case 'Waiting for Approval': return 'info';
      case 'Pending': return 'pending';
      case 'Canceled': return 'neutral';
      default: return 'neutral';
    }
  }

  // 4. Event Handlers
  filterByBrand(selectedValue: any) {
    console.log('Filtering by brand:', selectedValue);
    // Here you would typically trigger an API call or filter the `orders` array
  }

  filterByWarehouse(selectedValue: any) {
    console.log('Filtering by warehouse:', selectedValue);
  }

  createOrder() {
    console.log('Open create order modal...');
  }


  @ViewChild('myForm') myForm!: TemplateRef<any>;


  openDrawer() {
    this.drawer.open(this.myForm, 'Edit Profile');
  }

  openTost(){
    this.toast.show("hello", "success" )
  }

  openModal(x :TemplateRef<any>){
    console.log("hello")
    this.modal.open(x)
  }


  currentMode: LoadMode = 'pagination';
  tableTitle = 'Employee Directory';
  isLoading = false;
  lastAction = '';

  allData: TableRow[] = [];
  displayedData: TableRow[] = [];
  pagination: PaginationConfig = { pageSize: 20, currentPage: 1, totalItems: 0 };

  // --- RICH COLUMN DEFINITIONS ---
  columns: TableColumn[] = [
    { key: 'id', label: 'ID', width: '60px', align: 'center', type: 'text' },
    { key: 'name', label: 'Employee Profile', width: '280px', type: 'profile' },
    { key: 'role', label: 'Job Title', type: 'badge' }, 
    { key: 'dept', label: 'Department', type: 'text' },
    { key: 'salary', label: 'Salary (Annual)', align: 'right', type: 'currency' },
    { key: 'website', label: 'Portfolio', type: 'link' },
    { key: 'isActive', label: 'Active', align: 'center', width: '80px', type: 'toggle' },
    { key: 'actions', label: 'Actions', align: 'center', width: '120px', type: 'action', sortable: false }
  ];

  setMode(mode: LoadMode) {
    this.currentMode = mode;
    this.pagination.currentPage = 1;
    
    if (mode === 'pagination') {
      this.tableTitle = 'Team Overview (Paged)';
      this.displayedData = [...this.allData]; 
    } else {
      this.tableTitle = 'Team Overview (Infinite)';
      this.displayedData = this.allData.slice(0, 30); 
    }
  }

  handleAction(event: TableAction) {
    console.log('Action Triggered:', event);
    if (event.type === 'toggle') {
      this.lastAction = `Toggled ${event.row['name']} to ${event.row[event.key!]}`;
    } else {
      this.lastAction = `${event.type.toUpperCase()} clicked for ${event.row['name']}`;
    }
    
    // Clear toast after 3s
    setTimeout(() => this.lastAction = '', 3000);
  }

  onPageChange(page: number) {
    this.pagination.currentPage = page;
  }

  onLoadMore() {
    if (this.isLoading) return;
    this.isLoading = true;

    setTimeout(() => {
      const currentLen = this.displayedData.length;
      const nextBatch = this.allData.slice(currentLen, currentLen + 20);
      
      if (nextBatch.length > 0) {
        this.displayedData = [...this.displayedData, ...nextBatch];
      } else {
        const moreData = this.generateMoreRows(20, this.allData.length + 1);
        this.allData = [...this.allData, ...moreData];
        this.displayedData = [...this.displayedData, ...moreData];
        this.pagination.totalItems = this.allData.length;
      }
      this.isLoading = false;
    }, 800);
  }

  generateData(count: number) {
    this.allData = this.generateMoreRows(count, 1);
    this.pagination.totalItems = this.allData.length;
  }

  generateMoreRows(count: number, startId: number): TableRow[] {
    const roles = ['Senior Engineer', 'Product Manager', 'UX Designer', 'Sales Lead', 'DevOps Engineer'];
    const depts = ['Engineering', 'Product', 'Design', 'Sales', 'Operations'];
    const domains = ['portfolio.com', 'github.io', 'dribbble.com', 'linkedin.com'];
    const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Jamie', 'Riley', 'Avery'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];

    return Array.from({ length: count }, (_, i) => {
      const fname = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lname = lastNames[Math.floor(Math.random() * lastNames.length)];
      return {
        id: startId + i,
        name: `${fname} ${lname}`,
        email: `${fname.toLowerCase()}.${lname.toLowerCase()}@company.com`,
        role: roles[Math.floor(Math.random() * roles.length)],
        dept: depts[Math.floor(Math.random() * depts.length)],
        salary: Math.floor(Math.random() * 80000) + 60000,
        website: domains[Math.floor(Math.random() * domains.length)],
        isActive: Math.random() > 0.2, // 80% active
        rating: (Math.random() * 5).toFixed(1)
      };
    });
  }
}


// Define the shape of our data
interface PurchaseOrder {
  id: string;
  date: string;
  brand: string;
  warehouse: string;
  orderNo: string;
  status: 'Pending' | 'Received' | 'Rejected' | 'Waiting for Approval' | 'Canceled';
}