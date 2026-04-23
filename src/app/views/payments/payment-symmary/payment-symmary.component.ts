import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output, signal } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { LoaderService } from '../../../layouts/components/loader/loaderService';
import { ModalService } from '../../../layouts/components/modal/modalService';
import { ToastService } from '../../../layouts/components/toast/toastService';
import { AdvanceModal, InvoicePaymentSummaryModal, RazorpayTransactionModal, RazorpayOrderResponse, RazorpaySuccessResponse } from '../payment.modal';
import { PaymentService } from '../payment.service';
import { IntegrationsService } from '../../../layouts/components/integrations/integrations.service';
import { IntegrationType } from '../../../layouts/components/integrations/integrations.model';


export type PaymentMethodKey = 'CASH' | 'BANK_TRANSFER' | 'UPI' | 'CHEQUE' | 'RAZORPAY' | 'PAYMENT_LINK' | 'QR';

declare global {
  interface Window { Razorpay: any; }
}

@Component({
  selector: 'app-payment-symmary',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './payment-symmary.component.html',
  styleUrl: './payment-symmary.component.css'
})
export class PaymentSymmaryComponent implements OnInit, OnDestroy {

  @Input() invoiceId!: number;
  @Input() customerId!: number;
  @Output() close = new EventEmitter<void>();
  @Output() paymentSuccess = new EventEmitter<void>();

  // Tab state
  activeTab: 'payment' | 'history' | 'razorpay' = 'payment';

  // Data
  paymentSummary: InvoicePaymentSummaryModal | null = null;
  customerSummary: any = { advanceBalance: 0, creditNoteBalance: 0, totalOutstandingAmount: 0 };
  customerAdvances: AdvanceModal[] = [];
  razorpayTransactions: RazorpayTransactionModal[] = [];
  isLoadingTransactions = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  isRazorpayConfigured = signal<boolean>(false); // help weather tenent have razorpay account
  isRazorpayLoading = signal<boolean>(false);

  // Payment Link state (signals — updated inside NgZone for CD)
  isGeneratingLink = signal(false);
  linkGenerated = signal(false);
  generatedPaymentLink = signal('');
  generatedPaymentLinkId = signal('');
  emailToShare = '';          // plain — bound via ngModel, no signal needed
  isSendingEmail = signal(false);
  emailSent = signal(false);
  isPollingLink = signal(false);
  linkPaymentStatus = signal<'PENDING' | 'PAID'>('PENDING');
  private _linkPollTimer: any = null;

  // QR Code state (signals)
  isGeneratingQr = signal(false);
  qrGenerated = signal(false);
  qrImageUrl = signal('');
  qrOrderId = signal('');
  isPollingQr = signal(false);
  qrPaymentStatus = signal<'PENDING' | 'PAID'>('PENDING');
  private _qrPollTimer: any = null;

