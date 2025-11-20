import { Component, TemplateRef, ViewChild } from '@angular/core';
import { CardComponent } from "../../layouts/UI/card/card.component";
import { ButtonComponent } from "../../layouts/UI/button/button.component";
import { DropdownComponent } from "../../layouts/UI/dropdown/dropdown.component";
import { TableComponent } from "../../layouts/UI/table/table.component";
import { StatusBadgeComponent } from "../../layouts/components/status-badge/status-badge.component";
import { CommonModule } from '@angular/common';
import { DrawerService } from '../../layouts/components/drawer/drawerService';
import { ToastService } from '../../layouts/components/toast/toastService';
import { ModalService } from '../../layouts/components/modal/modalService';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent, DropdownComponent, TableComponent, StatusBadgeComponent],
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

    constructor(private drawer: DrawerService, private toast :ToastService , private modal : ModalService) {}

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