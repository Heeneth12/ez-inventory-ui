import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesOrderService } from '../../../views/sales/sales-order/sales-order.service';
import { InvoiceService } from '../../../views/sales/invoices/invoice.service';
import { SalesOrderModal } from '../../../views/sales/sales-order/sales-order.modal';
import { InvoiceModal } from '../../../views/sales/invoices/invoice.modal';
import { LoaderService } from '../loader/loaderService';
import { ToastService } from '../toast/toastService';
import { StepConfig, StepperComponent } from "../../UI/stepper/stepper.component";
import { User, ReceiptText, Truck, ReceiptIndianRupee } from 'lucide-angular';
import { ContactCardComponent } from "../contact-card/contact-card.component";
import { DeliveryService } from '../../../views/sales/delivery/delivery.service';
import { DeliveryModel } from '../../../views/sales/delivery/delivery.model';
import { PaymentService } from '../../../views/sales/payments/payment.service';
import { InvoicePaymentSummaryModal } from '../../../views/sales/payments/payment.modal';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, StepperComponent, ContactCardComponent],
  templateUrl: './order-tracker.component.html',
  styleUrls: ['./order-tracker.component.css']
})
export class OrderTrackerComponent implements OnInit, OnDestroy {

  @Input() salesOrderId: number | null = null;
  contactId: number | string | null = 0;

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
    { key: 'so', label: 'Sales Order', icon: User, state: 'active' },
    { key: 'inv', label: 'Invoice', icon: ReceiptText, state: 'pending', disabled: true },
    { key: 'dele', label: 'Delivery', icon: Truck, state: 'pending', disabled: true },
    { key: 'pay', label: 'Payment', icon: ReceiptIndianRupee, state: 'pending', disabled: true }
  ];

  handleStepChange(step: StepConfig) {
    const index = this.steps.findIndex(s => s.key === step.key);
    if (index !== -1 && !step.disabled) {
      this.currentStep = index;
    }
  }

  goToNext() {
    if (this.currentStep < this.steps.length - 1) {
      this.steps[this.currentStep].state = 'completed';
      this.currentStep++;
      this.steps[this.currentStep].state = 'active';
      this.steps[this.currentStep].disabled = false;
    }
  }

  goToPrevious() {
    if (this.currentStep > 0) {
      this.steps[this.currentStep].state = 'pending';
      this.currentStep--;
      this.steps[this.currentStep].state = 'active';
    }
  }

  constructor(
    private salesOrderService: SalesOrderService,
    private invoiceService: InvoiceService,
    private loaderService: LoaderService,
    private deliveryService: DeliveryService,
    private paymentService: PaymentService,
    private toastService: ToastService
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
    } else if (status === 'PARTIALLY_INVOICED' || status === 'FULLY_INVOICED') {
      // SO is done, Invoice step is active/available
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
    if (s.includes('CANCELLED') || s.includes('REJECTED')) return 'bg-red-50 text-red-700 border-red-200';
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
}