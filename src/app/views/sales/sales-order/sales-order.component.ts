import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { StandardTableComponent } from "../../../layouts/components/standard-table/standard-table.component";
import { EmployeeModel } from '../../employee/employee.model';
import { SalesOrderModal } from './sales-order.modal';
import { Router } from '@angular/router';
import { DrawerService } from '../../../layouts/components/drawer/drawerService';
import { PaginationConfig, TableAction, TableColumn } from '../../../layouts/components/standard-table/standard-table.model';
import { ToastService } from '../../../layouts/components/toast/toastService';
import { EmployeeService } from '../../employee/employee.service';
import { SalesOrderService } from './sales-order.service';

interface Product {
  id: number;
  name: string;
  stockText: string;
  stockColor: 'text-gray-400' | 'text-orange-500' | 'text-red-500'; // Specific colors from image
  price: number;
  image: string;
  units: string[];
}

@Component({
  selector: 'app-sales-order-ui',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, StandardTableComponent],
  templateUrl: './sales-order.component.html',
  styleUrls: ['./sales-order.component.css']
})
export class SalesOrderComponent implements OnInit {

  orderForm: FormGroup;

  salesOrders: SalesOrderModal[] = [];
  pagination: PaginationConfig = { pageSize: 20, currentPage: 1, totalItems: 0 };

  columns: TableColumn[] = [
    { key: 'orderNumber', label: 'Order No', width: '130px', type: 'text' },
    {key :'customerId', label: 'Customer ID', width: '100px', type: 'text' },
    { key: 'customerName', label: 'Customer', width: '220px', type: 'text' },
    { key: 'orderDate', label: 'Order Date', width: '130px', type: 'text', align: 'center' },
    { key: 'grandTotal', label: 'Amount', width: '120px', type: 'currency', align: 'right' },
    { key: 'status', label: 'Status', width: '140px', type: 'badge' },
    { key: 'active', label: 'Active', width: '80px', type: 'toggle', align: 'center' },
    { key: 'actions', label: 'Actions', width: '120px', type: 'action', align: 'center', sortable: false }
  ];


  constructor(
    private salesOrderService: SalesOrderService,
    public drawerService: DrawerService,
    private toast: ToastService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.orderForm = this.fb.group({
      customer: ['Walk-in customer'],
      warehouse: ['Main stock'],
      priceList: ['USD - Retail price'],
      items: this.fb.array([]),
      notes: [''],
      status: ['Completed'], // Default selected
      discount: [0]
    });
  }

  // Mock Product Database
  allProducts: Product[] = [
    { id: 1, name: 'Maselko Margarin 200 gram', stockText: 'In stock: 23 kg', stockColor: 'text-gray-400', price: 12.00, image: 'https://via.placeholder.com/40/e5e7eb/a1a1aa?text=M', units: ['Kg', 'G'] },
    { id: 2, name: 'Lactel Milk 1 litr light', stockText: 'In stock: 56 Pcs', stockColor: 'text-gray-400', price: 90.00, image: 'https://via.placeholder.com/40/e5e7eb/a1a1aa?text=L', units: ['Pcs', 'Box'] },
    { id: 3, name: 'Bounty chocolatte small', stockText: 'Low stock: 5 Pcs', stockColor: 'text-orange-500', price: 5.00, image: 'https://via.placeholder.com/40/e5e7eb/a1a1aa?text=B', units: ['Box', 'Pcs'] },
    { id: 4, name: 'Electrical blender for kitchen', stockText: 'Out of stock: 0 Pcs', stockColor: 'text-red-500', price: 100.00, image: 'https://via.placeholder.com/40/e5e7eb/a1a1aa?text=E', units: ['Pcs'] },
  ];


  ngOnInit(): void {
    this.getAllSalesOrders();
    // Pre-fill with data to match the image
    this.addProductRow(this.allProducts[0], 2, 'Kg');
    this.addProductRow(this.allProducts[1], 2, 'Pcs');
    this.addProductRow(this.allProducts[2], 100, 'Box');
    this.addProductRow(this.allProducts[3], 45, 'Pcs');
  }


  getAllSalesOrders() {
    this.salesOrderService.getAllSalesOrders(
      0, 10, {},
      (response: any) => {
        this.salesOrders = response.data.content;
      },
      (error: any) => {
        this.toast.show('Failed to fetch sales orders.', 'error');
      }
    )
  }

  get items(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }

  // Add a specific product to the list
  addProductRow(product: Product, defaultQty: number = 1, defaultUnit: string = 'Pcs') {
    const group = this.fb.group({
      id: [product.id],
      name: [product.name],
      image: [product.image],
      stockText: [product.stockText],
      stockColor: [product.stockColor],
      availableUnits: [product.units],

      // Editable Fields
      price: [product.price],
      quantity: [defaultQty],
      unit: [defaultUnit],
    });
    this.items.push(group);
  }

  removeItem(index: number) {
    this.items.removeAt(index);
  }

  // Calculations
  getItemTotal(index: number): number {
    const row = this.items.at(index).value;
    return (row.price || 0) * (row.quantity || 0);
  }

  get subtotal(): number {
    return this.items.controls.reduce((acc, _, i) => acc + this.getItemTotal(i), 0);
  }

  get total(): number {
    return this.subtotal - (this.orderForm.get('discount')?.value || 0);
  }

  // Helper to change status (visually updates the pills)
  setStatus(status: string) {
    this.orderForm.patchValue({ status });
  }

  onPageChange($event: number) {
    console.log('Page changed to:', $event);
  }
  onLoadMore() {
    console.log('Load more triggered');
  }
  onTableAction($event: TableAction) {
    console.log('Table action:', $event);
  }
}