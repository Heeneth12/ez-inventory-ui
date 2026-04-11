import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnInit, ViewChild, HostListener } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastService } from '../../../../layouts/components/toast/toastService';
import { ItemService } from '../../../items/item.service';
import { ItemModel } from '../../../items/models/Item.model';
import { SalesOrderService } from '../sales-order.service';
import { LucideAngularModule, Search, QrCode, Loader2, AlertTriangle, ShoppingBag, SettingsIcon, FileDown, XIcon, ArrowLeft, Check, Eye, Trash, Save } from 'lucide-angular';
import { InvoiceHeaderComponent } from "../../../../layouts/components/invoice-header/invoice-header.component";
import { ApprovalConfigModel, ApprovalType } from '../../../approval-console/approval-console.model';
import { ApprovalConsoleService } from '../../../approval-console/approval-console.service';
import { UserModel, AddressType, UserType, UserFilterModel } from '../../../user-management/models/user.model';
import { UserManagementService } from '../../../user-management/userManagement.service';
import { DrawerService } from '../../../../layouts/components/drawer/drawerService';
import { SalesOrderFilterModal } from '../sales-order.modal';
import { ModalService } from '../../../../layouts/components/modal/modalService';
import { ItemSearchComponent } from '../../../../layouts/components/item-search/item-search.component';

@Component({
  selector: 'app-sales-order-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, LucideAngularModule, InvoiceHeaderComponent],
  templateUrl: './sales-order-form.component.html',
  styleUrls: ['./sales-order-form.component.css']
})
export class SalesOrderFormComponent implements OnInit {

  @Input() customerId: number | null = null;
  @Input() id: number | null = null; // sales order id
  @Input() orderNumber: string | null = null;

  @ViewChild('itemSearchInput') itemSearchInput!: ElementRef;

  // icons
  readonly SearchIcon = Search;
  readonly BarCode = QrCode;
  readonly LoaderIcon = Loader2;
  readonly WarningIcon = AlertTriangle;
  readonly ShoppingBag = ShoppingBag;
  readonly SettingsIcon = SettingsIcon;
  readonly FileDownIcon = FileDown;
  readonly xIconIcon = XIcon;
  readonly ArrowLeftIcon = ArrowLeft;
  readonly eyeIcon = Eye;
  readonly checkIcon = Check;
  readonly TrashIcon = Trash;
  readonly DraftIcon = Save;

  orderForm: FormGroup;
  isEditMode = false;
  orderId: number | null = null;
  isLoading = false;
  isReadonly = false;
  orderStatus: string | null = null;

  // Customer Search
  selectedUser: UserModel | null = null;
  userFilter: UserFilterModel = new UserFilterModel();

  // Item Search
  itemSearchResults: ItemModel[] = [];
  itemSearchQuery = "";

  approvalConfigDetails: ApprovalConfigModel | null = null;

  // Options
  warehouseOptions = [
    { label: 'Main Warehouse (Chennai)', value: 1 },
    { label: 'Bangalore DC', value: 2 },
    { label: 'Mumbai Hub', value: 3 }
  ];

  constructor(
    private fb: FormBuilder,
    private salesOrderService: SalesOrderService,
    private approvalConsoleService: ApprovalConsoleService,
    private userService: UserManagementService,
    private toast: ToastService,
    private drawerService: DrawerService,
    private modalService: ModalService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.userFilter.userType = [UserType.VENDOR];
    this.orderForm = this.fb.group({
      id: [null],
      customerId: [null, Validators.required], // Start null to force selection
      warehouseId: [1, Validators.required],
      orderDate: [new Date().toISOString().split('T')[0], Validators.required],
      remarks: [''],
      isGstBill: [false],
      items: this.fb.array([], Validators.required),

      // Header Level Adjustments (Inputs are RATES %)
      flatDiscountRate: [0, [Validators.min(0), Validators.max(100)]],
      flatTaxRate: [0, [Validators.min(0), Validators.max(100)]],
      referenceNumber: ['']
    });
  }

