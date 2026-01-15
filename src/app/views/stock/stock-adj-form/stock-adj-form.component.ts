import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';
import { DrawerService } from '../../../layouts/components/drawer/drawerService';
import { LoaderService } from '../../../layouts/components/loader/loaderService';
import { ToastService } from '../../../layouts/components/toast/toastService';
import { StockService } from '../stock.service';
import { ItemStockSearchModel, BatchDetailModel, StockFilterModel } from '../models/stock.model';
import { Router } from '@angular/router';
import { ApprovalConsoleService } from '../../approval-console/approval-console.service';
import { ApprovalConfigModel, ApprovalType } from '../../approval-console/approval-console.model';

// Matches Backend Enum exactly
enum AdjustmentReason {
  DAMAGE = 'DAMAGE',
  EXPIRED = 'EXPIRED',
  LOST = 'LOST',
  FOUND_EXTRA = 'FOUND_EXTRA',
  AUDIT_CORRECTION = 'AUDIT_CORRECTION'
}

@Component({
  selector: 'app-stock-adj-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './stock-adj-form.component.html',
  styleUrl: './stock-adj-form.component.css' // Ensure this file exists or remove property
})
export class StockAdjFormComponent implements OnInit, OnDestroy {

  stockAdjustmentForm: FormGroup;
  stockFilter: StockFilterModel = new StockFilterModel();

  // Data Sources
  reasons = Object.values(AdjustmentReason);
  warehouses: any[] = [];

  // Search State
  searchResults: ItemStockSearchModel[] = [];
  isSearching = false;
  activeSearchRowIndex: number = -1;
  private searchSubject = new Subject<string>();
  private searchSubscription!: Subscription;

  approvalConfigDetails: ApprovalConfigModel | null = null;
  selectedItemBatches: Map<number, BatchDetailModel[]> = new Map();

