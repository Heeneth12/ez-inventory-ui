import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, switchMap, of } from 'rxjs';
import { LoaderService } from '../../../../layouts/components/loader/loaderService';
import { ToastService } from '../../../../layouts/components/toast/toastService';
import { ContactService } from '../../../contacts/contacts.service';
import { ItemService } from '../../../items/item.service';
import { ContactModel } from '../../../contacts/contacts.model';
import { ItemModel, ItemSearchFilter } from '../../../items/models/Item.model';
import { LucideAngularModule, Search, ShoppingBag, XIcon, Check, ChevronRight, Eye, Mail, SaveIcon, FileText, Settings } from "lucide-angular";
import { InvoiceHeaderComponent } from "../../../../layouts/components/invoice-header/invoice-header.component";
import { UserModel } from '../../../user-management/models/user.model';
import { PurchaseService } from '../../../purchases/purchase.service';
import { NewOrdersHeaderComponent } from "../new-orders-header/new-orders-header.component";
import { UserManagementAdapterComponent } from '../../../user-management/user-management-adapter.component';
import { UserManagementService } from '../../../user-management/userManagement.service';

@Component({
  selector: 'app-new-order-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    LucideAngularModule,
    InvoiceHeaderComponent,
    NewOrdersHeaderComponent
],
  templateUrl: './new-order-form.component.html',
  styleUrl: './new-order-form.component.css'
})
export class NewOrderFormComponent {
  // Lucide Icons
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

  poForm!: FormGroup;
  prqForm!: FormGroup;
  isEditMode = false;
  prqId: number | null = null;
  poId: number | null = null;
  poStatus: 'OPEN' | 'DRAFT' | 'ISSUED' = 'ISSUED';

  // Data State
  selectedSupplier: UserModel | null = null;
  warehouseList: any[] = [{ id: 1, name: 'Main Warehouse' }];

  // Item Search State (Matching Reference Component)
  itemSearchResults: ItemModel[] = [];
  itemSearchQuery = "";
  showItemResults = false;
  private itemSearchSubject = new Subject<string>();

  constructor(
    private fb: FormBuilder,
    private purchaseService: PurchaseService,
    private contactService: ContactService,
    private userService: UserManagementService,
    private itemService: ItemService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    public loaderSvc: LoaderService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.setupItemSearch();
    this.checkRouteParams();

  }

  private initForm() {
    this.prqForm = this.fb.group({
      supplierId: [this.selectedSupplier?.id, [Validators.required]],
      warehouseId: [1, [Validators.required]],
      expectedDeliveryDate: [new Date().toISOString().substring(0, 10), [Validators.required]],
      notes: [''],
      items: this.fb.array([], Validators.required)
    });
  }