  ngOnInit(): void {
    if (this.customerId) {
      this.getUserById(this.customerId);
      this.orderForm.get('customerId')?.setValue(this.customerId);
    }

    this.checkEditMode();
    this.getSalesOrderApprovalConfig();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.isReadonly) return;
    // F2 to open Item Search
    if (event.key === 'F2') {
      event.preventDefault();
      this.openItemSearch();
    }
    // F3 to focus on SO Search
    if (event.key === 'F3') {
      event.preventDefault();
      const soSearchElem = document.querySelector('input[placeholder="Enter SO Number..."]') as HTMLInputElement;
      if (soSearchElem) soSearchElem.focus();
    }
  }

  private checkEditMode() {
    if (this.id) {
      this.initializeEditMode(this.id);
      return;
    }

    if (this.orderNumber) {
      this.getSalesOrderByNumber(this.orderNumber);
      return;
    }

    this.route.paramMap.subscribe(params => {
      const routeId = params.get('id');

      if (routeId) {
        this.initializeEditMode(routeId);
      }
    });
  }

  private initializeEditMode(id: string | number) {
    this.isEditMode = true;
    this.orderId = Number(id);
    this.loadOrderDetails(this.orderId);
  }

  private loadOrderDetails(id: number) {
    this.isLoading = true;
    this.salesOrderService.getSalesOrderById(id,
      (response: any) => {
        const order = response.data;
        this.checkReadonlyStatus(order);
        this.patchOrderDetailsToForm(order);
        this.isLoading = false;
      },
      (err: any) => {
        this.toast.show('Failed to load order details', 'error');
        this.isLoading = false;
      }
    );
  }

  private checkReadonlyStatus(order: any) {
    this.orderStatus = order.status;
    if (this.orderStatus === 'FULLY_INVOICED' || this.orderStatus === 'REJECTED' || this.orderStatus === 'CANCELLED') {
      this.isReadonly = true;
      this.orderForm.disable();
    } else {
      this.isReadonly = false;
      this.orderForm.enable();
    }
  }

  openItemSearch() {
    this.modalService.openComponent(ItemSearchComponent, {
      searchType: 'ITEM',
      placeholder: 'Search for products to add to order...',
      onSelected: (item: any) => {
        this.selectItemFromSearch(item);
        this.modalService.close();
      }
    }, 'lg');
  }

  private patchOrderDetailsToForm(order: any) {
    // 1. Patch Header
    this.orderForm.patchValue({
      id: order.id,
      customerId: order.customerId,
      warehouseId: order.warehouseId,
      orderDate: order.orderDate,
      remarks: order.remarks,
      // Map backend DTO to Form Controls
      flatDiscountRate: order.flatDiscountRate || 0,
      flatTaxRate: order.flatTaxRate || 0
    });

    // 2. Set Customer Display
    this.getUserById(order.customerId);

    // 3. Patch Items
    const itemArray = this.orderForm.get('items') as FormArray;
    itemArray.clear();

    if (order.items) {
      order.items.forEach((item: any) => {
        itemArray.push(this.createItemControl({
          id: item.itemId,
          name: item.itemName,
          sellingPrice: item.unitPrice,
          orderedQty: item.orderedQty,
          // Map Rates
          discountRate: item.discountRate,
          taxRate: item.taxRate
        }));
      });
    }
  }

  getSalesOrderByNumber(salesOrderNumber: string) {
    if (!salesOrderNumber) return;
    const filter = new SalesOrderFilterModal();
    filter.soNumber = salesOrderNumber;
    this.isLoading = true;
    this.salesOrderService.searchSalesOrders(filter,
      (response: any) => {
        if (response.data && response.data.length > 0) {
          const order = response.data[0];
          this.isEditMode = true;
          this.orderId = order.id;
          this.checkReadonlyStatus(order);
          this.patchOrderDetailsToForm(order);
          this.toast.show('Sales order loaded successfully', 'success');
        } else {
          this.toast.show('Sales order not found', 'warning');
        }
        this.isLoading = false;
      },
      (err: any) => {
        this.toast.show('Failed to load sales orders', 'error');
        this.isLoading = false;
      }
    );
  }

  get items(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }

  // Helper to round currency
  private round(num: number): number {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }

  /**
   * Calculates the specific line totals based on current Rate inputs
   * Formula: (Price * Qty) - (Gross * Disc%) + ((Gross-Disc) * Tax%)
   */
  getLineDetails(index: number) {
    const ctrl = this.items.at(index);
    const qty = ctrl.get('orderedQty')?.value || 0;
    const price = ctrl.get('unitPrice')?.value || 0;
    const discRate = ctrl.get('discountRate')?.value || 0;
    const taxRate = ctrl.get('taxRate')?.value || 0;

    const gross = this.round(qty * price);
    const discAmt = this.round(gross * (discRate / 100));
    const taxable = gross - discAmt;
    const taxAmt = this.round(taxable * (taxRate / 100));
    const lineTotal = taxable + taxAmt;

    return { gross, discAmt, taxAmt, lineTotal };
  }

  // 1. Sum of all Line Totals (Item Gross Total in Java)
  get itemGrossTotal(): number {
    return this.items.controls.reduce((sum, ctrl, index) => {
      const details = this.getLineDetails(index);
      return sum + details.lineTotal;
    }, 0);
  }

  // 2. Sum of all Item Discounts (For Display)
  get totalItemDiscounts(): number {
    return this.items.controls.reduce((sum, ctrl, index) => {
      return sum + this.getLineDetails(index).discAmt;
    }, 0);
  }

  // 3. Sum of all Item Taxes (For Display)
  get totalItemTaxes(): number {
    return this.items.controls.reduce((sum, ctrl, index) => {
      return sum + this.getLineDetails(index).taxAmt;
    }, 0);
  }

  // --- Header Calculations ---

  get flatDiscountRate(): number {
    return this.orderForm.get('flatDiscountRate')?.value || 0;
  }

  get flatTaxRate(): number {
    return this.orderForm.get('flatTaxRate')?.value || 0;
  }

  // Calculated Flat Discount Amount (Logic: Applied on Sum of Line Totals)
  get flatDiscountAmount(): number {
    const lineSum = this.itemGrossTotal;
    return this.round(lineSum * (this.flatDiscountRate / 100));
  }

  // Calculated Flat Tax Amount (Logic: Applied on Bill AFTER Flat Discount)
  get flatTaxAmount(): number {
    const taxableBill = this.itemGrossTotal - this.flatDiscountAmount;
    return this.round(taxableBill * (this.flatTaxRate / 100));
  }

  // Final Grand Total
  get grandTotal(): number {
    const taxableBill = this.itemGrossTotal - this.flatDiscountAmount;
    return Math.max(0, taxableBill + this.flatTaxAmount);
  }

  selectItemFromSearch(item: any) {
    const selectedId = item.id || item.itemId;
    let targetIndex = this.items.controls.findIndex(
      (control) => control.get('itemId')?.value === selectedId
    );

    if (targetIndex !== -1) {
      this.adjustQuantity(targetIndex, 1);
      this.toast.show(`${item.name} quantity updated`, 'success');
    } else {
      this.items.push(this.createItemControl(item));
      targetIndex = this.items.length - 1;
    }

    // Now focus the input at the correct index
    this.focusFirstItemUnitPrice(targetIndex);

    this.itemSearchQuery = "";
    this.itemSearchResults = [];
  }

  private createItemControl(data: any): FormGroup {
    return this.fb.group({
      itemId: [data.id || data.itemId],
      name: [data.name],
      hsn: [data.hsnSacCode],
      imageUrl: [data.imageUrl || 'https://ui-avatars.com/api/?name=' + data.name + '&background=eff6ff&color=3b82f6&bold=true&size=128'],
      unitPrice: [data.sellingPrice || 0, [Validators.required, Validators.min(0)]],
      orderedQty: [data.orderedQty || 1, [Validators.required, Validators.min(1)]],
      // UPDATED: Inputs are Rates (%)
      discountRate: [data.discountRate || 0, [Validators.min(0), Validators.max(100)]],
      taxRate: [data.taxRate || 0, [Validators.min(0), Validators.max(100)]]
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

  onDiscountAmountChange(index: number, event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const amountVal = parseFloat(inputElement.value) || 0;

    const ctrl = this.items.at(index);
    const qty = ctrl.get('orderedQty')?.value || 0;
    const price = ctrl.get('unitPrice')?.value || 0;
    const gross = this.round(qty * price);

    if (gross > 0) {
      let rate = (amountVal / gross) * 100;
      rate = this.round(rate);
      rate = Math.min(100, Math.max(0, rate));
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
      rate = this.round(rate);
      rate = Math.max(0, rate);
      ctrl.get('taxRate')?.setValue(rate);
    } else {
      ctrl.get('taxRate')?.setValue(0);
    }
  }

  // --- Customer Management ---
  getUserById(customerId: any) {
    this.userService.getUserById(
      customerId,
      (response: any) => {
        this.selectedUser = response.data;
        this.focusItemSearch();
      },
      (err: any) => {
        console.log(err);
      }
    )
  }

  onUserSelected(user: UserModel) {
    if (this.isReadonly) return;
    this.selectedUser = user;
    this.orderForm.patchValue({ customerId: user.id });
    this.focusItemSearch();
  }

  onUserCleared() {
    if (this.isReadonly) return;
    this.selectedUser = null;
    this.orderForm.patchValue({ customerId: null });
  }

  getFormattedAddress(): string {
    if (!this.selectedUser?.addresses?.length) return 'No address on file';
    const addr = this.selectedUser.addresses.find(a => a.type === AddressType.BILLING)
      || this.selectedUser.addresses[0];
    return `${addr.city}, ${addr.state}`;
  }


  saveOrder() {
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      this.toast.show('Please fill required fields', 'warning');
      return;
    }

    const formVal = this.orderForm.getRawValue();

    // Map to the new SalesOrderDto structure
    const payload = {
      customerId: formVal.customerId,
      warehouseId: formVal.warehouseId,
      orderDate: formVal.orderDate,
      remarks: formVal.remarks,

      // Header Level Rates
      flatDiscountRate: formVal.flatDiscountRate,
      flatTaxRate: formVal.flatTaxRate,

      // Map Items (sending Rates, Backend calculates Amounts)
      items: formVal.items.map((i: any) => ({
        itemId: i.itemId,
        orderedQty: i.orderedQty,
        unitPrice: i.unitPrice,
        discountRate: i.discountRate, // Send %
        taxRate: i.taxRate            // Send %
      }))
    };

    if (this.isEditMode && this.orderId) {
      this.salesOrderService.updateSalesOrder(this.orderId, payload,
        () => {
          this.toast.show('Order updated successfully', 'success');
          // this mean i got open in user profile so close the side drawer
          if (this.customerId) {
            this.drawerService.close();
          } else {
            this.router.navigate(['/sales']);
          }
        },
        (err: any) => this.toast.show(err.error?.message || 'Update failed', 'error')
      );
    } else {
      this.salesOrderService.createSalesOrder(payload,
        () => {
          this.toast.show('Order created successfully', 'success');
          if (this.customerId) {
            this.drawerService.close();
          } else {
            this.router.navigate(['/sales']);
          }
        },
        (err: any) => this.toast.show(err.error?.message || 'Creation failed', 'error')
      );
    }
  }

  getSalesOrderApprovalConfig() {
    this.approvalConsoleService.getApprovalConfigByApprovalType(
      ApprovalType.SALES_ORDER_DISCOUNT,
      (response: any) => {
        this.approvalConfigDetails = response.data;
      },
      (err: any) => {
        this.toast.show("Failed to load approval rules", 'error')
      }
    )
  }

  get isApprovalRequired(): boolean {
    if (!this.approvalConfigDetails || !this.approvalConfigDetails.isEnabled) {
      return false;
    }

    // Calculate Total Discount Value (Item Level + Header Level)
    const totalDiscountVal = this.totalItemDiscounts + this.flatDiscountAmount;

    // Base Amount (Item Gross Total before any discount)
    // We calculate pure gross (Price * Qty) for percentage comparison
    const rawGross = this.items.controls.reduce((sum, ctrl) => {
      const qty = ctrl.get('orderedQty')?.value || 0;
      const price = ctrl.get('unitPrice')?.value || 0;
      return sum + (qty * price);
    }, 0);

    if (rawGross === 0) return false;

    const currentDiscPercent = (totalDiscountVal / rawGross) * 100;

    return currentDiscPercent > (this.approvalConfigDetails.thresholdPercentage || 100);
  }

  toggleGstBill() {
    const current = this.orderForm.get('isGstBill')?.value;
    this.orderForm.patchValue({ isGstBill: !current });
  }

  onPreview() {
    console.log("Preview Clicked");
  }

  back() {
    this.router.navigate(['/sales']);
  }

  private focusItemSearch() {
    setTimeout(() => {
      this.itemSearchInput.nativeElement.focus();
    }, 100);
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