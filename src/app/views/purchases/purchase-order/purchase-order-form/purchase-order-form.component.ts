import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { LoaderService } from '../../../../layouts/components/loader/loaderService';
import { ToastService } from '../../../../layouts/components/toast/toastService';
import { PurchaseService } from '../../purchase.service';
import { ContactService } from '../../../contacts/contacts.service';
import { ItemService } from '../../../items/item.service';
import { ContactModel } from '../../../contacts/contacts.model';
import { ItemModel, ItemSearchFilter } from '../../../items/models/Item.model';

@Component({
  selector: 'app-purchase-order-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './purchase-order-form.component.html',
  styleUrls: ['./purchase-order-form.component.css']
})
export class PurchaseOrderFormComponent implements OnInit {

  poForm!: FormGroup;
  isEditMode = false;
  poId: number | null = null;

  // Data State
  selectedSupplier: ContactModel | null = null;
  warehouseList: any[] = [];

  // --- Typeahead State ---
  supplierSearchResults: ContactModel[] = [];
  showSupplierDropdown = false;
  supplierSearchInput = '';

  itemSearchResults: ItemModel[] = [];
  activeItemSearchIndex: number | null = null;

  // Search Subjects (to handle debouncing)
  private supplierSearchSubject = new Subject<string>();
  private itemSearchSubject = new Subject<{ query: string, index: number }>();

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
    this.setupSearchListeners();
  }

  ngOnInit(): void {
    this.loadMasterData();
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.poId = +id;
        this.loadPoDetails(this.poId);
      }
    });
  }

  private initForm() {
    this.poForm = this.fb.group({
      supplierId: [null, [Validators.required]],
      warehouseId: [1, [Validators.required]],
      expectedDeliveryDate: [new Date().toISOString().substring(0, 10), [Validators.required]],
      notes: [''],
      items: this.fb.array([])
    });

    if (!this.isEditMode) this.addItem();
  }

  private setupSearchListeners() {
    this.supplierSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.executeSupplierSearch(query);
    });
    this.itemSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged((prev, curr) => prev.query === curr.query)
    ).subscribe(data => {
      this.executeItemSearch(data.query);
    });
  }

  // --- Supplier Typeahead Logic ---
  onSupplierSearch(event: any) {
    this.supplierSearchInput = event.target.value;
    this.showSupplierDropdown = true;
    this.supplierSearchSubject.next(this.supplierSearchInput);
  }

  selectSupplier(supplier: ContactModel) {
    this.selectedSupplier = supplier;
    this.poForm.patchValue({ supplierId: supplier.id });
    this.supplierSearchInput = supplier.name; // Set input text to name
    this.showSupplierDropdown = false;
  }

  executeSupplierSearch(query: string) {
    // Call your service
    this.contactService.getContacts(0, 20, {}, (res: any) => {
      // Filter locally or assume API returns filtered data
      const all: ContactModel[] = res.data.content || res.data;
      this.supplierSearchResults = all.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));
    }, () => { });
  }

  getSupplierById(id: number) {
    this.contactService.getContactById(id,
      (res: any) => {
        this.selectedSupplier = res.data;
      },
      (err: any) => {
        this.selectedSupplier = null;
      }
    );
  }

  // --- Item Typeahead Logic ---
  onItemSearch(event: any, index: number) {
    this.activeItemSearchIndex = index;
    const query = event.target.value;
    this.itemSearchSubject.next({ query, index });
  }

  selectItem(item: ItemModel, index: number) {
    const row = this.itemsFormArray.at(index);
    row.patchValue({
      itemId: item.id,
      unitPrice: item.purchasePrice,
      itemName: item.name
    });
    this.activeItemSearchIndex = null;
  }

  // Helper to get item name for input value display
  getItemName(index: number): string {
    const row = this.itemsFormArray.at(index);
    const itemId = row.get('itemId')?.value;
    if (!itemId) return '';

    // Check current search results
    const found = this.itemSearchResults.find(i => i.id === itemId);
    if (found) return found.name;

    return row.get('itemName')?.value || '';
  }

  executeItemSearch(query: string) {
    const filter = new ItemSearchFilter();
    filter.searchQuery = query;
    filter.itemType = 'PRODUCT';
    filter.active = true;

    this.itemService.searchItems(filter,
      (res: any) => this.itemSearchResults = res.data || [],
      (err: any) => this.itemSearchResults = []
    );
  }

  // --- Standard Form Logic ---
  loadMasterData() {
    this.warehouseList = [{ id: 1, name: 'Main Warehouse' }];
  }

  loadPoDetails(id: number) {
    this.loaderSvc.show();
    this.purchaseService.getPoById(id,
      (res: any) => {
        this.loaderSvc.hide();
        const data = res.data;
        this.poForm.patchValue({
          supplierId: data.supplierId,
          warehouseId: data.warehouseId,
          expectedDeliveryDate: new Date(data.expectedDeliveryDate).toISOString().split('T')[0],
          notes: data.notes
        });
        const itemControl = this.poForm.get('items') as FormArray;
        itemControl.clear();
        data.items.forEach((item: any) => itemControl.push(this.createItemGroup(item)));
        this.getSupplierById(data.supplierId);
        if (this.selectedSupplier) {
          this.selectSupplier(this.selectedSupplier);
        }
      },
      (err: any) => this.loaderSvc.hide()
    );
  }

  createItemGroup(data?: any): FormGroup {
    return this.fb.group({
      itemId: [data ? data.itemId : null, Validators.required],
      itemName: [data ? data.itemName : ''],
      orderedQty: [data ? data.orderedQty : 1, [Validators.required, Validators.min(1)]],
      unitPrice: [data ? data.unitPrice : 0, [Validators.required, Validators.min(0)]]
    });
  }

  get itemsFormArray(): FormArray { return this.poForm.get('items') as FormArray; }
  addItem() { this.itemsFormArray.push(this.createItemGroup()); }
  removeItem(i: number) { this.itemsFormArray.removeAt(i); }

  get grandTotal(): number {
    return this.itemsFormArray.controls.reduce((acc, c) => {
      return acc + ((c.get('orderedQty')?.value || 0) * (c.get('unitPrice')?.value || 0));
    }, 0);
  }

  onSubmit() {
    if (this.poForm.invalid) {
      this.poForm.markAllAsTouched();
      this.toastService.show('Please fill in all required fields', 'warning');
      return;
    }
    this.poForm.get('expectedDeliveryDate')?.setValue(new Date(this.poForm.get('expectedDeliveryDate')?.value).getTime());
    const payload = this.poForm.value;
    console.log(payload);
    this.loaderSvc.show();
    const cb = (res: any) => {
      this.loaderSvc.hide();
      this.toastService.show(this.isEditMode ? 'Updated PO Successfully' : 'Created PO Successfully', 'success');
      this.router.navigate(['purchases/order']);
    };
    const errCb = (err: any) => {
      this.loaderSvc.hide();
      this.toastService.show('Error occurred', 'error');
    };

    if (this.isEditMode && this.poId) this.purchaseService.updatePo(this.poId, payload, cb, errCb);
    else this.purchaseService.createPO(payload, cb, errCb);
  }
}