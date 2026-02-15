import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, switchMap, of } from 'rxjs';
import { LoaderService } from '../../../../layouts/components/loader/loaderService';
import { ToastService } from '../../../../layouts/components/toast/toastService';
import { ItemService } from '../../../items/item.service';
import { ItemModel, ItemSearchFilter } from '../../../items/models/Item.model';
import { LucideAngularModule, Search, ShoppingBag, XIcon, Check, ChevronRight, Eye, Mail, SaveIcon, FileText, Settings, Paperclip, Upload, Trash2 } from "lucide-angular";
import { UserModel } from '../../../user-management/models/user.model';
import { PurchaseService } from '../../../purchases/purchase.service';
import { NewOrdersHeaderComponent } from "../new-orders-header/new-orders-header.component";
import { UserManagementService } from '../../../user-management/userManagement.service';
import { PoStatus, PurchaseOrderDto } from '../../models/po.model';

@Component({
  selector: 'app-new-order-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    LucideAngularModule,
    NewOrdersHeaderComponent
  ],
  templateUrl: './new-order-form.component.html',
  styleUrl: './new-order-form.component.css'
})
export class NewOrderFormComponent implements OnInit {
  // Icons
  readonly SearchIcon = Search;
  readonly ShoppingBag = ShoppingBag;
  readonly xIconIcon = XIcon;
  readonly checkIcon = Check;
  readonly chevronRightIcon = ChevronRight;
  readonly saveIcon = SaveIcon;
  readonly eyeIcon = Eye;
  readonly mailIcon = Mail;
  readonly fileTextIcon = FileText;
  readonly SettingsIcon = Settings;
  readonly PaperclipIcon = Paperclip;
  readonly UploadIcon = Upload;
  readonly TrashIcon = Trash2;

  prqForm!: FormGroup;
  isEditMode = false;
  prqId: number | null = null;
  poId: number | null = null;
  poStatus: PoStatus = PoStatus.ISSUED;

  // Data State
  selectedVendor: UserModel | null = null;
  warehouseList: any[] = [{ id: 1, name: 'Main Warehouse' }];
  uploadedFiles: File[] = [];
  userId: string = '';

  // Item Search State
  itemSearchResults: ItemModel[] = [];
  itemSearchQuery = "";
  showItemResults = false;
  private itemSearchSubject = new Subject<string>();

  constructor(
    private fb: FormBuilder,
    private purchaseService: PurchaseService,
    private userService: UserManagementService,
    private itemService: ItemService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    public loaderSvc: LoaderService
  ) {
    // here userId id the Vendor's userId
    this.userId = sessionStorage.getItem('userId') || '';
    if (this.userId) {
      this.fetchVendor(+this.userId);
    }
    this.initForm();
  }

  ngOnInit(): void {
    this.setupItemSearch();
    this.checkRouteParams();
  }

  private initForm() {
    this.prqForm = this.fb.group({
      prqId: [this.prqId || null],  // this will be patched in edit mode
      vendorId: [this.selectedVendor?.id || null, [Validators.required]],
      warehouseId: [1, [Validators.required]],
      expectedDeliveryDate: [new Date().toISOString().substring(0, 10), [Validators.required]],
      notes: [''],
      flatDiscount: [0, [Validators.min(0)]],
      flatTax: [0, [Validators.min(0)]],
      items: this.fb.array([], Validators.required)
    });
  }

