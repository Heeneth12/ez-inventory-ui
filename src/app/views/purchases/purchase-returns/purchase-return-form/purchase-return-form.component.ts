import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PurchaseService } from '../../purchase.service';
import { ToastService } from '../../../../layouts/components/toast/toastService';
import { LoaderService } from '../../../../layouts/components/loader/loaderService';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ModalService } from '../../../../layouts/components/modal/modalService';
import { GrnModel } from '../../models/grn.model';

@Component({
  selector: 'app-purchase-return-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './purchase-return-form.component.html',
  styleUrls: ['./purchase-return-form.component.css']
})
export class PurchaseReturnFormComponent implements OnInit {

  returnForm!: FormGroup;
  isSubmitting = false;

  // State for the "Search GRN" feature
  grnSearchInput = '';
  searchSubject = new Subject<string>();
  grnDetails: GrnModel | null = null; // Stores the full GRN object for display
  showSearch = true; // Toggle between search mode and form mode

  constructor(
    private fb: FormBuilder,
    private purchaseService: PurchaseService,
    private toastService: ToastService,
    private loaderSvc: LoaderService,
    private modalService: ModalService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.modalService.context$.subscribe(ctx => {
      if (ctx?.data?.grnId) {
        const grnId = ctx.data.grnId;
        this.loadGrnDetails(grnId);
        this.showSearch = false;
      }
    });
    this.setupSearch();
  }

  private initForm() {
    this.returnForm = this.fb.group({
      vendorId: [null, Validators.required],
      warehouseId: [1, Validators.required],
      goodsReceiptId: [null, Validators.required],
      reason: ['', [Validators.required, Validators.minLength(5)]],
      items: this.fb.array([])
    });
  }

  private setupSearch() {
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(term => {
      // In a real app, this would call an API search
      // For now, we simulate "Load by ID" when user hits Enter or button
    });
  }

  // --- Step 1: Load GRN Data ---
  loadGrnDetails(id: number | string) {
    if (!id) return;

    this.loaderSvc.show();
    // Assuming you have a method to get GRN by ID
    this.purchaseService.getGrnDetails(+id,
      (res: any) => {
        this.loaderSvc.hide();
        this.grnDetails = res.data;
        this.populateForm(this.grnDetails);
        this.showSearch = false; // Switch to Form View
      },
      (err: any) => {
        this.loaderSvc.hide();
        this.toastService.show('GRN not found', 'error');
        this.grnDetails = null;
      }
    );
  }

  // --- Step 2: Populate Form ---
  populateForm(grn: any) {
    this.returnForm.patchValue({
      vendorId: grn.vendorId,
      goodsReceiptId: grn.id,
      reason: ''
    });

    const itemsArray = this.returnForm.get('items') as FormArray;
    itemsArray.clear();

    if (grn.items) {
      grn.items.forEach((item: any) => {
        itemsArray.push(this.createItemControl(item));
      });
    }
  }

  createItemControl(item: any): FormGroup {
    return this.fb.group({
      itemId: [item.itemId],
      itemName: [item.itemName], // Display only
      itemCode: [item.itemCode], // Display only
      batchNumber: [item.batchNumber], // Required in payload
      // Validation: Cannot return more than received
      receivedQty: [item.receivedQty], // Display/Validation reference
      returnedQty: [item.returnedQty || 0], // Already returned quantity from previous returns
      unitPrice: [item.poItemPrice || 0], // Reference for refund price
      // Inputs
      returnQty: [0],
      refundPrice: [item.poItemPrice || 0]
    });
  }

  get itemsFormArray(): FormArray {
    return this.returnForm.get('items') as FormArray;
  }

  // --- Helpers ---
  resetSearch() {
    this.showSearch = true;
    this.grnDetails = null;
    this.returnForm.reset();
    (this.returnForm.get('items') as FormArray).clear();
  }

  calculateTotalRefund(): number {
    return this.itemsFormArray.controls.reduce((acc, ctrl) => {
      const qty = ctrl.get('returnQty')?.value || 0;
      const price = ctrl.get('refundPrice')?.value || 0;
      return acc + (qty * price);
    }, 0);
  }

  close() {
    this.modalService.close();
  }

  // --- Submit Logic ---
  onSubmit() {
    // if (this.returnForm.invalid) {
    //   console.log(this.returnForm.value);
    //   this.returnForm.markAllAsTouched();
    //   this.toastService.show('Please fix errors before submitting.', 'warning');
    //   return;
    // }

    // Filter out items with 0 return quantity (Optional, but good practice)
    const rawItems = this.returnForm.value.items;
    const itemsToReturn = rawItems.filter((i: any) => i.returnQty > 0);

    if (itemsToReturn.length === 0) {
      this.toastService.show('Please enter a return quantity for at least one item.', 'warning');
      return;
    }

    const payload = {
      vendorId: this.returnForm.value.vendorId,
      warehouseId: this.returnForm.value.warehouseId,
      goodsReceiptId: this.returnForm.value.goodsReceiptId,
      reason: this.returnForm.value.reason,
      items: itemsToReturn.map((item: any) => ({
        itemId: item.itemId,
        returnQty: item.returnQty,
        refundPrice: item.refundPrice,
        batchNumber: item.batchNumber
      }))
    };

    console.log('Purchase Return Payload:', payload);

    this.isSubmitting = true;
    this.loaderSvc.show();

    this.purchaseService.createPurchaseReturn(payload,
      (res: any) => {
        this.loaderSvc.hide();
        this.isSubmitting = false;
        this.toastService.show('Purchase Return Created Successfully', 'success');
        this.close();
      },
      (err: any) => {
        this.loaderSvc.hide();
        this.isSubmitting = false;
        this.toastService.show('Failed to create return', 'error');
      }
    );
  }
}