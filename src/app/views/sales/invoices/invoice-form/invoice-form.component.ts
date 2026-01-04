import { CommonModule } from '@angular/common';
import { Component, computed, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastService } from '../../../../layouts/components/toast/toastService';
import { debounceTime, distinctUntilChanged, Subject, switchMap, of } from 'rxjs';
import { AddressType, ContactModel } from '../../../contacts/contacts.model';
import { SalesOrderService } from '../../sales-order/sales-order.service';
import { ItemModel, ItemSearchFilter } from '../../../items/models/Item.model';
import { ContactService } from '../../../contacts/contacts.service';
import { ItemService } from '../../../items/item.service';
import { SalesOrderModal } from '../../sales-order/sales-order.modal';
import { InvoiceService } from '../invoice.service';
import { LoaderService } from '../../../../layouts/components/loader/loaderService';
import { BoxIcon, CalculatorIcon, Check, ChevronRight, ChevronsLeftRight, CreditCard, FileText, HistoryIcon, LucideAngularModule, QrCode, ReceiptIndianRupee, SaveIcon, Search, SettingsIcon, ShoppingBag, Truck, TruckIcon, User, XIcon } from "lucide-angular";
import { InvoiceModal, InvoiceItemModal, InvoiceRequest, DeliveryOption } from '../invoice.modal';
import { InvoiceHeaderComponent } from "../../../../layouts/components/invoice-header/invoice-header.component";

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, LucideAngularModule, InvoiceHeaderComponent],
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.css']
})
export class InvoiceFormComponent implements OnInit {

  //icons
  readonly TruckIcon = Truck;
  readonly ReceiptIndianRupeeIcon = ReceiptIndianRupee;
  readonly checkIcon = Check;
  readonly creditCardIcon =CreditCard;
  readonly chevronRightIcon =ChevronRight;
  readonly truckIcon =TruckIcon;
  readonly saveIcon = SaveIcon;
  readonly fileTextIcon = FileText;
  readonly boxIcon = BoxIcon;
  readonly userIcon =User;
  readonly calendarIcon =CalculatorIcon;
  readonly SearchIcon = Search;
  readonly BarCode = QrCode;
  readonly ShoppingBag = ShoppingBag;
  readonly SettingsIcon = SettingsIcon;
  readonly xIconIcon = XIcon;
  readonly HistoryIcon = HistoryIcon;
  readonly ChevronRightIcon = ChevronsLeftRight;

  invoiceForm: FormGroup;
  isEditMode = false;
  orderId: number | null = null;
  isLoading = false;

  // Customer Search
  selectedCustomer: ContactModel | null = null;

  // Pending Orders
  pendingOrders: SalesOrderModal[] = [];
  isLoadingOrders = false;

  // Item Search
  itemSearchResults: ItemModel[] = [];
  itemSearchQuery = "";
  showItemResults = false;
  private searchSubject = new Subject<string>();

  //delivery config
  currentDeliveryType = signal<DeliveryOption>('IN_HOUSE_DELIVERY');
  deliveryTypes: DeliveryOption[] = ['IN_HOUSE_DELIVERY', 'THIRD_PARTY_COURIER', 'CUSTOMER_PICKUP'];
  enableScheduledDelivery = signal(true);
  scheduledDate = signal(getTomorrowString());
  isPickup = computed(() => this.currentDeliveryType() === 'CUSTOMER_PICKUP');

  //config
  isDeliveryScheduled = false;
  activeHistoryTab: 'invoices' | 'payments' = 'invoices';

  //gst config
  isGstEnabled = false;
  gstNumber: string = "";

