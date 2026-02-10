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

  approvalConfigDetails:ApprovalConfigModel | null = null;

  // Options
  warehouseOptions = [
    { label: 'Main Warehouse (Chennai)', value: 1 },
    { label: 'Bangalore DC', value: 2 },
    { label: 'Mumbai Hub', value: 3 }
  ];

  constructor(
    private fb: FormBuilder,
    private salesOrderService: SalesOrderService,
    private approvalConsoleService:ApprovalConsoleService,
    private userService: UserManagementService,
    private itemService: ItemService,
    private toast: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.userFilter.userType = [UserType.VENDOR];
    this.orderForm = this.fb.group({
      id: [null],
      customerId: [1, Validators.required],
      warehouseId: [1, Validators.required],
      orderDate: [new Date().toISOString().split('T')[0], Validators.required],
      remarks: [''],
      items: this.fb.array([], Validators.required),
      // Financials (Global)
      totalDiscount: [0], // Global Discount Amount
      totalTax: [0] // Global Tax % to apply
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
          totalDiscount: order.totalDiscount, // Map Flat Discount
          totalTax: order.totalTax          // Map Flat Tax
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
            discount: item.discount,
            tax: item.tax
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
        // wrapping in observable for switchMap
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

  // --- Form Accessors ---

  get items(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }

  // --- Financial Calculations (Getters) ---

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

  get totalItemTaxes(): number {
    return this.items.controls.reduce((sum, ctrl) => {
      return sum + (ctrl.get('tax')?.value || 0);
    }, 0);
  }

  get headerDiscount(): number {
    return this.orderForm.get('totalDiscount')?.value || 0;
  }

  get headerTax(): number {
    return this.orderForm.get('totalTax')?.value || 0;
  }

  // CHANGE 4: Updated Grand Total Formula
  // (Price * Qty) - (Item Disc) + (Item Tax) - (Header Disc) + (Header Tax)
  get grandTotal(): number {
    const itemsNet = this.subtotal - this.totalItemDiscounts + this.totalItemTaxes;
    const headerAdjustments = this.headerTax - this.headerDiscount;

    return Math.max(0, itemsNet + headerAdjustments);
  }

  get globalDiscount(): number {
    return this.orderForm.get('discount')?.value || 0;
  }

  get calculatedTax(): number {
    const taxPercent = this.orderForm.get('taxPercentage')?.value || 0;
    // Taxable = Subtotal - Total Discounts
    const taxable = Math.max(0, this.subtotal - this.totalItemDiscounts - this.globalDiscount);
    return (taxable * taxPercent) / 100;
  }

  getRowTotal(index: number): number {
    const ctrl = this.items.at(index);
    const qty = ctrl.get('orderedQty')?.value || 0;
    const price = ctrl.get('unitPrice')?.value || 0;
    const disc = ctrl.get('discount')?.value || 0;
    const tax = ctrl.get('tax')?.value || 0; // Include item tax
    return Math.max(0, (qty * price) - disc + tax);
  }

  // --- Item Management ---

  onItemSearchInput(event: any) {
    const query = event.target.value;
    this.itemSearchQuery = query;
    this.searchSubject.next(query);
  }

  selectItemFromSearch(item: ItemModel) {
    // 1. Check if item already exists in the array
    const existingIndex = this.items.controls.findIndex(
      (control) => control.get('itemId')?.value === item.id
    );

    if (existingIndex !== -1) {
      // 2. If exists, just increment the quantity
      this.adjustQuantity(existingIndex, 1);
      
      this.toast.show(`${item.name} quantity updated`, 'success'); // Optional feedback
    } else {
      // 3. If new, push to array
      this.items.push(this.createItemControl(item));
    }

    // 4. Reset search
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
      discount: [data.discount || 0, Validators.min(0)],
      tax: [data.tax || 0, [Validators.min(0)]]
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

  //Customer Management
  getUserById(customerId:any){
    this.userService.getUserById(
      customerId,
      (response:any) => {
        this.selectedUser = response.data;
      },
      (err:any) => {
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
    const taxPerItem = this.calculatedTax / formVal.items.length; // Simple distribution for DTO

    // Map to Backend DTO
    const payload = {
      customerId: formVal.customerId,
      warehouseId: formVal.warehouseId,
      orderDate: formVal.orderDate,
      remarks: formVal.remarks,
      totalDiscount: formVal.totalDiscount,
      totalTax: formVal.totalTax,
      items: formVal.items.map((i: any) => ({
        itemId: i.itemId,
        orderedQty: i.orderedQty,
        unitPrice: i.unitPrice,
        discount: i.discount,
        tax: i.tax // Send the specific item tax
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
        this.toast.show("", 'error')
      }
    )
  }

  get isApprovalRequired(): boolean {
    // 1. Safety checks
    // FIX: Change .isEnabled to .enabled to match your API JSON
    if (!this.approvalConfigDetails || !this.approvalConfigDetails.isEnabled) {
      return false;
    }

    // 2. Calculate Total Discount Amount (Line items + Global header discount)
    const totalDiscountAmount = this.totalItemDiscounts + this.headerDiscount;

    // 3. Avoid division by zero
    if (this.subtotal === 0) return false;

    // 4. Calculate Percentage
    const currentDiscPercent = (totalDiscountAmount / this.subtotal) * 100;

    // 5. Compare with Threshold
    // Use optional chaining just in case
    return currentDiscPercent > (this.approvalConfigDetails.thresholdPercentage || 100);
  }



  toggleGstBill() {
  const current = this.orderForm.get('isGstBill')?.value;
  this.orderForm.patchValue({ isGstBill: !current });
}
}