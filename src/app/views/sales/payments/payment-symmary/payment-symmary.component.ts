import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { LoaderService } from '../../../../layouts/components/loader/loaderService';
import { ToastService } from '../../../../layouts/components/toast/toastService';
import { InvoicePaymentSummaryModal } from '../payment.modal';
import { PaymentService } from '../payment.service';
import { ModalService } from '../../../../layouts/components/modal/modalService';


@Component({
  selector: 'app-payment-symmary',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment-symmary.component.html',
  styleUrl: './payment-symmary.component.css'
})
export class PaymentSymmaryComponent {

  @Input() invoiceId!: number;
  @Output() close = new EventEmitter<void>(); // To close modal
  @Output() paymentSuccess = new EventEmitter<void>(); // To refresh parent list

  paymentSummary: InvoicePaymentSummaryModal | null = null;
  paymentForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private toastSvc: ToastService,
    private loaderSvc: LoaderService,
    private modalService: ModalService
  ) {
    this.paymentForm = this.fb.group({
      amount: [null, [Validators.required, Validators.min(1)]],
      paymentMethod: ['CASH', Validators.required],
      referenceNumber: [''],
      remarks: ['']
    });
  }

  ngOnInit(): void {
    if (this.invoiceId) {
      this.loadPaymentSummary();
    }
  }

  loadPaymentSummary() {
    this.paymentService.getPaymentSummaryByInvoiceId(this.invoiceId,
      (res: any) => {
        this.paymentSummary = res.data;

        // Auto-fill amount with balance due (User can edit)
        if (this.paymentSummary && this.paymentSummary.balanceDue > 0) {
          this.paymentForm.patchValue({ amount: this.paymentSummary.balanceDue });

          // Add dynamic validator for Max Balance
          this.paymentForm.get('amount')?.setValidators([
            Validators.required,
            Validators.min(1),
            Validators.max(this.paymentSummary.balanceDue)
          ]);
          this.paymentForm.get('amount')?.updateValueAndValidity();
        }
      },
      (err: any) => {
        this.toastSvc.show('Failed to load payments', 'error')
      }
    );
  }

  submitPayment() {
    if (this.paymentForm.invalid) return;

    this.isSubmitting = true;
    const formVal = this.paymentForm.value;

    const payload = {
      invoiceId: this.invoiceId, // Or 'allocations': [{invoiceId: ..., amount: ...}] based on your Bulk API
      amount: formVal.amount,    // If using simple API
      paymentMethod: formVal.paymentMethod,
      referenceNumber: formVal.referenceNumber,
      remarks: formVal.remarks,
      // If using the Bulk Allocation API we built earlier:
      customerId: this.paymentSummary?.customerId, // You might need to fetch this or add to Summary DTO
      totalAmount: formVal.amount,
      allocations: [
        { invoiceId: this.invoiceId, amountToPay: formVal.amount }
      ]
    };

    this.paymentService.recordPayment(payload,
      (response: any) => {
        this.toastSvc.show('Payment Recorded Successfully', 'success');
        this.isSubmitting = false;
        this.paymentForm.reset({ paymentMethod: 'CASH' });
        this.loadPaymentSummary();
        this.paymentSuccess.emit();
        this.downloadInvoicePdf(response.data.id);
      },
      (err: any) => {
        this.isSubmitting = false;
        this.toastSvc.show(err.error?.message || 'Payment Failed', 'error');
      }
    )
  }

  downloadInvoicePdf(paymentId: any) {
    this.loaderSvc.show();
    this.paymentService.downloadPaymentPdf(paymentId,
      (response: any) => {
        this.loaderSvc.hide();
        const blob = new Blob([response.body], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(
          url,
          'paymentPopup',
          'width=900,height=800,top=50,left=100,toolbar=no,menubar=no,scrollbars=yes,resizable=yes'
        );
      },
      (error: any) => {
        this.loaderSvc.hide();
        this.toastSvc.show('Failed to download PDF', 'error');
        console.error('Error downloading PDF:', error);
      }
    );
  }

  closeModal() {
    this.close.emit();
  }

}