  // Forms 
  paymentForm!: FormGroup;
  walletForm!: FormGroup;
  // FIX: showWalletForm should only ever be true when there is NO invoiceId
  showWalletForm = false;

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService,
    public toastSvc: ToastService,
    private loaderSvc: LoaderService,
    private modalService: ModalService,
    private integrationsService: IntegrationsService,
    private ngZone: NgZone
  ) { }

  ngOnInit(): void {
    this.paymentForm = this.fb.group({
      amount: [null, [Validators.required, Validators.min(1)]],
      paymentMethod: ['CASH', Validators.required],
      referenceNumber: [''],
      remarks: ['']
    });

    this.walletForm = this.fb.group({
      amount: [null, [Validators.required, Validators.min(1)]],
      paymentMethod: ['CASH', Validators.required],
      referenceNumber: [''],
      remarks: ['Advance Payment']
    });

    if (!this.invoiceId && this.customerId) {
      this.showWalletForm = true;
    }

    this.loadRazorpayConfigStatus();
    this.refreshAllData();
  }


  refreshAllData(): void {
    if (this.customerId) {
      this.loadCustomerSummary();
      this.loadCustomerAdvances();
    }
    if (this.invoiceId) {
      this.loadPaymentSummary();
    } else {
      this.paymentSummary = null;
    }
  }

  loadPaymentSummary(): void {
    this.paymentService.getPaymentSummaryByInvoiceId(
      this.invoiceId,
      (res: any) => {
        this.paymentSummary = res.data;
        if (this.paymentSummary && this.paymentSummary.balanceDue > 0) {
          this.paymentForm.patchValue({ amount: this.paymentSummary.balanceDue });
          this.paymentForm.get('amount')?.setValidators([
            Validators.required, Validators.min(1),
            Validators.max(this.paymentSummary.balanceDue)
          ]);
          this.paymentForm.get('amount')?.updateValueAndValidity();
        }
      },
      () => this.toastSvc.show('Failed to load payment summary', 'error')
    );
  }

  loadCustomerSummary(): void {
    this.paymentService.getCustomerSummary(
      this.customerId,
      (res: any) => { this.customerSummary = res.data; },
      (err: any) => console.error('Failed to load customer summary', err)
    );
  }

  loadCustomerAdvances(): void {
    this.paymentService.getAdvancesByCustomer(
      this.customerId,
      (res: any) => { this.customerAdvances = res.data ?? []; },
      () => { }
    );
  }

  loadRazorpayConfigStatus(): void {
    this.integrationsService.checkIntegration(IntegrationType.RAZORPAY,
      (res: any) => {
        if (res.data.status === 'SUCCESS') {
          this.isRazorpayConfigured.set(true);
        } else {
          this.isRazorpayConfigured.set(false);
        }
      },
      (err: any) => {
        this.isRazorpayConfigured.set(false);
      }
    )
  }

  loadRazorpayTransactions(): void {
    if (!this.invoiceId) return;
    this.isLoadingTransactions.set(true);
    this.paymentService.getRazorpayTransactions(
      this.invoiceId,
      (res: any) => {
        this.isLoadingTransactions.set(false);
        this.razorpayTransactions = res?.data?.content ?? [];
      },
      () => {
        this.isLoadingTransactions.set(false);
        this.toastSvc.show('Failed to load Razorpay transactions', 'error');
      }
    );
  }

  switchTab(tab: 'payment' | 'history' | 'razorpay'): void {
    this.activeTab = tab;
    if (tab === 'razorpay') this.loadRazorpayTransactions();
  }

  amountFromPaise(paise: number): number {
    return paise / 100;
  }

  txnStatusConfig(status: string): { label: string; classes: string } {
    switch (status) {
      case 'PAID': return { label: 'Paid', classes: 'bg-green-100 text-green-700' };
      case 'FAILED': return { label: 'Failed', classes: 'bg-red-100 text-red-700' };
      case 'EXPIRED': return { label: 'Expired', classes: 'bg-gray-100 text-gray-500' };
      default: return { label: 'Pending', classes: 'bg-amber-100 text-amber-700' };
    }
  }

  txnMethodLabel(method: string): string {
    switch (method) {
      case 'PAYMENT_LINK': return '🔗 Pay Link';
      case 'QR': return '📲 QR Code';
      case 'CHECKOUT': return '⚡ Checkout';
      default: return method;
    }
  }

  // Computed helpers 
  get paidPercent(): number {
    if (!this.paymentSummary?.grandTotal || this.paymentSummary.grandTotal === 0) return 0;
    return Math.min(100, Math.round((this.paymentSummary.totalPaid / this.paymentSummary.grandTotal) * 100));
  }

  get statusConfig(): { label: string; classes: string } {
    switch (this.paymentSummary?.status) {
      case 'PAID': return { label: 'Paid', classes: 'bg-green-100 text-green-700' };
      case 'PARTIALLY_PAID': return { label: 'Partial', classes: 'bg-amber-100 text-amber-700' };
      default: return { label: 'Pending', classes: 'bg-red-100 text-red-700' };
    }
  }

  get selectedPaymentMethod(): string {
    return this.paymentForm.get('paymentMethod')?.value || '';
  }

  // FIX: All method-check getters now read from selectedPaymentMethod consistently
  get isRazorpaySelected(): boolean {
    return this.selectedPaymentMethod === 'RAZORPAY';
  }

  get isPaymentLinkSelected(): boolean {
    return this.selectedPaymentMethod === 'PAYMENT_LINK';
  }

  get isQrCodeSelected(): boolean {
    return this.selectedPaymentMethod === 'QR';
  }

  get isWalletRazorpaySelected(): boolean {
    return this.walletForm.get('paymentMethod')?.value === 'RAZORPAY';
  }

  get basePaymentMethods() {
    return [
      { k: 'CASH', icon: '💵', label: 'Cash' },
      { k: 'BANK_TRANSFER', icon: '🏦', label: 'Bank Transfer' },
      { k: 'UPI', icon: '📱', label: 'UPI / GPay' },
      { k: 'CHEQUE', icon: '📄', label: 'Cheque' }
    ];
  }

  get walletPaymentMethods() {
    const methods = [...this.basePaymentMethods];
    if (this.isRazorpayConfigured()) {
      methods.push({ k: 'RAZORPAY', icon: '⚡', label: 'Razorpay' });
    }
    return methods;
  }

  get invoicePaymentMethods() {
    const methods = [...this.basePaymentMethods];
    if (this.isRazorpayConfigured()) {
      methods.push({ k: 'RAZORPAY', icon: '⚡', label: 'Razorpay' });
      methods.push({ k: 'PAYMENT_LINK', icon: '🔗', label: 'Payment Link' });
      methods.push({ k: 'QR', icon: '📲', label: 'QR Code' });
    }
    return methods;
  }

  // Payment method selectors 
  setPaymentMethod(method: string): void {
    this.paymentForm.patchValue({ paymentMethod: method });

    // Reset ALL link/QR state whenever method changes
    this.linkGenerated.set(false);
    this.generatedPaymentLink.set('');
    this.generatedPaymentLinkId.set('');
    this.emailSent.set(false);
    this.emailToShare = '';
    this.linkPaymentStatus.set('PENDING');
    this.stopLinkPolling();

    this.qrGenerated.set(false);
    this.qrImageUrl.set('');
    this.qrOrderId.set('');
    this.qrPaymentStatus.set('PENDING');
    this.stopQrPolling();
  }

  setWalletPaymentMethod(method: string): void {
    this.walletForm.patchValue({ paymentMethod: method });
  }

  // Advance

  payWithWallet(): void {
    const advanceBalance = this.customerSummary?.advanceBalance || 0;
    if (advanceBalance <= 0) return;

    // Find the first ACTIVE advance with available balance to draw from
    const advance = this.customerAdvances.find(
      a => a.status === 'ACTIVE' && a.availableBalance > 0
    );
    if (!advance) {
      this.toastSvc.show('No active advance found to apply', 'warning');
      return;
    }

    const amountToApply = Math.min(advance.availableBalance, this.paymentSummary?.balanceDue || 0);
    this.loaderSvc.show();
    this.paymentService.utilizeAdvance(
      { advanceId: advance.id, invoiceId: this.invoiceId, amount: amountToApply },
      (res: any) => {
        this.loaderSvc.hide();
        this.toastSvc.show('Advance applied to invoice', 'success');
        this.refreshAllData();
        this.paymentSuccess.emit();
      },
      (err: any) => {
        this.loaderSvc.hide();
        this.toastSvc.show(err?.error?.message || 'Failed to apply advance', 'error');
      }
    );
  }

  submitWalletAdd(): void {
    if (this.walletForm.invalid) return;
    if (this.walletForm.get('paymentMethod')?.value === 'RAZORPAY') {
      this._openRazorpayCheckout(this.walletForm.get('amount')?.value, null);
      return;
    }
    this.isSubmitting.set(true);
    const val = this.walletForm.value;
    this.paymentService.createAdvance(
      {
        customerId: this.customerId,
        amount: val.amount,
        paymentMethod: val.paymentMethod,
        referenceNumber: val.referenceNumber,
        remarks: val.remarks
      },
      (res: any) => {
        this.isSubmitting.set(false);
        this.toastSvc.show('Advance collected successfully', 'success');
        this.refreshAllData();
        this.paymentSuccess.emit();
        this.showWalletForm = false;
        this.walletForm.reset({ paymentMethod: 'CASH', remarks: 'Advance Payment' });
      },
      (err: any) => {
        this.isSubmitting.set(false);
        this.toastSvc.show(err?.error?.message || 'Transaction failed', 'error');
      }
    );
  }

  /**
   * Invoice Payment
   * 
   * @returns 
   */
  submitPayment(): void {
    if (this.paymentForm.invalid) return;
    const method = this.selectedPaymentMethod;

    if (method === 'RAZORPAY') {
      this._openRazorpayCheckout(this.paymentForm.get('amount')?.value, this.invoiceId);
      return;
    }
    if (method === 'PAYMENT_LINK') {
      this.generatePaymentLink();
      return;
    }
    if (method === 'QR') {
      this.generateQRCode();
      return;
    }

    this.isSubmitting.set(true);
    const formVal = this.paymentForm.value;
    this.paymentService.recordPayment(
      {
        invoiceId: this.invoiceId,
        amount: formVal.amount,
        paymentMethod: formVal.paymentMethod,
        referenceNumber: formVal.referenceNumber,
        remarks: formVal.remarks,
        customerId: this.paymentSummary?.customerId,
        totalAmount: formVal.amount,
        allocations: [{ invoiceId: this.invoiceId, amountToPay: formVal.amount }]
      },
      (response: any) => {
        this.isSubmitting.set(false);
        this.toastSvc.show('Payment recorded successfully', 'success');
        this.paymentForm.reset({ paymentMethod: 'CASH' });
        this.loadPaymentSummary();
        this.paymentSuccess.emit();
        const paymentId = response?.data?.id;
        if (paymentId) this.downloadInvoicePdf(paymentId);
      },
      (err: any) => {
        this.isSubmitting.set(false);
        this.toastSvc.show(err?.error?.message || 'Payment failed', 'error');
      }
    );
  }

  /**
   * Open Razorpay checkout
   * 
   * @param amount 
   * @param invoiceId 
   * @returns 
   */
  private async _openRazorpayCheckout(amount: number, invoiceId: number | null): Promise<void> {
    if (!amount || amount <= 0) {
      this.toastSvc.show('Enter a valid amount before proceeding', 'warning');
      return;
    }

    this.isRazorpayLoading.set(true);

    const loaded = await this.paymentService.loadRazorpayScript();
    if (!loaded) {
      this.isRazorpayLoading.set(false);
      this.toastSvc.show('Could not load Razorpay. Check your connection.', 'error');
      return;
    }

    this.paymentService.createRazorpayOrder(
      {
        customerId: this.customerId,
        amount,
        paymentMethod: 'CHECKOUT',
        allocations: invoiceId ? [{ invoiceId, amountToPay: amount }] : []
      },
      (res: any) => {
        this.isRazorpayLoading.set(false);
        const order: RazorpayOrderResponse = res.data;

        if (!window.Razorpay) {
          this.toastSvc.show('Razorpay SDK not ready. Refresh and try again.', 'error');
          return;
        }

        // close the modal
        this.modalService.close();

        const options = {
          key: order.razorpayKeyId,
          amount: order.amountInPaise,
          currency: order.currency || 'INR',
          name: 'EZ Inventory',
          description: invoiceId
            ? `Invoice Payment — ${this.paymentSummary?.invoiceNumber || invoiceId}`
            : 'Advance Collection',
          order_id: order.orderId,
          prefill: {
            name: this.paymentSummary?.customerName || this.customerSummary?.customerName || '',
            email: '',
            contact: ''
          },
          notes: {
            invoiceId: String(invoiceId ?? ''),
            customerId: String(this.customerId)
          },
          theme: { color: '#4f46e5' },
          handler: (response: RazorpaySuccessResponse) => {
            this._onRazorpaySuccess(response, amount, invoiceId);
          },
          modal: {
            ondismiss: () => this.toastSvc.show('Payment cancelled', 'warning'),
            escape: true,
            backdropclose: false
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (response: any) => {
          this.toastSvc.show(
            `Payment failed: ${response.error?.description || 'Unknown error'}`, 'error'
          );
        });
        rzp.open();
      },
      (err: any) => {
        this.isRazorpayLoading.set(false);
        this.toastSvc.show(err?.error?.message || 'Could not initiate payment. Try again.', 'error');
      }
    );
  }

  private _onRazorpaySuccess(
    response: RazorpaySuccessResponse,
    amountINR: number,
    invoiceId: number | null
  ): void {
    this.isSubmitting.set(true);
    this.paymentService.verifyRazorpayPayment(
      {
        razorpayOrderId: response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,
        customerId: this.customerId,
        amount: amountINR,
        allocations: invoiceId ? [{ invoiceId, amountToPay: amountINR }] : []
      },
      (res: any) => {
        this.isSubmitting.set(false);
        this.toastSvc.show('Payment successful via Razorpay!', 'success');
        this.paymentForm.reset({ paymentMethod: 'CASH' });
        this.walletForm.reset({ paymentMethod: 'CASH', remarks: 'Advance Payment' });
        this.showWalletForm = false;
        this.refreshAllData();
        this.paymentSuccess.emit();
        const paymentId = res?.data?.paymentId || res?.data?.id;
        if (paymentId) this.downloadInvoicePdf(paymentId);
      },
      (err: any) => {
        this.isSubmitting.set(false);
        this.toastSvc.show(
          `Payment received but verification failed. Share this ID with support: ${response.razorpay_payment_id}`,
          'error'
        );
      }
    );
  }

  // PDF receipt
  downloadInvoicePdf(paymentId: number | string): void {
    this.loaderSvc.show();
    this.paymentService.downloadPaymentPdf(
      paymentId,
      (response: any) => {
        this.loaderSvc.hide();
        const blob = new Blob([response.body], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, 'paymentPopup',
          'width=900,height=800,top=50,left=100,toolbar=no,menubar=no,scrollbars=yes,resizable=yes');
      },
      () => {
        this.loaderSvc.hide();
        this.toastSvc.show('Failed to download receipt', 'error');
      }
    );
  }

  // Payment Link
  generatePaymentLink(): void {
    const amount = this.paymentForm.get('amount')?.value;
    if (!amount || amount <= 0) {
      this.toastSvc.show('Enter a valid amount', 'warning');
      return;
    }
    this.isGeneratingLink.set(true);
    this.linkGenerated.set(false);
    this.stopLinkPolling();
    this.linkPaymentStatus.set('PENDING');

    this.paymentService.createRazorpayOrder(
      {
        customerId: this.customerId,
        amount,
        paymentMethod: 'PAYMENT_LINK',
        allocations: this.invoiceId ? [{ invoiceId: this.invoiceId, amountToPay: amount }] : []
      },
      (res: any) => {
        const order: RazorpayOrderResponse = res.data;
        this.generatedPaymentLink.set(order.paymentLinkUrl || '');
        this.generatedPaymentLinkId.set(order.paymentLinkId || '');
        this.linkGenerated.set(true);
        this.isGeneratingLink.set(false);
        if (order.paymentLinkId) {
          this.startLinkPolling(order.paymentLinkId);
        }
      },
      (err: any) => {
        this.isGeneratingLink.set(false);
        this.toastSvc.show(err?.error?.message || 'Could not generate payment link', 'error');
      }
    );
  }

  copyPaymentLink(): void {
    navigator.clipboard.writeText(this.generatedPaymentLink()).then(() => {
      this.toastSvc.show('Link copied to clipboard', 'success');
    });
  }

  sendPaymentLinkByEmail(): void {
    if (!this.emailToShare) {
      this.toastSvc.show('Enter an email address', 'warning');
      return;
    }
    this.isSendingEmail.set(true);
    this.paymentService.sendPaymentLinkEmail(
      {
        paymentLinkId: this.generatedPaymentLinkId(),
        paymentLinkUrl: this.generatedPaymentLink(),
        email: this.emailToShare,
        customerId: this.customerId,
        invoiceId: this.invoiceId || null
      },
      () => {
        this.isSendingEmail.set(false);
        this.emailSent.set(true);
        this.toastSvc.show('Payment link sent via email', 'success');
      },
      (err: any) => {
        this.isSendingEmail.set(false);
        this.toastSvc.show(err?.error?.message || 'Failed to send email', 'error');
      }
    );
  }

  startLinkPolling(linkId: string): void {
    this.isPollingLink.set(true);
    // Run setInterval OUTSIDE Angular zone so it doesn't trigger CD on every tick,
    // then use ngZone.run() only when state actually changes.
    this.ngZone.runOutsideAngular(() => {
      this._linkPollTimer = setInterval(() => {
        this.paymentService.checkOrderStatus(
          linkId,
          (res: any) => {
            const status: string = res.data?.data?.status || res.data?.status || '';
            if (status === 'PAID') {
              clearInterval(this._linkPollTimer);
              this._linkPollTimer = null;
              // Re-enter Angular zone so signals + CD fire immediately
              this.ngZone.run(() => {
                this.isPollingLink.set(false);
                this.linkPaymentStatus.set('PAID');
                this.toastSvc.show('Payment received via link!', 'success');
                this.refreshAllData();
                this.paymentSuccess.emit();
                setTimeout(() => this.closeModal(), 2000);
              });
            }
          },
          () => { }
        );
      }, 5000);
    });
  }

  stopLinkPolling(): void {
    if (this._linkPollTimer) {
      clearInterval(this._linkPollTimer);
      this._linkPollTimer = null;
    }
    this.isPollingLink.set(false);
  }

  // QR Code 

  generateQRCode(): void {
    const amount = this.paymentForm.get('amount')?.value;
    if (!amount || amount <= 0) {
      this.toastSvc.show('Enter a valid amount', 'warning');
      return;
    }
    this.isGeneratingQr.set(true);
    this.qrGenerated.set(false);
    this.qrImageUrl.set('');
    this.qrOrderId.set('');
    this.qrPaymentStatus.set('PENDING');
    this.stopQrPolling();

    this.paymentService.createRazorpayOrder(
      {
        customerId: this.customerId,
        amount,
        paymentMethod: 'QR',
        allocations: this.invoiceId ? [{ invoiceId: this.invoiceId, amountToPay: amount }] : []
      },
      (res: any) => {
        const order: RazorpayOrderResponse = res.data;
        this.qrImageUrl.set(order.qrImageUrl || '');
        this.qrOrderId.set(order.orderId || '');
        this.qrGenerated.set(true);
        this.isGeneratingQr.set(false);
        if (!order.qrImageUrl) {
          console.warn('QR image URL missing in API response', order);
          this.toastSvc.show('QR generated but image URL missing. Contact support.', 'warning');
        }
        if (order.orderId) this.startQrPolling(order.orderId);
      },
      (err: any) => {
        this.isGeneratingQr.set(false);
        this.toastSvc.show(err?.error?.message || 'Could not generate QR code', 'error');
      }
    );
  }

  startQrPolling(orderId: string): void {
    this.isPollingQr.set(true);
    this.ngZone.runOutsideAngular(() => {
      this._qrPollTimer = setInterval(() => {
        this.paymentService.checkOrderStatus(
          orderId,
          (res: any) => {
            const status: string = res.data?.data?.status || res.data?.status || '';
            if (status === 'PAID' || status === 'captured') {
              clearInterval(this._qrPollTimer);
              this._qrPollTimer = null;
              this.ngZone.run(() => {
                this.isPollingQr.set(false);
                this.qrPaymentStatus.set('PAID');
                this.toastSvc.show('QR payment received!', 'success');
                this.refreshAllData();
                this.paymentSuccess.emit();
              });
            }
          },
          () => { }
        );
      }, 5000);
    });
  }

  stopQrPolling(): void {
    if (this._qrPollTimer) {
      clearInterval(this._qrPollTimer);
      this._qrPollTimer = null;
    }
    this.isPollingQr.set(false);
  }

  ngOnDestroy(): void {
    this.stopLinkPolling();
    this.stopQrPolling();
  }

  closeModal(): void { this.close.emit(); }
}