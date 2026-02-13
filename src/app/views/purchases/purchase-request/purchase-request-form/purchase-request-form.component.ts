import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Search, ShoppingBag, XIcon, Check, ChevronRight, SaveIcon, Eye, Mail, FileText, Settings, LucideAngularModule } from 'lucide-angular';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { LoaderService } from '../../../../layouts/components/loader/loaderService';
import { ToastService } from '../../../../layouts/components/toast/toastService';
import { ContactModel } from '../../../contacts/contacts.model';
import { ContactService } from '../../../contacts/contacts.service';
import { ItemService } from '../../../items/item.service';
import { ItemModel, ItemSearchFilter } from '../../../items/models/Item.model';
import { PurchaseService } from '../../purchase.service';
import { CommonModule } from '@angular/common';
import { InvoiceHeaderComponent } from '../../../../layouts/components/invoice-header/invoice-header.component';
import { PrqStatus } from '../../models/prq.model';
import { UserModel } from '../../../user-management/models/user.model';
import { UserManagementService } from '../../../user-management/userManagement.service';

@Component({
  selector: 'app-purchase-request-form',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    LucideAngularModule,
    InvoiceHeaderComponent],
  templateUrl: './purchase-request-form.component.html',
  styleUrl: './purchase-request-form.component.css'
})
export class PurchaseRequestFormComponent {

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

  prqForm!: FormGroup;
  isEditMode = false;
  prqId: number | null = null;
  prqStatus: 'OPEN' | 'DRAFT' | 'ISSUED' | 'PENDING' = 'PENDING';

  // Data State
  selectedVendor: UserModel | null = null;
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
      vendorId: [null, [Validators.required]],
      warehouseId: [1, [Validators.required]],
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
        estimatedUnitPrice: item.purchasePrice || 0, // Mapping to PRQ DTO
        requestedQty: 1
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
      requestedQty: [data ? data.requestedQty : 1, [Validators.required, Validators.min(1)]],
      estimatedUnitPrice: [data ? data.estimatedUnitPrice : 0, [Validators.required, Validators.min(0)]]
    });
  }

  removeItem(index: number) {
    this.itemsFormArray.removeAt(index);
  }

  adjustQuantity(index: number, delta: number) {
    const control = this.itemsFormArray.at(index).get('requestedQty');
    const newValue = (control?.value || 0) + delta;
    if (newValue >= 1) control?.setValue(newValue);
  }

  getRowTotal(index: number): number {
    const row = this.itemsFormArray.at(index);
    return (row.get('requestedQty')?.value || 0) * (row.get('estimatedUnitPrice')?.value || 0);
  }

  get grandTotal(): number {
    return this.itemsFormArray.controls.reduce((acc, _, i) => acc + this.getRowTotal(i), 0);
  }

  /**
   * VENDOR LOGIC
   * Integrates with <app-invoice-header>
   */
  selectVendor(vendor: UserModel) {
    this.selectedVendor = vendor;
    this.prqForm.patchValue({ vendorId: vendor.id });
  }

  onVendorCleared() {
    this.selectedVendor = null;
    this.prqForm.patchValue({ vendorId: null });
  }

  /**
   * DATA LOADING & SUBMISSION
   */
  loadPrqDetails(id: number) {
    this.loaderSvc.show();
    this.purchaseService.getPrqById(id, (res: any) => {
      const data = res.data;
      this.prqForm.patchValue({
        vendorId: data.vendorId,
        warehouseId: data.warehouseId,
        notes: data.notes
      });
      const itemControl = this.itemsFormArray;
      itemControl.clear();
      data.items.forEach((item: any) => itemControl.push(this.createItemGroup(item)));
      this.fetchSupplier(data.vendorId);
      this.loaderSvc.hide();
    }, () => this.loaderSvc.hide());
  }

  private fetchSupplier(id: number) {
    this.userService.getUserById(id, (res: any) => this.selectedVendor = res.data, () => { });
  }

  onSubmit() {
    if (this.prqForm.invalid) {
      this.prqForm.markAllAsTouched();
      this.toastService.show('Please fill all required fields', 'warning');
      return;
    }

    this.loaderSvc.show();
    const payload = {
      ...this.prqForm.getRawValue(),
      status: this.prqStatus,
      totalEstimatedAmount: this.grandTotal
    };

    const cb = () => {
      this.loaderSvc.hide();
      this.toastService.show(this.isEditMode ? 'PRQ Updated' : 'PRQ Created', 'success');
      this.router.navigate(['purchases/prq']); // Adjusted route
    };

    if (this.isEditMode && this.prqId) {
      this.purchaseService.updatePrq(this.prqId, payload, cb, () => this.loaderSvc.hide());
    } else {
      this.purchaseService.createPrq(payload, cb, () => this.loaderSvc.hide());
    }
  }

  onCancel() {
    this.router.navigate(['purchases/order']);
  }

  updatePoStatus(prqId: number, status: string) {
    this.purchaseService.updatePoSatus(
      prqId,
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
    this.prqStatus = 'DRAFT';
    this.onSubmit();
  }

  onPreview() {
    this.toastService.show('Opening preview...', 'info');
  }

  onSendMail() {
    if (!this.selectedVendor?.email) {
      this.toastService.show('Supplier email not found', 'warning');
      return;
    }
    this.toastService.show(`Sending email to ${this.selectedVendor.email}`, 'success');
  }

}
