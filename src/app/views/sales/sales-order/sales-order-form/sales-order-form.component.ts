import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ToastService } from '../../../../layouts/components/toast/toastService';
import { ContactModel, AddressType } from '../../../contacts/contacts.model';
import { ContactService } from '../../../contacts/contacts.service';
import { ItemService } from '../../../items/item.service';
import { ItemModel, ItemSearchFilter } from '../../../items/models/Item.model';
import { SalesOrderService } from '../sales-order.service';

@Component({
  selector: 'app-sales-order-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './sales-order-form.component.html',
  styleUrl: './sales-order-form.component.css'
})
export class SalesOrderFormComponent implements OnInit {

  orderForm: FormGroup;

  // Customer Data
  selectedCustomer: ContactModel | null = null;
  customerSearchInput: string = "";
  filteredCustomers: ContactModel[] = [];
  allCustomers: ContactModel[] = [];
  showCustomerResults: boolean = false;

  // Item Search Data
  itemSearchResults: ItemModel[] = [];
  itemSearchQuery: string = "";
  showItemResults: boolean = false;
  private searchSubject = new Subject<string>();

  // Static Options
  warehouseOptions = [
    { label: 'Main Warehouse (Chennai)', value: 1 },
    { label: 'Bangalore Distribution Center', value: 2 },
    { label: 'Mumbai West Hub', value: 3 }
  ];

  priceListOptions = [
    { label: 'Standard Retail — INR', value: 1 },
    { label: 'Wholesale Tier 1 — INR', value: 2 },
    { label: 'Export Pricing — USD', value: 3 }
  ];

  constructor(
    private salesOrderService: SalesOrderService,
    private contactService: ContactService,
    private itemService: ItemService,
    private toast: ToastService,
    private router: Router,
    private fb: FormBuilder
  ) {
    // Initialize Form
    this.orderForm = this.fb.group({
      id: [''],
      orderNumber: ['SO-2025-' + Math.floor(1000 + Math.random() * 9000)],
      orderDate: [new Date().toISOString().split('T')[0]],
      customerId: ['', Validators.required],
      paymentTerms: [''],
      warehouse: [1],
      priceList: [1],
      discount: [0],
      discountPercentage: [0, [Validators.min(0), Validators.max(100)]],
      taxPercentage: [18], // Default 18% GST
      status: ['Pending'],
      items: this.fb.array([], Validators.required),
      remarks: [''],
    });
  }


  ngOnInit(): void {
    this.loadContacts();

    // Setup Item Search Debounce
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(query => {
      this.executeItemSearch(query);
    });
  }


  get items(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }

  // Sum of (Price * Qty)
  get subtotal(): number {
    // Loop through all items and sum their individual totals (which now includes item discount)
    return this.items.controls.reduce((acc, control, index) => {
      return acc + this.getItemTotal(index);
    }, 0);
  }

  // (Subtotal * Discount%) / 100
  get discountAmount(): number {
    const percent = this.orderForm.get('discountPercentage')?.value || 0;
    return (this.subtotal * percent) / 100;
  }

  // (Subtotal - Global Order Discount) * Tax%
  get taxAmount(): number {
    const taxPercent = this.orderForm.get('taxPercentage')?.value || 0;
    const globalDiscount = this.orderForm.get('discount')?.value || 0; // Bottom section discount
    
    // Tax is usually calculated on (Subtotal - Global Discount)
    const taxableAmount = Math.max(0, this.subtotal - globalDiscount); 
    
    return (taxableAmount * taxPercent) / 100;
  }

  // Final Total
  get grandTotal(): number {
    const globalDiscount = this.orderForm.get('discount')?.value || 0;
    return (this.subtotal - globalDiscount) + this.taxAmount;
  }

  getItemTotal(index: number): number {
    const itemGroup = this.items.at(index) as FormGroup;
    const price = itemGroup.get('price')?.value || 0;
    const quantity = itemGroup.get('quantity')?.value || 0;
    const itemDiscount = itemGroup.get('discount')?.value || 0; // Get Item Discount

    const total = (price * quantity) - itemDiscount;
    
    // Ensure total doesn't go below 0
    return total > 0 ? total : 0;
  }

  // --- Actions ---

  onItemSearchInput(event: any) {
    const query = event.target.value;
    this.itemSearchQuery = query;
    if (query.length > 0) {
      this.searchSubject.next(query);
    } else {
      this.itemSearchResults = [];
      this.showItemResults = false;
    }
  }