  constructor(
    private fb: FormBuilder,
    private invoiceService: InvoiceService,
    private salesOrderService: SalesOrderService,
    private contactService: ContactService,
    private itemService: ItemService,
    private loaderSvc: LoaderService,
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
      totalDiscount: [0],
      totalTax: [0]
    });
  }

  ngOnInit(): void {
    this.setupItemSearch();
    this.checkEditMode();
  }

  private checkEditMode() {
    // 1. Check for Invoice ID (True Edit Mode)
    this.route.queryParamMap.subscribe(params => {
      const invoiceId = params.get('invoiceId');
      if (invoiceId) {
        this.isEditMode = true;
        this.orderId = +invoiceId;
        this.loadInvoiceForEdit(this.orderId);
      }
    });

    // 2. Check for Sales Order ID (Create Mode - Autofill)
    this.route.queryParamMap.subscribe(params => {
      const salesOrderId = params.get('salesOrderId');
      if (salesOrderId) {
        this.isEditMode = false;
        this.loadOrderDetails(+salesOrderId);
      }
    });
  }

  private loadOrderDetails(id: number) {
    this.loaderSvc.show();
    // Strictly typing response data
    this.salesOrderService.getSalesOrderById(id,
      (response: { data: SalesOrderModal }) => {
        const order = response.data;

        //Patch Header
        this.invoiceForm.patchValue({
          id: null, // New Invoice, so ID is null
          salesOrderId: order.id,
          customerId: order.customerId,
          warehouseId: order.warehouseId,
          orderDate: order.orderDate,
          remarks: order.remarks,
          totalDiscount: 0,
          totalTax: 0
        });

        //Set Customer
        this.setCustomerById(order.customerId, order.customerName);

        //Apply Items (Reuse logic)
        this.applySalesOrder(order);

        this.loaderSvc.hide();
      },
      (err: any) => {
        this.loaderSvc.hide();
        this.toast.show('Failed to load order details', 'error');
      }
    );
  }

  private loadInvoiceForEdit(id: number) {
    this.loaderSvc.show();
    // Strictly typing response data
    this.invoiceService.getInvoiceById(id,
      (res: { data: InvoiceModal }) => {
        const invoice = res.data;

        //Patch Header
        this.invoiceForm.patchValue({
          id: invoice.id,
          salesOrderId: invoice.salesOrderId,
          customerId: invoice.customerId,
          warehouseId: invoice.warehouseId,
          invoiceDate: invoice.invoiceDate,
          remarks: invoice.remarks,
          totalDiscount: invoice.totalDiscount,
          totalTax: invoice.totalTax
        });

        //Set Customer
        this.setCustomerById(invoice.customerId, "Loading...");

        //Patch Items
        const itemArray = this.items;
        itemArray.clear();

        if (invoice.items) {
          invoice.items.forEach((item: InvoiceItemModal) => {
            itemArray.push(this.createItemControl(item, 'INVOICE'));
          });
        }

        this.loaderSvc.hide();
      },
      (err: any) => {
        this.loaderSvc.hide();
        this.toast.show('Failed to load invoice', 'error');
      }
    );
  }

  private setCustomerById(customerId: number, fallbackName: string) {
    this.contactService.getContactById(customerId,
      (res: { data: ContactModel }) => {
        this.selectedCustomer = res.data;
      },
      (err: any) => {
        // Fallback if fetch fails
        this.selectedCustomer = { id: customerId, name: fallbackName } as ContactModel;
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
            (res: { data: { content: ItemModel[] } }) => resolve(res.data || []),
            () => resolve([])
          );
        });
      })
    ).subscribe((results: any) => {
      this.itemSearchResults = results;
      this.showItemResults = results.length > 0;
    });
  }

  selectItemFromSearch(item: ItemModel) {
    // When adding from Search, we must map ItemModel -> Form Structure
    // Source Type is 'PRODUCT'

    const itemsArray = this.items;
    
    // 1. Check if the item already exists in the FormArray
    const existingItemIndex = this.findItemIndexById(item.id);

    if (existingItemIndex > -1) {
      // 2. Item exists: Increase the count
      this.adjustQuantity(existingItemIndex, 1);
      this.toast.show(`${item.name} quantity updated`, 'success');
    } else {
      // 3. Item does not exist: Add new row
      // Source Type is 'PRODUCT' for items coming from search
      itemsArray.push(this.createItemControl(item, 'PRODUCT'));
    }
    
    this.itemSearchQuery = "";
    this.showItemResults = false;
  }

  private findItemIndexById(itemId: number): number {
    return this.items.controls.findIndex(ctrl => ctrl.get('itemId')?.value === itemId);
  }

  // CORE METHOD: Handles mapping from 3 different sources
  private createItemControl(data: any, sourceType: 'INVOICE' | 'SO' | 'PRODUCT'): FormGroup {

    // Default Values
    let id = null;
    let soItemId = null;
    let itemId = null;
    let name = '';
    let unitPrice = 0;
    let quantity = 1;
    let discountAmount = 0;
    let taxAmount = 0;

    // Map based on source to ensure correct IDs
    if (sourceType === 'INVOICE') {
      // Data is InvoiceItemModal
      id = data.id;                // Existing Invoice Line ID
      soItemId = data.soItemId;
      itemId = data.itemId;
      name = data.itemName;
      unitPrice = data.unitPrice;
      quantity = data.quantity;
      discountAmount = data.discountAmount;
      taxAmount = data.taxAmount;
    }
    else if (sourceType === 'SO') {
      // Data is SalesOrderItem (from SalesOrderModal)
      id = null;                   // New Invoice Line
      soItemId = data.id;          // The ID of the SO Line
      itemId = data.itemId;
      name = data.itemName;
      unitPrice = data.unitPrice;
      quantity = data.orderedQty;  // Default to ordered amount
      discountAmount = data.discount; // SO usually calls it 'discount'
      taxAmount = data.tax;           // SO usually calls it 'tax'
    }
    else if (sourceType === 'PRODUCT') {
      // Data is ItemModel (Search Result)
      id = null;                   // New Invoice Line
      soItemId = null;             // Direct item, no SO link
      itemId = data.id;            // Product Master ID
      name = data.name;
      unitPrice = data.sellingPrice;
      quantity = 1;
      discountAmount = 0;
      taxAmount = 0; // Backend can recalculate or default 0
    }

    return this.fb.group({
      id: [id], // Crucial: Null for new, Number for edit
      soItemId: [soItemId],
      itemId: [itemId, Validators.required],
      name: [name],
      imageUrl: ['https://ui-avatars.com/api/?name=' + name + '&background=eff6ff&color=3b82f6&bold=true&size=128'],
      unitPrice: [unitPrice || 0, [Validators.required, Validators.min(0)]],
      orderedQty: [quantity, [Validators.required, Validators.min(1)]],
      discountAmount: [discountAmount || 0, Validators.min(0)],
      taxAmount: [taxAmount || 0, Validators.min(0)],
      batchNumber: [data.batchNumber || '']
    });
  }


  applySalesOrder(order: SalesOrderModal) {
    if (this.items.length > 0 && !confirm(`Autofill invoice from Order #${order.id}? This will replace current items.`)) return;

    // 1. Calculate Extra Header Math
    let sumItemDiscounts = 0;
    let sumItemTaxes = 0;

    if (order.items) {
      order.items.forEach((item: any) => {
        sumItemDiscounts += (item.discount || 0);
        sumItemTaxes += (item.tax || 0);
      });
    }

    const extraDiscount = (order.totalDiscount || 0) - sumItemDiscounts;
    const extraTax = (order.totalTax || 0) - sumItemTaxes;

    // 2. Patch Header
    this.invoiceForm.patchValue({
      salesOrderId: order.id,
      warehouseId: order.warehouseId,
      remarks: order.remarks,
      customerId: order.customerId,
      totalDiscount: Math.max(0, extraDiscount),
      totalTax: Math.max(0, extraTax)
    });

    // 3. Patch Items
    const itemArray = this.items;
    itemArray.clear();

    if (order.items) {
      order.items.forEach((item: any) => {
        // Source is 'SO'
        itemArray.push(this.createItemControl(item, 'SO'));
      });
    }
  }

  // --- FORM HELPERS ---

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
    return this.items.controls.reduce((sum, ctrl) => sum + (ctrl.get('discountAmount')?.value || 0), 0);
  }

  get totalItemTaxes(): number {
    return this.items.controls.reduce((sum, ctrl) => sum + (ctrl.get('taxAmount')?.value || 0), 0);
  }

  get grandTotal(): number {
    const headerDisc = this.invoiceForm.get('totalDiscount')?.value || 0;
    const headerTax = this.invoiceForm.get('totalTax')?.value || 0;
    const itemNet = this.subtotal - this.totalItemDiscounts + this.totalItemTaxes;
    return Math.max(0, itemNet - headerDisc + headerTax);
  }

  getRowTotal(index: number): number {
    const ctrl = this.items.at(index);
    const qty = ctrl.get('orderedQty')?.value || 0;
    const price = ctrl.get('unitPrice')?.value || 0;
    const disc = ctrl.get('discountAmount')?.value || 0;
    const tax = ctrl.get('taxAmount')?.value || 0;
    return Math.max(0, (qty * price) - disc + tax);
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

  //Item Management ---
  onItemSearchInput(event: any) {
    const query = event.target.value;
    this.itemSearchQuery = query;
    this.searchSubject.next(query);
  }

  //SAVE LOGIC
  saveOrder() {
    // if (this.invoiceForm.invalid) {
    //   this.invoiceForm.markAllAsTouched();
    //   console.log('Form Invalid:', this.invoiceForm.value);
    //   this.toast.show('Please fill required fields', 'warning');
    //   return;
    // }

    const formVal = this.invoiceForm.getRawValue();

    // MAP FORM TO STRICT TYPED REQUEST
    const requestPayload: InvoiceRequest = {
      salesOrderId: formVal.salesOrderId || null,
      customerId: formVal.customerId,
      warehouseId: 1,
      invoiceDate: formVal.invoiceDate,
      remarks: formVal.remarks,
      totalDiscount: formVal.totalDiscount,
      totalTax: formVal.totalTax,
      scheduledDate: new Date().toISOString(),
      shippingAddress: "test address",
      deliveryType: this.currentDeliveryType(),

      items: formVal.items.map((item: any) => ({
        id: item.id,                  // NULL for New, ID for Edit
        soItemId: item.soItemId,       // NULL for Direct, ID for Linked
        itemId: item.itemId,           // Required
        quantity: item.orderedQty,
        unitPrice: item.unitPrice,
        discountAmount: item.discountAmount,
        taxAmount: item.taxAmount,
        batchNumber: null
      }))
    };

    console.log('Sending Payload:', requestPayload);
    this.isLoading = true;
    this.loaderSvc.show();

    if (this.isEditMode && this.orderId) {
      this.invoiceService.updateInvoice(this.orderId, requestPayload,
        (res: any) => {
          this.handleSuccess(res, 'Invoice updated successfully');
        },
        (err: any) => this.handleError(err)
      );
    } else {
      this.invoiceService.createInvoice(requestPayload,
        (res: any) => {
          this.handleSuccess(res, 'Invoice created successfully');
        },
        (err: any) => this.handleError(err)
      );
    }
  }

  private handleSuccess(res: any, msg: string) {
    this.loaderSvc.hide();
    this.toast.show(msg, 'success');
    // Navigate to view/edit page using the ID from response
    const id = res.data?.id || this.orderId;
    this.router.navigate(['/sales/invoices', id]);
  }

  private handleError(err: any) {
    this.loaderSvc.hide();
    this.isLoading = false;
    this.toast.show(err.error?.message || 'Operation failed', 'error');
  }

  //CUSTOMER UTILS
  getCustomerById(customerId:any){
    this.contactService.getContactById(
      customerId,
      (response:any) => {
        this.selectedCustomer = response.data;
      },
      (err:any) => {
        console.log(err);
      }
    )
  }

  onCustomerSelected(customer: ContactModel) {
    this.selectedCustomer = customer;
    this.invoiceForm.patchValue({ customerId: customer.id });
  }

  onCustomerCleared() {
    this.selectedCustomer = null;
    this.invoiceForm.patchValue({ customerId: null });
  }

  getFormattedAddress(): string {
    if (!this.selectedCustomer?.addresses?.length) return 'No address on file';
    const addr = this.selectedCustomer.addresses.find(a => a.type === AddressType.BILLING)
      || this.selectedCustomer.addresses[0];
    return `${addr.city}, ${addr.state}`;
  }

  onDeliveryChange(type: DeliveryOption) {
    this.currentDeliveryType.set(type);
  }

  toggleScheduledDelivery() {
    // Use .update() here to flip the value
    this.enableScheduledDelivery.update(value => !value);
  }

  fetchPendingOrders(customerId: number) {
    this.isLoadingOrders = true;
    this.pendingOrders = [];
    // Strict typing for filter if you have an interface
    const filter = { customerId: customerId, status: 'CREATED' };

    this.salesOrderService.searchSalesOrders(filter,
      (res: { data: { content: SalesOrderModal[] } }) => { // Assuming paginated response
        this.pendingOrders = res.data.content || [];
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
}

function getTomorrowString(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1); // Add 1 day
  // 'en-CA' locale consistently outputs YYYY-MM-DD
  return date.toLocaleDateString('en-CA'); 
}