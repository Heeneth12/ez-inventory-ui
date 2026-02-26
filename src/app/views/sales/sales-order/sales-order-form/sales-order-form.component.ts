import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, switchMap, of } from 'rxjs';
import { ToastService } from '../../../../layouts/components/toast/toastService';
import { ItemService } from '../../../items/item.service';
import { ItemModel, ItemSearchFilter } from '../../../items/models/Item.model';
import { SalesOrderService } from '../sales-order.service';
import { LucideAngularModule, Search, QrCode, Loader2, AlertTriangle, ShoppingBag, SettingsIcon, FileDown } from 'lucide-angular';
import { InvoiceHeaderComponent } from "../../../../layouts/components/invoice-header/invoice-header.component";
import { ApprovalConfigModel, ApprovalType } from '../../../approval-console/approval-console.model';
import { ApprovalConsoleService } from '../../../approval-console/approval-console.service';
import { UserModel, AddressType, UserType, UserFilterModel } from '../../../user-management/models/user.model';
import { UserManagementService } from '../../../user-management/userManagement.service';

@Component({
  selector: 'app-sales-order-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, LucideAngularModule, InvoiceHeaderComponent],
  templateUrl: './sales-order-form.component.html',
  styleUrls: ['./sales-order-form.component.css']
})
export class SalesOrderFormComponent implements OnInit {

  // icons
  readonly SearchIcon = Search;
  readonly BarCode = QrCode;
  readonly LoaderIcon = Loader2;
  readonly WarningIcon = AlertTriangle;
  readonly ShoppingBag = ShoppingBag;
  readonly SettingsIcon = SettingsIcon;
  readonly FileDownIcon = FileDown;

  orderForm: FormGroup;
  isEditMode = false;
  orderId: number | null = null;
  isLoading = false;

  // Customer Search
  selectedUser: UserModel | null = null;
  userFilter: UserFilterModel = new UserFilterModel();

  // Item Search
  itemSearchResults: ItemModel[] = [];
  itemSearchQuery = "";
  showItemResults = false;
  private searchSubject = new Subject<string>();

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
    private itemService: ItemService,
    private toast: ToastService,
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
      flatTaxRate: [0, [Validators.min(0), Validators.max(100)]]
    });
  }

  ngOnInit(): void {
    this.setupItemSearch();
    this.checkEditMode();
    this.getSalesOrderApprovalConfig();
  }

  // --- Initialization Logic ---
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
        if (!query.trim()) return of([]);
        const filter = new ItemSearchFilter();
        filter.searchQuery = query;
        filter.active = true;
        return new Promise(resolve => {
          this.itemService.searchItems(filter,
            (res: any) => resolve(res.data),
            () => resolve([])
          );
        });
      })
    ).subscribe((results: any) => {
      this.itemSearchResults = results;
      this.showItemResults = results.length > 0;
    });
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

  // --- Item Management ---

  onItemSearchInput(event: any) {
    const query = event.target.value;
    this.itemSearchQuery = query;
    this.searchSubject.next(query);
  }

  selectItemFromSearch(item: ItemModel) {
    const existingIndex = this.items.controls.findIndex(
      (control) => control.get('itemId')?.value === item.id
    );

    if (existingIndex !== -1) {
      this.adjustQuantity(existingIndex, 1);
      this.toast.show(`${item.name} quantity updated`, 'success');
    } else {
      this.items.push(this.createItemControl(item));
    }

    this.itemSearchQuery = "";
    this.showItemResults = false;
    this.itemSearchResults = [];
  }

  private createItemControl(data: any): FormGroup {
    return this.fb.group({
      itemId: [data.id],
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

  // --- Customer Management ---
  getUserById(customerId: any) {
    this.userService.getUserById(
      customerId,
      (response: any) => {
        this.selectedUser = response.data;
      },
      (err: any) => {
        console.log(err);
      }
    )
  }

  onUserSelected(user: UserModel) {
    this.selectedUser = user;
    this.orderForm.patchValue({ customerId: user.id });
  }

  onUserCleared() {
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
          this.router.navigate(['/sales']);
        },
        (err: any) => this.toast.show(err.error?.message || 'Update failed', 'error')
      );
    } else {
      this.salesOrderService.createSalesOrder(payload,
        () => {
          this.toast.show('Order created successfully', 'success');
          this.router.navigate(['/sales']);
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
}