import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesOrderService } from '../../../views/sales/sales-order/sales-order.service';
import { InvoiceService } from '../../../views/sales/invoices/invoice.service';
import { SalesOrderModal } from '../../../views/sales/sales-order/sales-order.modal';
import { InvoiceModal } from '../../../views/sales/invoices/invoice.modal';
import { LoaderService } from '../loader/loaderService';
import { ToastService } from '../toast/toastService';
import { StepConfig } from "../../UI/stepper/stepper.component";
import { User, ReceiptText, Truck, ReceiptIndianRupee, LucideAngularModule, Copy, Calendar, Package, ArrowRight, ArrowLeft, Download } from 'lucide-angular';
import { DeliveryService } from '../../../views/sales/delivery/delivery.service';
import { DeliveryModel } from '../../../views/sales/delivery/delivery.model';

import { filter, take } from 'rxjs/operators';
import { PaymentSymmaryComponent } from '../../../views/payments/payment-symmary/payment-symmary.component';
import { InvoicePaymentSummaryModal } from '../../../views/payments/payment.modal';
import { PaymentService } from '../../../views/payments/payment.service';
import { InvoiceFormComponent } from '../../../views/sales/invoices/invoice-form/invoice-form.component';
import { ConfirmationModalService } from '../../UI/confirmation-modal/confirmation-modal.service';
import { DrawerService } from '../drawer/drawerService';
import { ModalService } from '../modal/modalService';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './order-tracker.component.html',
  styleUrls: ['./order-tracker.component.css']
})
export class OrderTrackerComponent implements OnInit, OnDestroy {

  @Input() salesOrderId: number | null = null;
  @Input() invoiceNumber: string | null = null;
  contactId: number | string | null = 0;
  currentId: number | string | null = null;
  readonly copy = Copy;
  readonly calendar = Calendar;
  readonly package = Package;
  readonly arrowRight = ArrowRight;
  readonly arrowLeft = ArrowLeft;
  readonly download = Download;


  salesOrderDetails: SalesOrderModal | null = null;
  invoiceDetails: InvoiceModal | null = null;
  deliveryDetails: DeliveryModel | null = null;
  paymentSummary: InvoicePaymentSummaryModal | null = null;

  // Track which data has been loaded
  invoiceLoaded = false;
  deliveryLoaded = false;
  paymentLoaded = false;

  currentStep = 0;
  steps: StepConfig[] = [
    { key: 'so', label: 'Sales Order', icon: User, state: 'active', current: true, description: '' },
    { key: 'inv', label: 'Invoice', icon: ReceiptText, state: 'pending', disabled: true, current: false, description: '' },
    { key: 'dele', label: 'Delivery', icon: Truck, state: 'pending', disabled: true, current: false, description: '' },
    { key: 'pay', label: 'Payment', icon: ReceiptIndianRupee, state: 'pending', disabled: true, current: false, description: '' }
  ];

  handleStepChange(step: StepConfig) {
    const index = this.steps.findIndex(s => s.key === step.key);
    if (index !== -1 && !step.disabled) {
      this.currentStep = index;
      this.steps[index].current = true;
    }
  }

  goToNext() {
    if (this.currentStep < this.steps.length - 1) {
      this.steps[this.currentStep].state = 'completed';
      this.currentStep++;
      this.steps[this.currentStep].state = 'active';
      this.steps[this.currentStep].disabled = false;
      this.steps[this.currentStep].current = true;
    }
  }

  goToPrevious() {
    if (this.currentStep > 0) {
      this.steps[this.currentStep].state = 'pending';
      this.currentStep--;
      this.steps[this.currentStep].state = 'active';
      this.steps[this.currentStep].current = true;
    }
  }

  constructor(
    private salesOrderService: SalesOrderService,
    private invoiceService: InvoiceService,
    private loaderService: LoaderService,
    private deliveryService: DeliveryService,
    private paymentService: PaymentService,
    private toastService: ToastService,
    private drawerService: DrawerService,
    private modalService: ModalService,
    private confirmService: ConfirmationModalService
  ) {
  }

  ngOnInit() {
    if (this.salesOrderId != null) {
      this.getSalesOrderDetails(this.salesOrderId);
    }
  }

  ngOnDestroy() { }

