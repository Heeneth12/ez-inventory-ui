import { CommonModule } from '@angular/common';
import { Component, computed, HostListener, Input, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastService } from '../../../../layouts/components/toast/toastService';
import { SalesOrderService } from '../../sales-order/sales-order.service';
import { SalesOrderModal } from '../../sales-order/sales-order.modal';
import { InvoiceService } from '../invoice.service';
import { LoaderService } from '../../../../layouts/components/loader/loaderService';
import { ArrowLeft, BoxIcon, CalculatorIcon, Check, ChevronRight, ChevronsLeftRight, CreditCard, EyeIcon, FileText, HistoryIcon, LucideAngularModule, QrCode, ReceiptIndianRupee, SaveIcon, Search, SettingsIcon, ShoppingBag, Trash, Truck, TruckIcon, User, XIcon } from "lucide-angular";
import { InvoiceModal, InvoiceItemModal, DeliveryOption, InvoiceFilterModal } from '../invoice.modal';
import { InvoiceHeaderComponent } from "../../../../layouts/components/invoice-header/invoice-header.component";
import { AddressType, UserModel } from '../../../user-management/models/user.model';
import { UserManagementService } from '../../../user-management/userManagement.service';
import { DrawerService } from '../../../../layouts/components/drawer/drawerService';
import { ModalService } from '../../../../layouts/components/modal/modalService';
import { ItemSearchComponent } from '../../../../layouts/components/item-search/item-search.component';

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, LucideAngularModule, InvoiceHeaderComponent],
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.css']
})
export class InvoiceFormComponent implements OnInit {

  @Input() customerId: number | null = null;
  @Input() salesOrderId: number | null = null;
  @Input() id: number | null = null;
  @Input() invoiceNumber: string | null = null;
  isReadonly = false;

  //icons
  readonly TruckIcon = Truck;
  readonly TrashIcon = Trash;
  readonly ReceiptIndianRupeeIcon = ReceiptIndianRupee;
  readonly checkIcon = Check;
  readonly creditCardIcon = CreditCard;
  readonly chevronRightIcon = ChevronRight;
  readonly ArrowLeftIcon = ArrowLeft;
  readonly truckIcon = TruckIcon;
  readonly saveIcon = SaveIcon;
  readonly fileTextIcon = FileText;
  readonly boxIcon = BoxIcon;
  readonly userIcon = User;
  readonly calendarIcon = CalculatorIcon;
  readonly SearchIcon = Search;
  readonly BarCode = QrCode;
  readonly ShoppingBag = ShoppingBag;
  readonly SettingsIcon = SettingsIcon;
  readonly xIconIcon = XIcon;
  readonly HistoryIcon = HistoryIcon;
  readonly eyeIcon = EyeIcon;

  invoiceForm: FormGroup;
  isEditMode = false;
  orderId: number | null = null;
  isLoading = false;

  // User Search
  selectedUser: UserModel | null = null;

  // Pending Orders
  pendingOrders: SalesOrderModal[] = [];
  isLoadingOrders = false;

  // Item Search
  itemSearchQuery = "";

  //delivery config
  currentDeliveryType = signal<DeliveryOption>('IN_HOUSE_DELIVERY');
  deliveryTypes: DeliveryOption[] = ['IN_HOUSE_DELIVERY', 'THIRD_PARTY_COURIER', 'CUSTOMER_PICKUP'];
  enableScheduledDelivery = signal(true);
  scheduledDate = signal(getTomorrowString());
  isPickup = computed(() => this.currentDeliveryType() === 'CUSTOMER_PICKUP');

  //config
  isDeliveryScheduled = false;
  activeHistoryTab: 'invoices' | 'payments' = 'invoices';

  constructor(
    private fb: FormBuilder,
    private invoiceService: InvoiceService,
    private salesOrderService: SalesOrderService,
    private userService: UserManagementService,
    private loaderSvc: LoaderService,
    private toast: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private drawerService: DrawerService,
    private modalService: ModalService
  ) {
    this.invoiceForm = this.fb.group({
      id: [null],
      salesOrderId: [null],
      invoiceDate: [new Date().toISOString().split('T')[0], Validators.required],
      customerId: [null, Validators.required],
      warehouseId: [1, Validators.required],
      remarks: [''],
      items: this.fb.array([], Validators.required),

      // Changed to Rates to match backend mapping
      flatDiscountRate: [0, [Validators.min(0), Validators.max(100)]],
      flatTaxRate: [0, [Validators.min(0), Validators.max(100)]]
    });
  }

