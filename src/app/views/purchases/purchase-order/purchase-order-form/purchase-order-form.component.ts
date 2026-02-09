import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, switchMap, of } from 'rxjs';
import { LoaderService } from '../../../../layouts/components/loader/loaderService';
import { ToastService } from '../../../../layouts/components/toast/toastService';
import { PurchaseService } from '../../purchase.service';
import { ContactService } from '../../../contacts/contacts.service';
import { ItemService } from '../../../items/item.service';
import { ContactModel } from '../../../contacts/contacts.model';
import { ItemModel, ItemSearchFilter } from '../../../items/models/Item.model';
import { LucideAngularModule, Search, ShoppingBag, XIcon, Check, ChevronRight, Eye, Mail, SaveIcon, FileText, Settings } from "lucide-angular";
import { InvoiceHeaderComponent } from "../../../../layouts/components/invoice-header/invoice-header.component";
import { UserModel } from '../../../user-management/models/user.model';

@Component({
  selector: 'app-purchase-order-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    LucideAngularModule,
    InvoiceHeaderComponent
  ],
  templateUrl: './purchase-order-form.component.html',
  styleUrls: ['./purchase-order-form.component.css']
})
export class PurchaseOrderFormComponent implements OnInit {

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
  isEditMode = false;
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
    this.poForm = this.fb.group({
      supplierId: [null, [Validators.required]],
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
        this.poId = +id;
        this.loadPoDetails(this.poId);
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
    return this.poForm.get('items') as FormArray;
  }

  createItemGroup(data?: any): FormGroup {
    return this.fb.group({
      itemId: [data ? data.itemId : null, Validators.required],
      itemName: [data ? data.itemName : ''],
      orderedQty: [data ? data.orderedQty : 1, [Validators.required, Validators.min(1)]],
      unitPrice: [data ? data.unitPrice : 0, [Validators.required, Validators.min(0)]]
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
    return (row.get('orderedQty')?.value || 0) * (row.get('unitPrice')?.value || 0);
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
    this.poForm.patchValue({ supplierId: supplier.id });
  }

  onSupplierCleared() {
    this.selectedSupplier = null;
    this.poForm.patchValue({ supplierId: null });
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

  private fetchSupplier(id: number) {
    this.contactService.getContactById(id,
      (res: any) => this.selectedSupplier = res.data,
      () => this.selectedSupplier = null
    );
  }

  onSubmit() {
    if (this.poForm.invalid) {
      this.poForm.markAllAsTouched();
      this.toastService.show('Please add items and fill required fields', 'warning');
      return;
    }

    this.loaderSvc.show();
    const rawVal = this.poForm.getRawValue();

    // Prepare Payload
    const payload = {
      ...rawVal,
      status: this.poStatus,
      expectedDeliveryDate: new Date(rawVal.expectedDeliveryDate).getTime()
    };

    const cb = (res: any) => {
      this.loaderSvc.hide();
      this.toastService.show(this.isEditMode ? 'Purchase Order Updated' : 'Purchase Order Created', 'success');
      this.router.navigate(['purchases/order']);
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
    this.router.navigate(['purchases/order']);
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