  /**
   * Step 1: Load Sales Order details and determine the flow state
   */
  getSalesOrderDetails(soId: number) {
    this.loaderService.show();
    this.salesOrderService.getSalesOrderById(soId,
      (response: any) => {
        this.salesOrderDetails = response.data;
        this.steps[0].description = this.salesOrderDetails?.orderDate || '';
        this.loaderService.hide();
        if (this.salesOrderDetails != null) {
          this.contactId = this.salesOrderDetails.customerId;
          this.determineFlowState();
        }
      },
      (error: any) => {
        this.loaderService.hide();
        console.error('Error fetching sales order details:', error);
      }
    );
  }

  /**
   * Determine which steps are completed based on SO status
   * and fetch related data (invoice, delivery, payment)
   */
  determineFlowState() {
    if (!this.salesOrderDetails) return;

    const status = this.salesOrderDetails.status;

    if (status === 'CREATED' || status === 'PENDING' || status === 'PENDING_APPROVAL' || status === 'CONFIRMED') {
      // Only SO step is active, nothing else loaded
      this.steps[0].state = 'active';
      //rest all block it 
      this.steps[1].state = 'pending';
      this.steps[1].disabled = true;
      this.steps[2].state = 'pending';
      this.steps[2].disabled = true;
      this.steps[3].state = 'pending';
      this.steps[3].disabled = true;
    } else if (status === 'PARTIALLY_INVOICED' || status === 'FULLY_INVOICED') {
      // SO is done, Invoice step is active/available
      // SO now we can Both Sales Order and Invoice
      this.steps[0].state = 'completed';
      this.steps[1].state = 'active';
      this.steps[1].disabled = false;
      this.currentStep = 1;
      // Fetch invoice details linked to this SO
      this.getInvoiceBySalesOrderId(this.salesOrderDetails.id);
    }
  }

  /**
   * Step 2: Fetch Invoice linked to the Sales Order
   */
  getInvoiceBySalesOrderId(soId: number) {
    const filter = { salesOrderId: soId };
    this.invoiceService.searchInvoices(filter,
      (response: any) => {
        const invoices = response.data?.content || response.data;
        this.steps[1].description = invoices[0].invoiceDate || '';
        if (invoices && invoices.length > 0) {
          this.invoiceDetails = invoices[0]; // Take the first/primary invoice
          this.invoiceLoaded = true;

          // Now check invoice status to determine further steps
          this.determineInvoiceFlowState();
        }
      },
      (error: any) => {
        console.error('Error fetching invoice by SO:', error);
      }
    );
  }

  /**
   * Determine delivery & payment state from invoice details
   */
  determineInvoiceFlowState() {
    if (!this.invoiceDetails) return;

    const deliveryStatus = this.invoiceDetails.deliveryStatus;
    const paymentStatus = this.invoiceDetails.paymentStatus;

    // Check delivery status
    if (deliveryStatus === 'SHIPPED' || deliveryStatus === 'DELIVERED' ||
      deliveryStatus === 'SCHEDULED' || deliveryStatus === 'PENDING') {
      this.steps[1].state = 'completed';
      this.steps[2].state = 'active';
      this.steps[2].disabled = false;

      // Fetch delivery details
      this.getDeliveryByInvoiceId(this.invoiceDetails.id);

      if (deliveryStatus === 'DELIVERED') {
        this.steps[2].state = 'completed';
        this.steps[3].state = 'active';
        this.steps[3].disabled = false;
        this.currentStep = 3;

        // Fetch payment details
        this.getPaymentSummaryByInvoiceId(this.invoiceDetails.id);
      } else {
        this.currentStep = 2;
      }
    }

    // Check payment status regardless
    if (paymentStatus === 'PAID' || paymentStatus === 'PARTIALLY_PAID') {
      this.steps[3].disabled = false;
      if (paymentStatus === 'PAID') {
        this.steps[3].state = 'completed';
      } else {
        this.steps[3].state = 'active';
      }
      this.getPaymentSummaryByInvoiceId(this.invoiceDetails.id);
    }
  }

  /**
   * Step 3: Fetch Delivery details by invoice
   */
  getDeliveryByInvoiceId(invoiceId: number) {
    const filter = { invoiceId: invoiceId };
    this.deliveryService.searchDeliveryDetails(filter,
      (response: any) => {
        const deliveries = response.data?.content || response.data;
        this.steps[2].description = deliveries[0].deliveryDate || '';
        if (deliveries && deliveries.length > 0) {
          this.deliveryDetails = deliveries[0];
          this.deliveryLoaded = true;
        }
      },
      (error: any) => {
        console.error('Error fetching delivery details:', error);
      }
    );
  }

