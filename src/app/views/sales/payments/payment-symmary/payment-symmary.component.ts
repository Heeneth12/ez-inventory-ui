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
  @Input() customerId!: number;
  @Output() close = new EventEmitter<void>(); // To close modal
  @Output() paymentSuccess = new EventEmitter<void>(); // To refresh parent list

  paymentSummary: InvoicePaymentSummaryModal | null = null;
  paymentForm: FormGroup;
  isSubmitting = false;
  customerSummary: any = { walletBalance: 0 };

  walletForm: FormGroup;
  useWallet = false;
  showWalletForm = false;

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

    // Add Money to Wallet Form
    this.walletForm = this.fb.group({
      amount: [null, [Validators.required, Validators.min(1)]],
      paymentMethod: ['CASH', Validators.required],
      referenceNumber: [''],
      remarks: ['Advance Payment']
    });
  }

  ngOnInit(): void {
    this.refreshAllData();
  }

  refreshAllData() {
    if (this.invoiceId) this.loadPaymentSummary();
    if (this.customerId) this.loadCustomerWallet();
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

  loadCustomerWallet() {
    this.paymentService.getCustomerSummary(this.customerId,
      (res: any) => {
        this.customerSummary = res.data;
      },
      (err: any) => console.error('Failed to load wallet', err)
    );
  }

  // New Method: Apply Wallet to this Invoice
  payWithWallet() {
    if (this.customerSummary.walletBalance <= 0) return;

    const amountToApply = Math.min(this.customerSummary.walletBalance, this.paymentSummary?.balanceDue || 0);
    this.loaderSvc.show();
    // We need a list of payments with unallocated funds to apply them
    // For simplicity, your backend applyWalletToInvoice usually handles the logic
    const payload = {
      customerId: this.customerId,
      invoiceId: this.invoiceId,
      amount: amountToApply
    };

    this.paymentService.applyWalletToInvoice(payload,
      (res: any) => {
        this.toastSvc.show('Wallet Balance Applied Successfully', 'success');
        this.loadPaymentSummary();
        this.loadCustomerWallet();
        this.paymentSuccess.emit();
        this.loaderSvc.hide();
      },
      (err: any) => {
        this.loaderSvc.hide();
        this.toastSvc.show('Failed to apply wallet', 'error');
      }
    );
  }

  /**
   * ACTION 3: Add new money to the Wallet (Advance)
   */
  submitWalletAdd() {
    if (this.walletForm.invalid) return;
    this.isSubmitting = true;
    const val = this.walletForm.value;

    this.paymentService.addMoneyToWallet({
      customerId: this.customerId,
      amount: val.amount,
      paymentMethod: val.paymentMethod,
      referenceNumber: val.referenceNumber,
      remarks: val.remarks
    },
      (response: any) => {
        this.toastSvc.show('Money added to wallet', 'success');
        this.isSubmitting = false;
        this.loaderSvc.hide();
        this.refreshAllData();
        this.paymentSuccess.emit();
        this.showWalletForm = false;
      },
      (error: any) => {

        this.isSubmitting = false;
        this.loaderSvc.hide();
        this.toastSvc.show(error?.message || 'Transaction Failed', 'error');

      }
    )
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
