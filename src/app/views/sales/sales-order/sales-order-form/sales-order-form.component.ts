import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ToastService } from '../../../../layouts/components/toast/toastService';
import { SalesOrderService } from '../sales-order.service';
import { ItemService } from '../../../items/item.service';
import { ItemModel, ItemSearchFilter } from '../../../items/models/Item.model';
import { SalesOrderModal } from '../sales-order.modal';
import { ContactService } from '../../../contacts/contacts.service';

@Component({
  selector: 'app-sales-order-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './sales-order-form.component.html',
  styleUrl: './sales-order-form.component.css'
})
export class SalesOrderFormComponent implements OnInit {

  orderForm: FormGroup;
  salesOrder: SalesOrderModal | null = null;

  // Search Logic
  itemSearchFilter: ItemSearchFilter = new ItemSearchFilter();
  itemSearchResults: ItemModel[] = [];
  private searchSubject = new Subject<string>();

  constructor(
    private salesOrderService: SalesOrderService,
    private customerService: ContactService,
    private itemService: ItemService,
    private toast: ToastService,
    private router: Router,
    private fb: FormBuilder
  ) {
    // Initialize Search Filter
    this.itemSearchFilter.searchQuery = '';
    this.itemSearchFilter.active = true;
    this.itemSearchFilter.itemType = 'PRODUCT';

    // Initialize Form
    this.orderForm = this.fb.group({
      id: [''],
      orderNumber: [''],
      orderDate: [new Date().toISOString().split('T')[0]], // Default to today
      customerId: ['', Validators.required],
      warehouse: ['Main stock'], // Added to match HTML
      priceList: ['USD - Retail price'], // Added to match HTML
      paymentTerms: [''],
      discount: [0],
      tax: [0],
      status: ['Pending'],
      items: this.fb.array([]),
      remarks: [''], // Maps to "Notes" in HTML
    });
  }

  ngOnInit(): void {
    // Setup search debounce
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(query => {
      this.itemSearchFilter.searchQuery = query;
      this.executeItemSearch();
    });
  }

  // --- Getters & Calculations ---

  get items(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }

  get subtotal(): number {
    return this.items.controls.reduce((acc, control) => {
      const price = control.get('price')?.value || 0;
      const qty = control.get('quantity')?.value || 0;
      return acc + (price * qty);
    }, 0);
  }

  get total(): number {
    const discount = this.orderForm.get('discount')?.value || 0;
    const tax = this.orderForm.get('tax')?.value || 0;
    // Calculation: Subtotal - Discount + Tax
    return Math.max(0, (this.subtotal - discount) + tax);
  }

  getItemTotal(index: number): number {
    const itemGroup = this.items.at(index) as FormGroup;
    const price = itemGroup.get('price')?.value || 0;
    const quantity = itemGroup.get('quantity')?.value || 0;
    return price * quantity;
  }

  // --- Actions ---

  onSearchInput(event: any) {
    this.searchSubject.next(event.target.value);
  }

  executeItemSearch() {
    this.itemService.searchItems(this.itemSearchFilter,
      (response: any) => {
        this.itemSearchResults = response.data;
        // Optional: If exact match, auto-add? 
      },
      (error: any) => {
        this.toast.show('Failed to fetch items.', 'error');
      });
  }

  // executeCustomerSearch() {
  //   this.customerService.searchContacts(this.customerSearchFilter,
  //     (response: any) => {
  //       this.customerSearchResults = response.data;
  //       // Optional: If exact match, auto-add? 
  //     },
  //     (error: any) => {
  //       this.toast.show('Failed to fetch customers.', 'error');
  //     });
  // }

  // Add a specific product to the list
  addProductRow(item: ItemModel) {
    // Check if item already exists to just increment quantity (Optional logic)
    // For now, we append new row as per request

    const group = this.fb.group({
      id: [item.id],
      name: [item.name],
      image: [item.imageUrl || 'assets/placeholder.png'], // Handle missing image
      // stockText: [item.stockText || 'In Stock'],
      // stockColor: [item.stockColor || 'text-green-600'],
      // availableUnits: [item.units || ['Pcs', 'Box']], // Ensure array

      // Editable Fields
      price: [item.sellingPrice || 0, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unit: ['Pcs']
    });

    this.items.push(group);

    // Clear search after adding
    this.itemSearchResults = [];
  }

  removeItem(index: number) {
    this.items.removeAt(index);
  }

  adjustQuantity(index: number, change: number) {
    const control = this.items.at(index).get('quantity');
    const currentVal = control?.value || 0;
    const newVal = currentVal + change;
    if (newVal > 0) {
      control?.setValue(newVal);
    }
  }
  // Add these variables to your Class
  showSearch = false;

  // Add this helper method to close search with a delay (so clicks on items register)
  hideSearchDelayed() {
    setTimeout(() => {
      this.showSearch = false;
    }, 200);
  }

  saveOrder() {
    if (this.orderForm.invalid) {
      this.toast.show('Please fill in all required fields', 'warning');
      return;
    }

    const formValue = this.orderForm.getRawValue();
    formValue.grandTotal = this.total;
    formValue.totalAmount = this.subtotal;

    console.log('Saving Order:', formValue);
  }
}