  private checkRouteParams() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.prqId = +id;
        this.loadPrqDetails(this.prqId);
      }
    });
  }

  /**
   * ITEM SEARCH LOGIC
   * Follows the debounced pattern from your reference component
   */
  private setupItemSearch() {
    this.itemSearchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || query.trim() === '') return of([]);
        const filter = new ItemSearchFilter();
        filter.searchQuery = query;
        filter.active = true;
        filter.itemTypes = ['PRODUCT'];

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
    const query = event.target.value;
    this.itemSearchQuery = query;
    this.itemSearchSubject.next(query);
  }

  selectItemFromSearch(item: ItemModel) {
    const itemsArray = this.itemsFormArray;

    // Check if item exists in list to increment qty instead of adding new row
    const existingIndex = itemsArray.controls.findIndex(
      ctrl => ctrl.get('itemId')?.value === item.id
    );

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

  /**
   * FORM ARRAY HELPERS
   */
  get itemsFormArray(): FormArray {
    return this.prqForm.get('items') as FormArray;
  }

  createItemGroup(data?: any): FormGroup {
    return this.fb.group({
      itemId: [data ? data.itemId : null, Validators.required],
      itemName: [data ? data.itemName : ''],
      orderedQty: [data ? data.requestedQty || data.orderedQty : 1, [Validators.required, Validators.min(1)]],
      unitPrice: [data ? data.estimatedUnitPrice || data.unitPrice : 0, [Validators.required, Validators.min(0)]],
      discount: [data ? data.discount : 0, Validators.min(0)],
      tax: [data ? data.tax : 0, Validators.min(0)]
    });
  }

  removeItem(index: number) {
    this.itemsFormArray.removeAt(index);
  }

  adjustQuantity(index: number, delta: number) {
    const control = this.itemsFormArray.at(index).get('orderedQty');
    const newValue = (control?.value || 0) + delta;
    if (newValue >= 1) {
      control?.setValue(newValue);
    }
  }

  getRowTotal(index: number): number {
    const row = this.itemsFormArray.at(index);
    const qty = row.get('orderedQty')?.value || 0;
    const price = row.get('unitPrice')?.value || 0;
    const disc = row.get('discount')?.value || 0;
    const tax = row.get('tax')?.value || 0;
    return Math.max(0, (qty * price) - disc + tax);
  }

  get grandTotal(): number {
    return this.itemsFormArray.controls.reduce((acc, c) => acc + this.getRowTotal(this.itemsFormArray.controls.indexOf(c)), 0);
  }

  /**
   * SUPPLIER LOGIC
   * Integrates with <app-invoice-header>
   */
  selectSupplier(supplier: UserModel) {
    this.selectedSupplier = supplier;
    this.prqForm.patchValue({ supplierId: supplier.id });
  }

  onSupplierCleared() {
    this.selectedSupplier = null;
    this.prqForm.patchValue({ supplierId: null });
  }

  /**
   * DATA LOADING & SUBMISSION
   */
  loadPoDetails(id: number) {
    this.loaderSvc.show();
    this.purchaseService.getPoById(id,
      (res: any) => {
        const data = res.data;
        this.poForm.patchValue({
          supplierId: data.supplierId,
          warehouseId: data.warehouseId,
          expectedDeliveryDate: new Date(data.expectedDeliveryDate).toISOString().split('T')[0],
          notes: data.notes
        });

        const itemControl = this.itemsFormArray;
        itemControl.clear();
        data.items.forEach((item: any) => itemControl.push(this.createItemGroup(item)));

        this.fetchSupplier(data.supplierId);
        this.loaderSvc.hide();
      },
      () => this.loaderSvc.hide()
    );
  }

  loadPrqDetails(id: number) {
    this.loaderSvc.show();
    this.purchaseService.getPrqById(id,
      (res: any) => {
        const data = res.data;

        this.prqForm.patchValue({
          supplierId: data.vendorId,
          warehouseId: data.warehouseId,
          notes: data.notes
        });

        const itemControl = this.itemsFormArray;
        itemControl.clear();
        data.items.forEach((item: any) => itemControl.push(this.createItemGroup(item)));
        this.fetchSupplier(data.vendorId);
        this.loaderSvc.hide();
      },
      () => this.loaderSvc.hide()
    );
  }

  private fetchSupplier(id: number) {
    this.userService.getUserById(id,
      (res: any) => this.selectedSupplier = res.data,
      () => this.selectedSupplier = null
    );
  }

  onSubmit() {
    if (this.prqForm.invalid) {
      this.prqForm.markAllAsTouched();
      this.toastService.show('Please add items and fill required fields', 'warning');
      console.log(this.prqForm.value);
      return;
    }

    this.loaderSvc.show();
    const rawVal = this.prqForm.getRawValue();

    // Prepare Payload
    const payload = {
      ...rawVal,
      status: this.poStatus,
      expectedDeliveryDate: new Date(rawVal.expectedDeliveryDate).getTime()
    };

    const cb = (res: any) => {
      this.loaderSvc.hide();
      this.toastService.show(this.isEditMode ? 'Purchase Order Updated' : 'Purchase Order Created', 'success');
      this.router.navigate(['vendor/new-orders']);
    };

    const errCb = () => {
      this.loaderSvc.hide();
      this.toastService.show('Failed to save purchase order', 'error');
    };

    if (this.isEditMode && this.poId) {
      this.purchaseService.updatePo(this.poId, payload, cb, errCb);
    } else {
      this.purchaseService.createPO(payload, cb, errCb);
    }
  }

  onCancel() {
    this.router.navigate(['vendor/new-orders']);
  }

  updatePoStatus(poId: number, status: string) {
    this.purchaseService.updatePoSatus(
      poId,
      status,
      (response: any) => {
        this.toastService.show("PO status updates to" + status, 'success');
      },
      (error: any) => {
        this.toastService.show(" ", 'error')
      }
    )
  }

  onSaveDraft() {
    this.poStatus = 'DRAFT';
    this.onSubmit();
  }

  onPreview() {
    this.toastService.show('Opening preview...', 'info');
  }

  onSendMail() {
    if (!this.selectedSupplier?.email) {
      this.toastService.show('Supplier email not found', 'warning');
      return;
    }
    this.toastService.show(`Sending email to ${this.selectedSupplier.email}`, 'success');
  }
}