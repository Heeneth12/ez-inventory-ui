import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PurchaseService } from '../../purchase.service';
import { ToastService } from '../../../../layouts/components/toast/toastService';
import { LoaderService } from '../../../../layouts/components/loader/loaderService';
import { PurchaseOrderModel } from '../../models/purchase-order.model';
import { ModalService } from '../../../../layouts/components/modal/modalService';

@Component({
  selector: 'app-goods-receipt-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './goods-receipt-form.component.html',
  styleUrls: ['./goods-receipt-form.component.css']
})
export class GoodsReceiptFormComponent implements OnInit {
  grnForm!: FormGroup;
  isSubmitting = false;

  // This holds the read-only PO data for display
  poDetails: PurchaseOrderModel | null = null;
  poId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private purchaseService: PurchaseService,
    private toastService: ToastService,
    private loaderSvc: LoaderService,
    private modalService: ModalService
  ) { }

  ngOnInit(): void {
    this.modalService.context$.subscribe(ctx => {
      if (ctx?.data?.poId) {
        const poId = ctx.data.poId;
        this.initForm();
        this.loadPoDetails(poId);
      }
    });
  }

  private initForm() {
    // Only initialize the fields required for the GRN payload
    this.grnForm = this.fb.group({
      purchaseOrderId: [null, Validators.required],
      supplierInvoiceNo: ['', [Validators.required, Validators.minLength(3)]],
      items: this.fb.array([])
    });
  }

  loadPoDetails(id: number) {
    this.loaderSvc.show();
    this.purchaseService.getPoById(id,
      (res: any) => {
        this.loaderSvc.hide();
        this.poDetails = res.data;
        if (this.poDetails) {
          this.grnForm.patchValue({ purchaseOrderId: this.poDetails.id });
        }
        const itemControl = this.grnForm.get('items') as FormArray;
        itemControl.clear();

        if (this.poDetails && this.poDetails.items) {
          this.poDetails.items.forEach((item: any) => itemControl.push(this.createItemGroup(item)));
        }
      },
      (err: any) => {
        this.loaderSvc.hide();
        this.toastService.show('Failed to load PO details', 'error');
        this.close();
      }
    );
  }

  private createItemGroup(poItem: any): FormGroup {
    return this.fb.group({
      poItemId: [poItem.id, Validators.required],
      itemId: [poItem.itemId, Validators.required],
      itemName: [poItem.itemName || poItem.name],
      itemCode: [poItem.itemCode || 'N/A'],
      uom: [poItem.uom || 'Unit'],
      orderedQty: [poItem.orderedQty],
      unitPrice: [poItem.unitPrice],
      receivedQty: [poItem.orderedQty, [Validators.required, Validators.min(0)]],
      rejectedQty: [0, [Validators.required, Validators.min(0)]],
      batchNumber: ['', Validators.required],
      expiryDate: [null, Validators.required]
    });
  }

  get itemsFormArray(): FormArray {
    return this.grnForm.get('items') as FormArray;
  }

  // Helper: Calculate Total Received Value for display
  get totalReceivedValue(): number {
    return this.itemsFormArray.controls.reduce((acc, control) => {
      const qty = control.get('receivedQty')?.value || 0;
      const price = control.get('unitPrice')?.value || 0;
      return acc + (qty * price);
    }, 0);
  }

  markAllPerfect() {
    this.itemsFormArray.controls.forEach(control => {
      control.patchValue({
        receivedQty: control.get('orderedQty')?.value,
        rejectedQty: 0
      });
    });
    this.toastService.show('Quantities reset to match Order', 'info');
  }

  close() {
    this.modalService.close();
  }

  onSubmit() {
    if (this.grnForm.invalid) {
      this.grnForm.markAllAsTouched();
      console.log(this.grnForm.value);
      this.toastService.show('Please fill in Invoice No, Batch No, and Expiry for all items.', 'warning');
      return;
    }

    this.isSubmitting = true;
    const formValue = this.grnForm.getRawValue();

    const payload = {
      purchaseOrderId: formValue.purchaseOrderId,
      supplierInvoiceNo: formValue.supplierInvoiceNo,
      items: formValue.items.map((item: any) => ({
        poItemId: item.poItemId,
        itemId: item.itemId,
        receivedQty: item.receivedQty,
        rejectedQty: item.rejectedQty,
        batchNumber: item.batchNumber,
        expiryDate: new Date(item.expiryDate).getTime()
      }))
    };
    console.log(payload);
    this.loaderSvc.show();
    this.purchaseService.createGrn(payload,
      (res: any) => {
        this.loaderSvc.hide();
        this.isSubmitting = false;
        this.close();
        this.toastService.show('Goods Receipt Created Successfully', 'success');
      },
      (err: any) => {
        this.loaderSvc.hide();
        this.isSubmitting = false;
        this.toastService.show('Failed to create GRN', 'error');
      }
    );
  }
}