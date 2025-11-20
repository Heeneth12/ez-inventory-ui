import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { InventoryLayoutComponent } from "./layouts/components/inventory-layout/inventory-layout.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, InventoryLayoutComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  isBrandDropdownOpen = true;

  orders: PurchaseOrder[] = [
    { id: '1', createDate: '2022-10-28 04:51 PM', brand: 'Surreal Brewing', warehouse: 'ARTART Warehouse', orderNo: 'ARTART', status: 'Pending', expDelivery: '12-05-2022' },
    { id: '2', createDate: '2022-10-28 04:51 PM', brand: 'Alvarado Street Bakery', warehouse: 'TOP Warehouse', orderNo: 'ARTART', status: 'Rejected', expDelivery: '11-01-2022' },
    { id: '3', createDate: '2022-10-28 04:51 PM', brand: 'Alvarado Street Bakery', warehouse: 'TOP Warehouse', orderNo: 'ARTART', status: 'Canceled', expDelivery: '11-19-2022' },
    { id: '4', createDate: '2022-10-28 04:51 PM', brand: 'Alvarado Street Bakery', warehouse: 'TOP Warehouse', orderNo: 'PO-22-000055', status: 'Waiting for Approval', expDelivery: '11-16-2022' },
    { id: '5', createDate: '2022-10-28 04:51 PM', brand: 'Alvarado Street Bakery', warehouse: 'TOP Warehouse', orderNo: 'PO-22-000054', status: 'Received', expDelivery: '11-14-2022' },
    { id: '6', createDate: '2022-10-28 04:51 PM', brand: 'Alvarado Street Bakery', warehouse: 'TOP Warehouse', orderNo: 'PO-22-000053', status: 'Received', expDelivery: '11-04-2022' },
    { id: '7', createDate: '2022-10-28 04:51 PM', brand: 'Alvarado Street Bakery', warehouse: 'TOP Warehouse', orderNo: 'PO-22-000052', status: 'Received', expDelivery: '11-02-2022' },
  ];

  brands = [
    { name: 'Alvarado Street Bakery', selected: true },
    { name: 'Surreal Brewing', selected: true },
    { name: 'Cherrich', selected: false },
    { name: 'Keto Seeds', selected: false },
    { name: 'Mi Rancho', selected: false },
  ];

  // Helper for Status Colors
  getStatusClass(status: string): string {
    switch (status) {
      case 'Pending': return 'bg-blue-100 text-blue-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Canceled': return 'bg-gray-100 text-gray-600';
      case 'Waiting for Approval': return 'bg-cyan-100 text-cyan-800'; // Using cyan for that light blue look
      case 'Received': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  toggleBrandDropdown() {
    this.isBrandDropdownOpen = !this.isBrandDropdownOpen;
  }

}


interface PurchaseOrder {
  id: string;
  createDate: string;
  brand: string;
  warehouse: string;
  orderNo: string;
  status: 'Pending' | 'Rejected' | 'Canceled' | 'Waiting for Approval' | 'Received';
  expDelivery: string;
}