  private checkRouteParams() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.prqId = +id;
        this.prqForm.patchValue({ prqId: this.prqId });
        this.loadPrqDetails(this.prqId);
      }
    });
  }

  // === CALCULATIONS (Live UI Updates) ===
  get itemsFormArray(): FormArray {
    return this.prqForm.get('items') as FormArray;
  }

  // 1. Line Total: (Qty * Price) - Disc + Tax
  getRowTotal(index: number): number {
    const row = this.itemsFormArray.at(index);
    const qty = row.get('orderedQty')?.value || 0;
    const price = row.get('unitPrice')?.value || 0;
    const disc = row.get('discount')?.value || 0;
    const tax = row.get('tax')?.value || 0;
    
    let total = (qty * price) - disc + tax;
    return Math.max(0, total);
  }

  // 2. Subtotal (Matches 'totalAmount' in DTO)
  get subTotal(): number {
    return this.itemsFormArray.controls.reduce((acc, control, index) => {
      return acc + this.getRowTotal(index);
    }, 0);
  }

  // 3. Helpers for Reporting (Total Savings/Tax)
  get sumItemDiscounts(): number {
    return this.itemsFormArray.controls.reduce((acc, row) => acc + (row.get('discount')?.value || 0), 0);
  }

  get sumItemTaxes(): number {
    return this.itemsFormArray.controls.reduce((acc, row) => acc + (row.get('tax')?.value || 0), 0);
  }

  // 4. Final Payable (Matches 'grandTotal' in DTO)
  get grandTotal(): number {
    const flatDisc = this.prqForm.get('flatDiscount')?.value || 0;
    const flatTax = this.prqForm.get('flatTax')?.value || 0;
    // Formula: Subtotal - Flat Disc + Flat Tax
    return Math.max(0, this.subTotal - flatDisc + flatTax);
  }


  // === FORM ACTIONS ===

  onSubmit() {
    if (this.prqForm.invalid) {
      this.prqForm.markAllAsTouched();
      console.log('Form Raw Value:', this.prqForm.getRawValue());
      this.toastService.show('Please fix errors in the form', 'warning');
      return;
    }

    this.loaderSvc.show();
    const rawVal = this.prqForm.getRawValue();
    console.log('Form Raw Value:', rawVal);
    // Calculate Aggregates to send to Backend
    const calculatedTotalAmount = this.subTotal;
    const calculatedGrandTotal = this.grandTotal;
    // Total Discount = All Item Discounts + Flat Discount
    const calculatedTotalDiscount = this.sumItemDiscounts + (rawVal.flatDiscount || 0);
    // Total Tax = All Item Taxes + Flat Tax
    const calculatedTotalTax = this.sumItemTaxes + (rawVal.flatTax || 0);

    //Prepare DTO
    const payload: PurchaseOrderDto = {
      id: this.poId || undefined,
      prqId: this.prqId ? this.prqId : undefined,
      vendorId: rawVal.vendorId,
      warehouseId: rawVal.warehouseId,
      expectedDeliveryDate: new Date(rawVal.expectedDeliveryDate).getTime(),
      status: this.poStatus,
      notes: rawVal.notes,
      flatDiscount: rawVal.flatDiscount,
      flatTax: rawVal.flatTax,
      totalAmount: calculatedTotalAmount,
      totalDiscount: calculatedTotalDiscount,
      totalTax: calculatedTotalTax,
      grandTotal: calculatedGrandTotal,
      items: rawVal.items.map((item: any) => ({
        itemId: item.itemId,
        itemName: item.itemName,
        orderedQty: item.orderedQty,
        unitPrice: item.unitPrice,
        discount: item.discount,
        tax: item.tax
      }))
    };

    const cb = (res: any) => {
      this.loaderSvc.hide();
      this.toastService.show(this.isEditMode ? 'Order Updated' : 'Order Created', 'success');
      this.router.navigate(['vendor/new-orders']);
    };

    const errCb = () => {
      this.loaderSvc.hide();
      this.toastService.show('Failed to save order', 'error');
    };

    if (this.isEditMode && this.poId) {
      // this.purchaseService.updatePo(this.poId, payload, cb, errCb);
    } else {
      this.purchaseService.createPO(payload, cb, errCb);
    }
  }


  // Updated form group to include both estimated and actual unit price
  createItemGroup(data?: any): FormGroup {
    return this.fb.group({
      itemId: [data?.itemId || null, Validators.required],
      itemName: [data?.itemName || ''],
      requestedQty: [data?.requestedQty || 0],
      orderedQty: [data?.orderedQty || data?.requestedQty || 1, [Validators.required, Validators.min(1)]],

      // Logic: Use estimatedUnitPrice as the default unitPrice
      estimatedUnitPrice: [data?.estimatedUnitPrice || 0],
      unitPrice: [data?.unitPrice || data?.estimatedUnitPrice || 0, [Validators.required, Validators.min(0)]],

      discount: [data?.discount || 0, Validators.min(0)],
      tax: [data?.tax || 0, Validators.min(0)]
    });
  }


  loadPrqDetails(id: number) {
    this.loaderSvc.show();
    this.purchaseService.getPrqById(id,
      (res: any) => {
        const data = res.data;
        this.prqForm.patchValue({
          vendorId: data.vendorId || this.selectedVendor?.id,
          warehouseId: data.warehouseId,
          notes: data.notes,
          flatDiscount: data.flatDiscount || 0,
          flatTax: data.flatTax || 0
        });

        const itemControl = this.itemsFormArray;
        itemControl.clear();

        if (data.items) {
          data.items.forEach((item: any) => {
            itemControl.push(this.createItemGroup({
              itemId: item.itemId,
              itemName: item.itemName,
              orderedQty: item.orderedQty,
              unitPrice: item.estimatedUnitPrice || 0,
              discount: item.discount || 0,
              tax: item.tax || 0,
              requestedQty: item.requestedQty
            }));
          });
        }
        this.loaderSvc.hide();
      },
      () => this.loaderSvc.hide()
    );
  }

  // ... [Keep item search logic] ...
  setupItemSearch() {
    this.itemSearchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || query.trim() === '') return of([]);
        const filter = new ItemSearchFilter();
        filter.searchQuery = query;
        filter.active = true;
        return new Promise(resolve => {
          this.itemService.searchItems(filter,
            (res: any) => resolve(res.data || []),
            () => resolve([])
          );
        });
      })
    ).subscribe((results: any) => {
      this.itemSearchResults = results;
      this.showItemResults = results.length > 0;
    });
  }

  onItemSearchInput(event: any) {
    this.itemSearchSubject.next(event.target.value);
  }

  selectItemFromSearch(item: ItemModel) {
    const itemsArray = this.itemsFormArray;
    const existingIndex = itemsArray.controls.findIndex(ctrl => ctrl.get('itemId')?.value === item.id);

    if (existingIndex > -1) {
      this.adjustQuantity(existingIndex, 1);
    } else {
      itemsArray.push(this.createItemGroup({
        itemId: item.id,
        itemName: item.name,
        unitPrice: item.purchasePrice || 0,
        orderedQty: 1
      }));
    }
    this.itemSearchQuery = "";
    this.showItemResults = false;
  }

  adjustQuantity(index: number, delta: number) {
    const control = this.itemsFormArray.at(index).get('orderedQty');
    const val = (control?.value || 0) + delta;
    if (val >= 1) control?.setValue(val);
  }

  removeItem(index: number) {
    this.itemsFormArray.removeAt(index);
  }

  fetchVendor(id: number) {
    if (!id) return;
    this.userService.getUserById(id,
      (res: any) => {
        this.selectedVendor = res.data;
        // PATCH THE FORM HERE
        if (this.prqForm) {
          this.prqForm.patchValue({ vendorId: this.selectedVendor?.id });
        }
      },
      (err: any) => { console.error(err); }
    );
  }

  // File handlers
  onFileSelected(event: any) { /* ... */ }
  removeFile(index: number) { /* ... */ }
  onSaveDraft() { this.poStatus = PoStatus.DRAFT; this.onSubmit(); }
  onCancel() { this.router.navigate(['vendor/new-orders']); }
}