  constructor(
    private fb: FormBuilder,
    private stockService: StockService,
    private approvalConsoleService: ApprovalConsoleService,
    public drawerService: DrawerService,
    private toastSvc: ToastService,
    private router: Router,
    private location: Location,
    private loaderSvc: LoaderService
  ) {
    this.stockAdjustmentForm = this.fb.group({
      warehouseId: [null, Validators.required],
      // 'mode' is removed. The backend derives it from reasonType.
      reasonType: [AdjustmentReason.DAMAGE, Validators.required],
      reference: [''],
      remarks: [''],
      items: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadWarehouses();
    this.getSalesOrderApprovalConfig();
    this.setupSearchListener();
    this.addItem(); // Add first row
  }

  getSalesOrderApprovalConfig() {
    this.approvalConsoleService.getApprovalConfigByApprovalType(
      ApprovalType.STOCK_ADJUSTMENT,
      (response: any) => {
        this.approvalConfigDetails = response.data;
      },
      (err: any) => {
        this.toastSvc.show("Failed to load approval config", 'error')
      }
    )
  }

  //Check if Approval is Needed
  get requiresApproval(): boolean {
    if (!this.approvalConfigDetails || !this.approvalConfigDetails.isEnabled) {
      return false;
    }
    const threshold = this.approvalConfigDetails.thresholdAmount || 0;
    // Return true if total value exceeds threshold
    return this.totalAdjustmentValue > threshold;
  }

  get totalAdjustmentValue(): number {
    return this.items.controls.reduce((acc, control) => {
      const qty = control.get('quantity')?.value || 0;
      const price = control.get('unitPrice')?.value || 0;
      return acc + (qty * price);
    }, 0);
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  // --- Search Logic ---
  setupSearchListener() {
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe((query) => {
      this.performSearch(query);
    });
  }

  onSearch(event: any, index: number) {
    const query = event.target.value;
    this.activeSearchRowIndex = index;

    if (!query || query.length < 2) {
      this.searchResults = [];
      return;
    }
    this.searchSubject.next(query);
  }

  performSearch(query: string) {
    this.isSearching = true;
    // Assuming warehouseId is needed for stock search context
    this.stockFilter.warehouseId = this.stockAdjustmentForm.get('warehouseId')?.value || 1;
    this.stockFilter.searchQuery = query;
    this.stockService.searchItems(
      this.stockFilter,
      (response: any) => {
        this.isSearching = false;
        this.searchResults = response?.data || [];
      },
      (error: any) => {
        this.isSearching = false;
        this.searchResults = [];
      }
    );
  }

  onItemSelected(item: ItemStockSearchModel, index: number) {
    const row = this.items.at(index);

    if (row) {
      // FIX: Check if batches exist and grab the buyPrice from the first one
      let defaultPrice = 0;
      if (item.batches && item.batches.length > 0) {
        defaultPrice = item.batches[0].buyPrice; 
      }
      row.patchValue({
        itemId: item.itemId,
        itemName: item.name,
        unitPrice: defaultPrice,
        batchNumber: ''
      });

      if (item.batches && item.batches.length > 0) {
        this.selectedItemBatches.set(index, item.batches);
      } else {
        this.selectedItemBatches.delete(index);
      }
    }

    this.searchResults = [];
    this.activeSearchRowIndex = -1;
  }

  onBatchChange(index: number, event: any) {
  const selectedBatchNum = event.target.value;
  const batches = this.selectedItemBatches.get(index) || [];
  const selectedBatch = batches.find(b => b.batchNumber === selectedBatchNum);

  if (selectedBatch) {
    this.items.at(index).patchValue({
      unitPrice: selectedBatch.buyPrice
    });
  }
}

  // --- Form Array Getters ---
  get items(): FormArray {
    return this.stockAdjustmentForm.get('items') as FormArray;
  }

  // --- Form Actions ---
  createItem(): FormGroup {
    return this.fb.group({
      itemId: [null, Validators.required],
      itemName: [''],
      unitPrice: [0],
      quantity: [null, [Validators.required, Validators.min(1)]],
      batchNumber: ['']
    });
  }

  addItem() {
    this.items.push(this.createItem());
  }

  removeItem(index: number) {
    if (this.items.length > 1) {
      this.items.removeAt(index);
      this.selectedItemBatches.delete(index);
      if (this.activeSearchRowIndex === index) {
        this.activeSearchRowIndex = -1;
        this.searchResults = [];
      }
    } else {
      this.toastSvc.show('At least one item is required', 'error');
    }
  }

  // --- API / Loaders ---
  loadWarehouses() {
    this.warehouses = [
      { id: 1, name: 'Main Warehouse' },
      { id: 2, name: 'Distribution Center' }
    ];
  }

  onSubmit() {
    if (this.stockAdjustmentForm.invalid) {
      this.stockAdjustmentForm.markAllAsTouched();
      this.toastSvc.show('Please fill all required fields', 'error');
      return;
    }

    this.loaderSvc.show();
    const formVal = this.stockAdjustmentForm.value;

    const payload = {
      warehouseId: formVal.warehouseId,
      reference: formVal.reference,
      remarks: formVal.remarks,
      reasonType: formVal.reasonType, // Only Reason is sent now
      items: formVal.items.map((item: any) => ({
        itemId: item.itemId,
        quantity: item.quantity,
        batchNumber: item.batchNumber
      }))
    };

    this.stockService.createStockAdjustment(
      payload,
      (response: any) => {
        this.loaderSvc.hide();
        const msg = this.requiresApproval 
          ? 'Stock Adjustment sent for Approval' 
          : 'Stock Adjustment saved successfully';
        this.toastSvc.show(msg, 'success');
        this.back();
      },
      (error: any) => {
        this.loaderSvc.hide();
        this.toastSvc.show('Failed to create Stock Adjustment', 'error');
      }
    );
  }

  getBatchesForItem(index: number): BatchDetailModel[] {
    return this.selectedItemBatches.get(index) || [];
  }

  // need to naviage back 
  back() {
    this.location.back();
  }

  formatReason(reason: string): string {
    return reason.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}