import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastService } from '../../../../layouts/components/toast/toastService';
import { debounceTime, distinctUntilChanged, Subject, switchMap, of, identity } from 'rxjs';
import { AddressType, ContactModel } from '../../../contacts/contacts.model';
import { SalesOrderService } from '../../sales-order/sales-order.service';
import { ItemModel, ItemSearchFilter } from '../../../items/models/Item.model';
import { ContactService } from '../../../contacts/contacts.service';
import { ItemService } from '../../../items/item.service';
import { SalesOrderModal } from '../../sales-order/sales-order.modal';

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.css']
})
export class InvoiceFormComponent implements OnInit {


  invoiceForm: FormGroup;
  isEditMode = false;
  orderId: number | null = null;
  isLoading = false;

  // Customer Search
  selectedCustomer: ContactModel | null = null;
  customerSearchInput = "";
  filteredCustomers: ContactModel[] = [];
  allCustomers: ContactModel[] = [];
  showCustomerResults = false;

  // Pending Orders (PO/SO)
  pendingOrders: SalesOrderModal[] = [];
  isLoadingOrders = false;

  // Item Search
  itemSearchResults: ItemModel[] = [];
  itemSearchQuery = "";
  showItemResults = false;
  private searchSubject = new Subject<string>();

  // Options
  warehouseOptions = [
    { label: 'Main Warehouse (Chennai)', value: 1 },
    { label: 'Bangalore DC', value: 2 },
    { label: 'Mumbai Hub', value: 3 }
  ];

  constructor(
    private fb: FormBuilder,
    private salesOrderService: SalesOrderService,
    private contactService: ContactService,
    private itemService: ItemService,
    private toast: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.invoiceForm = this.fb.group({
      id: [null],
      salesOrderId: [null],
      invoiceDate: [new Date().toISOString().split('T')[0], Validators.required],
      customerId: [1, Validators.required],
      warehouseId: [1, Validators.required],
      remarks: [''],
      items: this.fb.array([], Validators.required),
      discountAmount: [0], // Global Discount Amount
      taxPercentage: [0] // Global Tax % to apply to rows
    });
  }

  ngOnInit(): void {
    this.loadContacts();
    this.setupItemSearch();
    this.checkEditMode();
  }

  private checkEditMode() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');