  ngOnInit(): void {
    if (this.customerId) {
      this.setUserById(this.customerId, "Loading...");
      this.invoiceForm.get('customerId')?.setValue(this.customerId);
    }
    this.checkEditMode();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'F2') {
      event.preventDefault();
      this.openItemSearch();
    }
  }

  openItemSearch() {
    this.modalService.openComponent(ItemSearchComponent, {
      searchType: 'STOCK',
      placeholder: 'Search stock by name, SKU or code...',
      onSelected: (item: any) => {
        this.selectItemFromSearch(item);
        this.modalService.close();
      }
    }, 'lg');
  }

  private checkEditMode() {
    if (this.id) {
      this.isEditMode = true;
      this.orderId = this.id;
      this.loadInvoiceForEdit(this.orderId);
    }

    if (this.salesOrderId) {
      this.isEditMode = false;
      this.loadOrderDetails(this.salesOrderId);
    }

    this.route.queryParamMap.subscribe(params => {
      const invoiceId = params.get('invoiceId');
      if (invoiceId) {
        this.isEditMode = true;
        this.orderId = +invoiceId;
        this.loadInvoiceForEdit(this.orderId);
      }
    });

    this.route.queryParamMap.subscribe(params => {
      const salesOrderId = params.get('salesOrderId');
      if (salesOrderId) {
        this.isEditMode = false;
        this.loadOrderDetails(+salesOrderId);
      }
    });

    if (this.invoiceNumber) {
      this.getInvoiceByNumber(this.invoiceNumber);
    }
  }

  getInvoiceByNumber(invoiceNumber: string) {
    if (!invoiceNumber) return;
    const filter = new InvoiceFilterModal();
    filter.invoiceNumber = invoiceNumber;
    this.isLoading = true;
    this.loaderSvc.show();
    this.invoiceService.searchInvoices(filter,
      (response: any) => {
        const invoices = response.data?.content || response.data || [];
        if (invoices && invoices.length > 0) {
          const invoice = invoices[0];
          this.isEditMode = true;
          this.orderId = invoice.id;

          this.patchInvoiceDetailsToForm(invoice);
          this.toast.show('Invoice loaded successfully', 'success');
        } else {
          this.toast.show('Invoice not found', 'warning');
        }
        this.isLoading = false;
        this.loaderSvc.hide();
      },
      (err: any) => {
        this.toast.show('Failed to load invoice', 'error');
        this.isLoading = false;
        this.loaderSvc.hide();
      }
    );
  }

  private patchInvoiceDetailsToForm(invoice: any) {
    this.invoiceForm.patchValue({
      id: invoice.id,
      salesOrderId: invoice.salesOrderId,
      customerId: invoice.customerId,
      warehouseId: invoice.warehouseId,
      invoiceDate: invoice.invoiceDate ? invoice.invoiceDate.split('T')[0] : new Date().toISOString().split('T')[0],
      remarks: invoice.remarks,
      flatDiscountRate: invoice.flatDiscountRate || 0,
      flatTaxRate: invoice.flatTaxRate || 0
    });

    this.setUserById(invoice.customerId, invoice.customerName || "Loading...");

    if (invoice.deliveryType) {
      this.currentDeliveryType.set(invoice.deliveryType as DeliveryOption);
    }
    if (invoice.scheduledDate) {
      this.enableScheduledDelivery.set(true);
      this.scheduledDate.set(invoice.scheduledDate.split('T')[0]);
    } else {
      this.enableScheduledDelivery.set(false);
    }

    const itemArray = this.items;
    itemArray.clear();

    if (invoice.items) {
      invoice.items.forEach((item: InvoiceItemModal) => {
        itemArray.push(this.createItemControl(item, 'INVOICE'));
      });
    }
  }

  private loadOrderDetails(id: number) {
    this.loaderSvc.show();
    this.salesOrderService.getSalesOrderById(id,
      (response: { data: SalesOrderModal }) => {
        const order = response.data;

        this.invoiceForm.patchValue({
          id: null,
          salesOrderId: order.id,
          customerId: order.customerId,
          warehouseId: order.warehouseId,
          invoiceDate: new Date().toISOString().split('T')[0],
          remarks: order.remarks,
          flatDiscountRate: order.flatDiscountRate || 0,
          flatTaxRate: order.flatTaxRate || 0
        });

        this.setUserById(order.customerId, order.customerName);
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
    this.invoiceService.getInvoiceById(id,
      (res: { data: InvoiceModal }) => {
        const invoice = res.data;
        this.patchInvoiceDetailsToForm(invoice);
        this.loaderSvc.hide();
      },
      (err: any) => {
        this.loaderSvc.hide();
        this.toast.show('Failed to load invoice', 'error');
      }
    );
  }

  private setUserById(userId: number, fallbackName: string) {
    this.userService.getUserById(userId,
      (res: { data: UserModel }) => {
        this.selectedUser = res.data;
      },
      (err: any) => {
        this.selectedUser = { id: userId, fullName: fallbackName } as UserModel;
      }
    );
  }

  selectItemFromSearch(item: any) {
    const itemId = item.id || item.itemId;
    const existingItemIndex = this.findItemIndexById(itemId);

    if (existingItemIndex > -1) {
      this.adjustQuantity(existingItemIndex, 1);
      this.toast.show(`${item.name} quantity updated`, 'success');
    } else {
      this.items.push(this.createItemControl(item, 'PRODUCT'));
    }
    this.focusFirstItemUnitPrice(this.items.length - 1);

    this.itemSearchQuery = "";
  }

  private findItemIndexById(itemId: number): number {
    return this.items.controls.findIndex(ctrl => ctrl.get('itemId')?.value === itemId);
  }

  private createItemControl(data: any, sourceType: 'INVOICE' | 'SO' | 'PRODUCT'): FormGroup {
    let id = null;
    let soItemId = null;
    let itemId = null;
    let name = '';
    let unitPrice = 0;
    let quantity = 1;
    let discountRate = 0;
    let taxRate = 0;
    let batchNumber = '';

    if (sourceType === 'INVOICE') {
      id = data.id;
      soItemId = data.soItemId;
      itemId = data.itemId;
      name = data.itemName;
      unitPrice = data.unitPrice;
      quantity = data.quantity;
      discountRate = data.discountRate || 0;
      taxRate = data.taxRate || 0;
      batchNumber = data.batchNumber || '';
    } else if (sourceType === 'SO') {
      id = null;
      soItemId = data.id;
      itemId = data.itemId;
      name = data.itemName;
      unitPrice = data.unitPrice;
      quantity = data.orderedQty - (data.invoicedQty || 0); // Only bring over uninvoiced qty
      discountRate = data.discountRate || 0;
      taxRate = data.taxRate || 0;
    } else if (sourceType === 'PRODUCT') {
      id = null;
      soItemId = null;
      itemId = data.itemId || data.id;
      name = data.name;
      // Stock items have no sellingPrice — fall back to buyPrice from the selected batch
      unitPrice = data.sellingPrice || data.buyPrice || data.batches?.[0]?.buyPrice || 0;
      quantity = 1;
      discountRate = 0;
      taxRate = 0;
      // batchNumber already set on the emitted item by ItemSearchComponent
      batchNumber = data.batchNumber || data.batches?.[0]?.batchNumber || '';
    }

    return this.fb.group({
      id: [id],
      soItemId: [soItemId],
      itemId: [itemId, Validators.required],
      name: [name],
      hsn: [data.hsnSacCode || data.hsn || null],
      unitPrice: [Number(unitPrice) || 0, [Validators.required, Validators.min(0)]],
      orderedQty: [Math.max(1, quantity), [Validators.required, Validators.min(1)]],
      discountRate: [discountRate, [Validators.min(0), Validators.max(100)]],
      taxRate: [taxRate, [Validators.min(0), Validators.max(100)]],
      batchNumber: [batchNumber]
    });
  }

  applySalesOrder(order: SalesOrderModal) {
    if (this.items.length > 0 && !confirm(`Autofill invoice from Order #${order.id}? This will replace current items.`)) return;

    this.invoiceForm.patchValue({
      salesOrderId: order.id,
      warehouseId: order.warehouseId,
      remarks: order.remarks,
      customerId: order.customerId,
      flatDiscountRate: order.flatDiscountRate || 0,
      flatTaxRate: order.flatTaxRate || 0
    });

    const itemArray = this.items;
    itemArray.clear();

    if (order.items) {
      order.items.forEach((item: any) => {
        itemArray.push(this.createItemControl(item, 'SO'));
      });
    }
  }

  // --- FORM HELPERS & FINANCIAL CALCULATIONS ---
  get items(): FormArray {
    return this.invoiceForm.get('items') as FormArray;
  }

  private round(num: number): number {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }

  getLineDetails(index: number) {
    const ctrl = this.items.at(index);
    const qty = Number(ctrl.get('orderedQty')?.value) || 0;
    const price = Number(ctrl.get('unitPrice')?.value) || 0;
    const discRate = Number(ctrl.get('discountRate')?.value) || 0;
    const taxRate = Number(ctrl.get('taxRate')?.value) || 0;

    const gross = this.round(qty * price);
    const discAmt = this.round(gross * (discRate / 100));
    const taxable = gross - discAmt;
    const taxAmt = this.round(taxable * (taxRate / 100));
    const lineTotal = taxable + taxAmt;

    return { gross, discAmt, taxAmt, lineTotal };
  }

  get itemGrossTotal(): number {
    return this.items.controls.reduce((sum, _, index) => sum + this.getLineDetails(index).lineTotal, 0);
  }

  get totalItemDiscounts(): number {
    return this.items.controls.reduce((sum, _, index) => sum + this.getLineDetails(index).discAmt, 0);
  }

  get totalItemTaxes(): number {
    return this.items.controls.reduce((sum, _, index) => sum + this.getLineDetails(index).taxAmt, 0);
  }

  get flatDiscountRate(): number { return this.invoiceForm.get('flatDiscountRate')?.value || 0; }
  get flatTaxRate(): number { return this.invoiceForm.get('flatTaxRate')?.value || 0; }

  get flatDiscountAmount(): number {
    return this.round(this.itemGrossTotal * (this.flatDiscountRate / 100));
  }

  get flatTaxAmount(): number {
    const taxableBill = this.itemGrossTotal - this.flatDiscountAmount;
    return this.round(taxableBill * (this.flatTaxRate / 100));
  }

  get grandTotal(): number {
    const taxableBill = this.itemGrossTotal - this.flatDiscountAmount;
    return Math.max(0, taxableBill + this.flatTaxAmount);
  }

  removeItem(index: number) {
    this.items.removeAt(index);
  }

  onDiscountAmountChange(index: number, event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const amountVal = parseFloat(inputElement.value) || 0;

    const ctrl = this.items.at(index);
    const qty = ctrl.get('orderedQty')?.value || 0;
    const price = ctrl.get('unitPrice')?.value || 0;
    const gross = this.round(qty * price);

    if (gross > 0) {
      let rate = (amountVal / gross) * 100;
      rate = this.round(Math.min(100, Math.max(0, rate)));
      ctrl.get('discountRate')?.setValue(rate);
    } else {
      ctrl.get('discountRate')?.setValue(0);
    }
  }

  onTaxAmountChange(index: number, event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const amountVal = parseFloat(inputElement.value) || 0;

    const ctrl = this.items.at(index);
    const qty = ctrl.get('orderedQty')?.value || 0;
    const price = ctrl.get('unitPrice')?.value || 0;
    const discRate = ctrl.get('discountRate')?.value || 0;

    const gross = this.round(qty * price);
    const discAmt = this.round(gross * (discRate / 100));
    const taxable = gross - discAmt;

    if (taxable > 0) {
      let rate = (amountVal / taxable) * 100;
      rate = this.round(Math.max(0, rate));
      ctrl.get('taxRate')?.setValue(rate);
    } else {
      ctrl.get('taxRate')?.setValue(0);
    }
  }

  adjustQuantity(index: number, delta: number) {
    const ctrl = this.items.at(index).get('orderedQty');
    const current = ctrl?.value || 0;
    if (current + delta > 0) {
      ctrl?.setValue(current + delta);
    }
  }

  // --- SAVE LOGIC ---
  saveOrder() {
    if (this.invoiceForm.invalid) {
      this.invoiceForm.markAllAsTouched();
      this.toast.show('Please fill required fields', 'warning');
      return;
    }

    const formVal = this.invoiceForm.getRawValue();

    // Mapping directly to the unified InvoiceModal
    const requestPayload: any = {
      id: formVal.id,
      salesOrderId: formVal.salesOrderId || null,
      customerId: formVal.customerId,
      warehouseId: formVal.warehouseId || 1,
      invoiceDate: formVal.invoiceDate,
      remarks: formVal.remarks,

      flatDiscountRate: formVal.flatDiscountRate,
      flatTaxRate: formVal.flatTaxRate,

      // Delivery Logic Mapping
      scheduledDate: this.enableScheduledDelivery() ? this.scheduledDate() : undefined,
      shippingAddress: "test address",
      deliveryType: this.currentDeliveryType(),

      items: formVal.items.map((item: any) => ({
        id: item.id,
        soItemId: item.soItemId,
        itemId: item.itemId,
        quantity: item.orderedQty,
        unitPrice: item.unitPrice,
        discountRate: item.discountRate, // Send Rate, Backend calculates amount
        taxRate: item.taxRate,           // Send Rate, Backend calculates amount
        batchNumber: item.batchNumber
      }))
    };

    this.isLoading = true;
    this.loaderSvc.show();

    if (this.isEditMode && this.orderId) {
      this.invoiceService.updateInvoice(this.orderId, requestPayload,
        (res: any) => this.handleSuccess(res, 'Invoice updated successfully'),
        (err: any) => this.handleError(err)
      );
    } else {
      this.invoiceService.createInvoice(requestPayload,
        (res: any) => this.handleSuccess(res, 'Invoice created successfully'),
        (err: any) => this.handleError(err)
      );
    }
  }

  private handleSuccess(res: any, msg: string) {
    this.loaderSvc.hide();
    this.isLoading = false;
    this.toast.show(msg, 'success');

    if (this.customerId) {
      this.drawerService.close();
    } else {
      const id = res.id || res.data?.id || this.orderId;
      this.router.navigate(['/sales/invoices', id]);
    }
  }

  private handleError(err: any) {
    this.loaderSvc.hide();
    this.isLoading = false;
    this.toast.show(err.error?.message || 'Operation failed', 'error');
  }

  onUserSelected(user: UserModel) {
    this.selectedUser = user;
    this.invoiceForm.patchValue({ customerId: user.id });
  }

  onUserCleared() {
    this.selectedUser = null;
    this.invoiceForm.patchValue({ customerId: null });
  }

  getFormattedAddress(): string {
    if (!this.selectedUser?.addresses?.length) return 'No address on file';
    const addr = this.selectedUser.addresses.find(a => a.type === AddressType.BILLING)
      || this.selectedUser.addresses[0];
    return `${addr.city}, ${addr.state}`;
  }

  onDeliveryChange(type: DeliveryOption) {
    this.currentDeliveryType.set(type);
  }

  toggleScheduledDelivery() {
    this.enableScheduledDelivery.update(value => !value);
  }

  fetchPendingOrders(customerId: number) {
    this.isLoadingOrders = true;
    this.pendingOrders = [];
    const filter = { customerId: customerId, status: 'CREATED' };

    this.salesOrderService.searchSalesOrders(filter,
      (res: { data: { content: SalesOrderModal[] } }) => {
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

  focusFirstItemUnitPrice(index: number) {
    // Use 150ms to ensure Angular has finished rendering the new DOM element
    setTimeout(() => {
      const unitPriceInput = document.getElementById('unitPriceInput' + index) as HTMLInputElement;
      if (unitPriceInput) {
        unitPriceInput.focus();
      }
    }, 150);
  }
}

function getTomorrowString(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toLocaleDateString('en-CA');
}