  executeItemSearch(query: string) {
    const filter = new ItemSearchFilter();
    filter.searchQuery = query;
    filter.itemType = 'PRODUCT';
    filter.active = true;

    this.itemService.searchItems(filter,
      (response: any) => {
        this.itemSearchResults = response.data;
        this.showItemResults = this.itemSearchResults.length > 0;
      },
      (error: any) => {
        this.itemSearchResults = [];
      });
  }

  selectItemFromSearch(item: ItemModel) {
    const itemGroup = this.fb.group({
      itemId: [item.id],
      name: [item.name],
      image: [item.imageUrl || 'assets/placeholder.png'],
      discount: [0],
      price: [item.sellingPrice || 0, [Validators.required, Validators.min(0)]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      lineTotal: []
    });

    this.items.push(itemGroup);
    this.itemSearchQuery = "";
    this.itemSearchResults = [];
    this.showItemResults = false;
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

  // --- Customer Logic ---

  loadContacts() {
    this.contactService.getContacts(0, 50, {},
      (res: any) => {
        this.allCustomers = res.data.content;
      },
      (err: any) => console.error(err)
    );
  }

  onCustomerSearchChange() {
    const text = this.customerSearchInput.toLowerCase().trim();
    if (!text) {
      this.showCustomerResults = false;
      return;
    }
    this.filteredCustomers = this.allCustomers.filter(c =>
      (c.name && c.name.toLowerCase().includes(text)) ||
      (c.phone && c.phone.includes(text))
    );
    this.showCustomerResults = true;
  }

  selectCustomer(customer: ContactModel) {
    this.selectedCustomer = customer;
    this.orderForm.patchValue({ customerId: customer.id });
    this.customerSearchInput = "";
    this.showCustomerResults = false;
  }

  clearCustomer() {
    this.selectedCustomer = null;
    this.orderForm.patchValue({ customerId: '' });
  }

  getInitials(name: string): string {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  }

  getFormattedAddress(customer: ContactModel): string {
    if (!customer?.addresses?.length) return 'No address available';
    const addr = customer.addresses.find(a => a.type === AddressType.BILLING) || customer.addresses[0];
    return [addr.addressLine1, addr.city, addr.state, addr.pinCode].filter(Boolean).join(', ');
  }

  saveOrder() {
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      this.toast.show('Please complete all required fields', 'warning');
      return;
    }

    const formValue = this.orderForm.getRawValue();
    const globalTaxRate = formValue.taxPercentage || 0; // e.g., 18

    // 1. Map Items to specific JSON format
    const mappedItems = formValue.items.map((item: any) => {
      const qty = item.quantity || 0;
      const price = item.price || 0;
      const itemDiscount = item.discount || 0; // Item level discount amount
      const taxableAmount = (price * qty) - itemDiscount;
      const itemTaxAmount = (taxableAmount * globalTaxRate) / 100;
      const lineTotal = taxableAmount + itemTaxAmount;

      return {
        itemId: item.itemId,
        quantity: qty,
        unitPrice: price,      // Renamed from 'price' to 'unitPrice'
        discount: itemDiscount, // Item specific discount
        tax: Number(itemTaxAmount.toFixed(2)),
        lineTotal: Number(lineTotal.toFixed(2))
      };
    });
    const sumLineTotals = mappedItems.reduce((sum: number, item: any) => sum + item.lineTotal, 0);
    const totalTax = mappedItems.reduce((sum: number, item: any) => sum + item.tax, 0);
    const orderLevelDiscount = formValue.discount || 0;
    const grandTotal = sumLineTotals - orderLevelDiscount;

    // 3. Construct Final JSON Payload
    const payload = {
      orderNumber: formValue.orderNumber,
      orderDate: formValue.orderDate,
      customerId: formValue.customerId,
      paymentTerms: formValue.paymentTerms || 'Due on Receipt',
      remarks: formValue.remarks,
      discount: orderLevelDiscount, // Order level discount
      tax: Number(totalTax.toFixed(2)), // Total tax amount
      grandTotal: Number(grandTotal.toFixed(2)),
      active: true,
      items: mappedItems
    };

    this.salesOrderService.createSalesOrder(
      payload,
      (response:any)=>{
        console.log();
        this.router.navigate(['/sales'])
        this.toast.show("Successfully creates SO", "success")
      },
      (err:any)=>{
        console.log("error while saving SO", err)
      }
    )
    console.log('Final Payload:', JSON.stringify(payload, null, 2));
  }
}