      if (id) {
        this.isEditMode = true;
        this.orderId = +id;
        this.loadOrderDetails(this.orderId);
      }
    });
  }

  private loadOrderDetails(id: number) {
    this.isLoading = true;
    this.salesOrderService.getSalesOrderById(id,
      (response: any) => {
        const order = response.data;
        // 1. Patch Header
        this.invoiceForm.patchValue({
          id: order.id,
          customerId: order.customerId,
          warehouseId: order.warehouseId,
          orderDate: order.orderDate,
          remarks: order.remarks,
          discount: order.totalDiscount,
          // Calculate tax % based on total for display, or default to 0
          taxPercentage: order.subTotal > 0 ? ((order.totalTax / order.subTotal) * 100) : 0
        });
        // 2. Set Customer Display
        const customer = this.allCustomers.find(c => c.id === order.customerId);
        if (customer) this.selectCustomer(customer);
        else this.selectedCustomer = { id: order.customerId, name: order.customerName } as ContactModel; // Fallback

        // 3. Patch Items
        const itemArray = this.invoiceForm.get('items') as FormArray;
        itemArray.clear();

        order.items.forEach((item: any) => {
          itemArray.push(this.createItemControl({
            id: item.itemId,
            name: item.itemName,
            sellingPrice: item.unitPrice,
            // Map existing line data
            orderedQty: item.orderedQty,
            discount: item.discount
          }));
        });

        this.isLoading = false;
      },
      (err: any) => {
        this.toast.show('Failed to load order details', 'error');
        this.isLoading = false;
      }
    );
  }

  private setupItemSearch() {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || query.trim() === '') return of([]);
        const filter = new ItemSearchFilter();
        filter.searchQuery = query;
        filter.active = true;

        return new Promise(resolve => {
          this.itemService.searchItems(filter,
            (res: any) => resolve(res.data || res.data.content || []),
            () => resolve([])
          );
        });
      })
    ).subscribe((results: any) => {
      this.itemSearchResults = results;
      this.showItemResults = results.length > 0;
    });
  }


  // NEW: Autofill Logic
  applySalesOrder(order: any) {
    if (!confirm(`Autofill invoice from Order #${order.id}? This will replace current items.`)) return;

    // 1. Patch Header Details
    this.invoiceForm.patchValue({
      salesOrderId: order.id,
      warehouseId: order.warehouseId,
      remarks: order.remarks,
      discountAmount: order.totalDiscount || 0,
      // Calculate tax % approximately
      taxPercentage: order.subTotal > 0 ? ((order.totalTax / order.subTotal) * 100) : 0
    });

    // 2. Patch Items
    const itemArray = this.items;
    itemArray.clear(); // Clear existing rows

    if (order.items) {
      order.items.forEach((item: any) => {
        // Map SO Item ItemModel for form
        itemArray.push(this.createItemControl({
          id: item.itemId, // Note: SO item usually has itemId inside
          name: item.itemName || item.name,
          imageUrl: item.imageUrl,
          sellingPrice: item.unitPrice, // Map unitPrice -> sellingPrice
          quantity: item.orderedQty,   // Map orderedQty -> quantity
          discount: item.discount
        }));
      });
    }

    this.toast.show('Invoice autofilled from Order #' + order.id, 'success');
  }


  // NEW: Fetch Orders API Call
  fetchPendingOrders(customerId: number) {
    this.isLoadingOrders = true;
    this.pendingOrders = [];
    const filter = { customerId: customerId, status: 'CREATED' }; // Or 'PENDING' based on your logic

    this.salesOrderService.searchSalesOrders(filter,
      (res: any) => {
        this.pendingOrders = res.data.content || res.data || [];
        this.isLoadingOrders = false;

        if (this.pendingOrders.length > 0) {
          this.toast.show(`Found ${this.pendingOrders.length} pending orders`, 'success');
        }
        if (this.pendingOrders.length === 1) {
          this.applySalesOrder(this.pendingOrders[0]);
        }
      },
      (err: any) => {
        console.error(err);
        this.isLoadingOrders = false;
      }
    );
  }


  get items(): FormArray {
    return this.invoiceForm.get('items') as FormArray;
  }

  get subtotal(): number {
    return this.items.controls.reduce((sum, ctrl) => {
      const qty = ctrl.get('orderedQty')?.value || 0;
      const price = ctrl.get('unitPrice')?.value || 0;
      return sum + (qty * price);
    }, 0);
  }

  get totalItemDiscounts(): number {
    // Sum of individual item discounts
    return this.items.controls.reduce((sum, ctrl) => {
      return sum + (ctrl.get('discount')?.value || 0);
    }, 0);
  }

  get globalDiscount(): number {
    return this.invoiceForm.get('discount')?.value || 0;
  }

  get calculatedTax(): number {
    const taxPercent = this.invoiceForm.get('taxPercentage')?.value || 0;
    // Taxable = Subtotal - Total Discounts
    const taxable = Math.max(0, this.subtotal - this.totalItemDiscounts - this.globalDiscount);
    return (taxable * taxPercent) / 100;
  }

  get grandTotal(): number {
    return (this.subtotal - this.totalItemDiscounts - this.globalDiscount) + this.calculatedTax;
  }

  getRowTotal(index: number): number {
    const ctrl = this.items.at(index);
    const qty = ctrl.get('orderedQty')?.value || 0;
    const price = ctrl.get('unitPrice')?.value || 0;
    const disc = ctrl.get('discount')?.value || 0;
    return Math.max(0, (qty * price) - disc);
  }

  //Item Management ---
  onItemSearchInput(event: any) {
    const query = event.target.value;
    this.itemSearchQuery = query;
    this.searchSubject.next(query);
  }

  selectItemFromSearch(item: ItemModel) {
    this.items.push(this.createItemControl(item));
    this.itemSearchQuery = "";
    this.showItemResults = false;
  }

  private createItemControl(data: any): FormGroup {
    return this.fb.group({
      soItemId: [null],
      itemId: [data.id],
      name: [data.name],
      imageUrl: [data.imageUrl || 'assets/placeholder.png'],
      unitPrice: [data.sellingPrice || 0, [Validators.required, Validators.min(0)]],
      orderedQty: [data.quantity || data.orderedQty || 1, Validators.required],
      quantity: [data.orderedQty || 1, [Validators.required, Validators.min(1)]],
      discount: [data.discount || 0, Validators.min(0)],
      batchNumber: [data.batchNumber || ''],
    });
  }

  removeItem(index: number) {
    this.items.removeAt(index);
  }

  adjustQuantity(index: number, delta: number) {
    const ctrl = this.items.at(index).get('orderedQty');
    const current = ctrl?.value || 0;
    if (current + delta > 0) {
      ctrl?.setValue(current + delta);
    }
  }

  // --- Customer Management ---

  loadContacts() {
    this.contactService.getContacts(0, 100, {}, (res: any) => {
      this.allCustomers = res.data.content;
      this.filteredCustomers = this.allCustomers;
    }, (err: any) => console.error(err));
  }

  filterCustomers() {
    const term = this.customerSearchInput.toLowerCase();
    this.filteredCustomers = this.allCustomers.filter(c =>
      c.name.toLowerCase().includes(term) || c.phone?.includes(term)
    );
    this.showCustomerResults = true;
  }

  selectCustomer(cust: ContactModel) {
    this.selectedCustomer = cust;
    this.invoiceForm.patchValue({ customerId: cust.id });
    this.showCustomerResults = false;
    this.customerSearchInput = "";

    // FETCH PENDING ORDERS
    this.fetchPendingOrders(cust.id);

  }

  clearCustomer() {
    this.selectedCustomer = null;
    this.invoiceForm.patchValue({ customerId: null });
    this.pendingOrders = [];
  }

  getFormattedAddress(): string {
    if (!this.selectedCustomer?.addresses?.length) return 'No address on file';
    const addr = this.selectedCustomer.addresses.find(a => a.type === AddressType.BILLING)
      || this.selectedCustomer.addresses[0];
    return `${addr.city}, ${addr.state}`;
  }


  saveOrder() {
    if (this.invoiceForm.invalid) {
      this.invoiceForm.markAllAsTouched();
      this.toast.show('Please fill required fields', 'warning');
      return;
    }

    const formVal = this.invoiceForm.getRawValue();
    const taxPerItem = this.calculatedTax / formVal.items.length; // Simple distribution for DTO

    // Map to Backend DTO

  }

}