  /**
   * Step 4: Fetch Payment Summary by invoice
   */
  getPaymentSummaryByInvoiceId(invoiceId: number) {
    this.paymentService.getPaymentSummaryByInvoiceId(invoiceId,
      (response: any) => {
        this.paymentSummary = response.data;
        this.paymentLoaded = true;
      },
      (error: any) => {
        console.error('Error fetching payment summary:', error);
      }
    );
  }

  // ── Helpers ──

  getStatusBadgeClass(status: string | undefined): string {
    if (!status) return 'bg-gray-100 text-gray-600 border-gray-200';
    const s = status.toUpperCase();
    if (s.includes('CREATED') || s.includes('PENDING')) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (s.includes('CONFIRMED') || s.includes('APPROVED')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (s.includes('INVOICED') || s.includes('SHIPPED') || s.includes('SCHEDULED')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (s.includes('DELIVERED') || s.includes('PAID') || s.includes('COMPLETED')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (s.includes('PARTIALLY')) return 'bg-orange-50 text-orange-700 border-orange-200';
    if (s.includes('CANCELLED') || s.includes('REJECTED') || s.includes('UNPAID')) return 'bg-red-50 text-red-700 border-red-200';
    return 'bg-gray-100 text-gray-600 border-gray-200';
  }

  formatStatus(status: string | undefined): string {
    if (!status) return 'N/A';
    return status.replace(/_/g, ' ');
  }

  getDeliveryTypeLabel(type: string | undefined): string {
    if (!type) return 'N/A';
    switch (type) {
      case 'CUSTOMER_PICKUP': return 'Customer Pickup';
      case 'THIRD_PARTY_COURIER': return 'Third Party Courier';
      case 'IN_HOUSE_DELIVERY': return 'In-House Delivery';
      default: return type.replace(/_/g, ' ');
    }
  }

  // ── Display helpers ──────────────────────────────────────────────────────────

  getCurrentDisplayStatus(): string | undefined {
    switch (this.currentStep) {
      case 0: return this.salesOrderDetails?.status;
      case 1: return this.invoiceDetails?.status;
      case 2: return this.deliveryDetails?.status;
      case 3: return this.paymentSummary?.status;
    }
    return undefined;
  }

  getCurrentDisplayNumber(): string | undefined {
    switch (this.currentStep) {
      case 0: return this.salesOrderDetails?.orderNumber;
      case 1: return this.invoiceDetails?.invoiceNumber;
      case 2: return this.deliveryDetails?.deliveryNumber;
      case 3: return this.paymentSummary?.invoiceNumber;
    }
    return undefined;
  }

  getCurrentDisplayDate(): string | undefined {
    switch (this.currentStep) {
      case 0: return this.salesOrderDetails?.orderDate;
      case 1: return this.invoiceDetails?.invoiceDate;
      case 2: return this.deliveryDetails?.scheduledDate as any;
      case 3: return undefined;
    }
    return undefined;
  }

  // ── Condition getters

  get canCancelSO(): boolean {
    return this.salesOrderDetails?.status === 'CONFIRMED';
  }

  get canConvertToInvoice(): boolean {
    return this.salesOrderDetails?.status === 'CONFIRMED';
  }

  get isSOInvoiced(): boolean {
    const status = this.salesOrderDetails?.status;
    return status === 'PARTIALLY_INVOICED' || status === 'FULLY_INVOICED';
  }

  get isSOTerminal(): boolean {
    const status = this.salesOrderDetails?.status;
    return status === 'CANCELLED' || status === 'REJECTED';
  }

  get isSOPending(): boolean {
    const status = this.salesOrderDetails?.status;
    return status === 'CREATED' || status === 'PENDING' || status === 'PENDING_APPROVAL';
  }

  get canRecordPayment(): boolean {
    const ps = this.invoiceDetails?.paymentStatus;
    return ps === 'UNPAID' || ps === 'PARTIALLY_PAID';
  }

  get canMarkDelivered(): boolean {
    if (!this.deliveryDetails) return false;
    const ds = this.deliveryDetails.status;
    return ds === 'PENDING' || ds === 'SCHEDULED' || ds === 'SHIPPED';
  }

  get isOrderFulfilled(): boolean {
    return (this.paymentSummary?.balanceDue === 0) &&
      (this.deliveryDetails?.status === 'DELIVERED');
  }

  // ── Actions ───────────────────────────────────────────────────────────────────

  refreshCurrentOrder() {
    if (this.salesOrderId != null) {
      this.invoiceLoaded = false;
      this.deliveryLoaded = false;
      this.paymentLoaded = false;
      this.invoiceDetails = null;
      this.deliveryDetails = null;
      this.paymentSummary = null;
      this.currentStep = 0;
      this.steps[0].state = 'active';
      this.steps[1].state = 'pending'; this.steps[1].disabled = true;
      this.steps[2].state = 'pending'; this.steps[2].disabled = true;
      this.steps[3].state = 'pending'; this.steps[3].disabled = true;
      this.getSalesOrderDetails(this.salesOrderId);
    }
  }

  goToInvoiceStep() {
    if (this.isSOInvoiced && !this.steps[1].disabled) {
      this.currentStep = 1;
    }
  }

  convertToInvoice() {
    if (!this.salesOrderDetails) return;
    this.drawerService.openComponent(
      InvoiceFormComponent,
      { salesOrderId: this.salesOrderDetails.id, customerId: this.salesOrderDetails.customerId },
      'Create Invoice',
      '2xl'
    );
    this.drawerService.drawerState$.pipe(
      filter(open => !open),
      take(1)
    ).subscribe(() => {
      this.refreshCurrentOrder();
    });
  }

  async cancelSalesOrder() {
    if (!this.salesOrderDetails) return;
    const confirmed = await this.confirmService.open({
      title: 'Cancel Sales Order',
      message: `Are you sure you want to cancel order #${this.salesOrderDetails.orderNumber}? This action cannot be undone.`,
      intent: 'danger',
      confirmLabel: 'Cancel Order',
      cancelLabel: 'Keep Order'
    });
    if (!confirmed) return;
    this.loaderService.show();
    this.salesOrderService.updateSalesOrderStatus(
      this.salesOrderDetails.id,
      'CANCELLED',
      (res: any) => {
        this.loaderService.hide();
        this.toastService.show('Sales order cancelled', 'success');
        this.refreshCurrentOrder();
      },
      (err: any) => {
        this.loaderService.hide();
        this.toastService.show('Failed to cancel order', 'error');
      }
    );
  }

  downloadInvoice() {
    if (!this.invoiceDetails) return;
    this.loaderService.show();
    this.invoiceService.downloadInvoicePdf(
      this.invoiceDetails.id,
      (response: any) => {
        this.loaderService.hide();
        const blob = new Blob([response.body], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, 'invoicePopup', 'width=900,height=800,top=50,left=100,toolbar=no,menubar=no,scrollbars=yes,resizable=yes');
      },
      (error: any) => {
        this.loaderService.hide();
        this.toastService.show('Failed to download invoice', 'error');
      }
    );
  }

  recordPayment() {
    if (!this.invoiceDetails) return;
    this.modalService.openComponent(
      PaymentSymmaryComponent,
      { invoiceId: this.invoiceDetails.id, customerId: this.invoiceDetails.customerId },
      'lg'
    );
    this.modalService.isOpen$.pipe(
      filter(open => !open),
      take(1)
    ).subscribe(() => {
      this.refreshCurrentOrder();
    });
  }

  async markAsDelivered() {
    if (!this.deliveryDetails) return;
    const isPickup = this.deliveryDetails.type === 'CUSTOMER_PICKUP';
    const confirmed = await this.confirmService.open({
      title: isPickup ? 'Mark as Picked Up' : 'Mark as Delivered',
      message: isPickup
        ? 'Confirm that the customer has picked up the order?'
        : 'Confirm that this delivery has been completed?',
      intent: 'success',
      confirmLabel: isPickup ? 'Yes, Picked Up' : 'Yes, Delivered'
    });
    if (!confirmed) return;
    this.loaderService.show();
    this.deliveryService.markAsDelivered(
      this.deliveryDetails.id,
      (res: any) => {
        this.loaderService.hide();
        this.toastService.show(isPickup ? 'Order marked as picked up' : 'Delivery completed', 'success');
        this.refreshCurrentOrder();
      },
      (err: any) => {
        this.loaderService.hide();
        this.toastService.show('Failed to update delivery status', 'error');
      }
    );
  }

  getStepTitle(step: number): string {
    const titles: { [key: number]: string } = {
      0: 'Sales Order',
      1: 'Invoice',
      2: 'Delivery',
      3: 'Payment'
    };
    return titles[step] || 'Inventory Task';
  }

  copyToClipboard(text: string | undefined) {
    if (!text) return;
    navigator.clipboard.writeText(text);
  }
}