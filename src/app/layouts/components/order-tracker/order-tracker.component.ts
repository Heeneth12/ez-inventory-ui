import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesOrderService } from '../../../views/sales/sales-order/sales-order.service';
import { InvoiceService } from '../../../views/sales/invoices/invoice.service';
import { SalesOrderModal, } from '../../../views/sales/sales-order/sales-order.modal';
import { InvoiceModal, InvoiceItemModal } from '../../../views/sales/invoices/invoice.modal';
import { ContactModel } from '../../../views/contacts/contacts.model';
import { ContactService } from '../../../views/contacts/contacts.service';
import { LoaderService } from '../loader/loaderService';
import { ToastService } from '../toast/toastService';

interface Step {
  id: number;
  label: string;
  status: 'pending' | 'processing' | 'completed';
  disbale: boolean;
}

interface TimelineEvent {
  title: string;
  location: string;
  date: string;
  time: string;
  isCompleted: boolean;
  isCurrent: boolean;
}


@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule], // Include DatePipe for formatting dates
  templateUrl: './order-tracker.component.html',
  styleUrls: ['./order-tracker.component.css']
})
export class OrderTrackerComponent implements OnInit, OnDestroy {

  @Input() SalesOrderId: number | string | null = null;

  salesOrderDetails: SalesOrderModal | null = null;
  invoiceDetails: InvoiceModal | null = null;
  customerDetails: ContactModel | null = null;


  currentStepIndex = 0;

  // --- Stepper Configuration ---
  steps: Step[] = [
    { id: 1, label: 'Sales Order', status: 'completed', disbale: false }, // Start as completed/processing for demo
    { id: 2, label: 'Invoice', status: 'processing', disbale: false },    // Enable 2nd step for demo
    { id: 3, label: 'Delivery', status: 'pending', disbale: true },
    { id: 4, label: 'Payment', status: 'pending', disbale: true },
    { id: 5, label: 'Completed', status: 'pending', disbale: true }
  ];

  // --- Timeline Data ---
  timelineEvents: TimelineEvent[] = [
    { title: 'Sales Order Created', location: 'System Approval', date: '09 June 2025', time: '08:00 AM', isCompleted: true, isCurrent: false },
    { title: 'Invoice Generated', location: 'Finance Dept.', date: '09 June 2025', time: '10:30 AM', isCompleted: true, isCurrent: false }, // Added for Step 2
    { title: 'Processing Shipment', location: 'Warehouse 001', date: '09 June 2025', time: '01:00 PM', isCompleted: false, isCurrent: true }, // Current step for demo
    { title: 'Out for Delivery', location: '2118 Thornridge Cir.', date: '10 June 2025', time: '08:00 AM', isCompleted: false, isCurrent: false },
    { title: 'Payment Confirmed', location: 'Bank Transaction ID: #9921', date: '12 June 2025', time: '02:00 PM', isCompleted: false, isCurrent: false }
  ];

  // --- Map Position Data (Dummy) ---
  mapPositions = [
    { top: '20%', left: '10%' },
    { top: '30%', left: '25%' },
    { top: '50%', left: '50%' },
    { top: '60%', left: '70%' },
    { top: '70%', left: '85%' },
  ];
  currentMapPos = this.mapPositions[this.currentStepIndex];


  constructor(
    private salesOrderService: SalesOrderService,
    private invoiceService: InvoiceService,
    private contactService: ContactService,
    private loaderService: LoaderService,
    private toastService: ToastService
  ) {
    this.currentStepIndex = 1;
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }


  /**
   * Safely navigates the user to a clickable step.
   * Updates the current step index and status.
   */
  selectStep(index: number): void {
    const selectedStep = this.steps[index];

    // Check if the step is disabled (i.e., not yet reached via business logic)
    if (selectedStep.disbale) {
      return;
    }

    // Only proceed if the step is not disabled
    if (index !== this.currentStepIndex) {
      // 1. Mark the *old* processing step as completed (if it exists)
      const currentProcessingIndex = this.steps.findIndex(step => step.status === 'processing');
      if (currentProcessingIndex !== -1) {
        this.steps[currentProcessingIndex].status = 'completed';
      }

      // 2. Set the *new* step as processing (visually active)
      selectedStep.status = 'processing';
      this.currentStepIndex = index;
      this.currentMapPos = this.mapPositions[index];
    }
  }

  /**
   * Called internally after data fetching confirms a business step is finished.
   * Automatically moves the flow forward and enables the next step.
   * @param nextStepId The ID (1-indexed) of the step to move to.
   */
  goToNextStep(nextStepId: number): void {
    const completedStepIndex = this.steps.findIndex(step => step.id === nextStepId - 1);
    if (completedStepIndex !== -1) {
      this.steps[completedStepIndex].status = 'completed';
    }

    const nextStepIndex = this.steps.findIndex(step => step.id === nextStepId);
    if (nextStepIndex !== -1) {
      this.steps[nextStepIndex].disbale = false;
      this.steps[nextStepIndex].status = 'processing';
      this.currentStepIndex = nextStepIndex;
      this.currentMapPos = this.mapPositions[nextStepIndex];
    }
  }


  getSalesOrderDetails(SoId: number) {
    this.loaderService.show()
    return this.salesOrderService.getSalesOrderById(SoId,
      (response: any) => {
        this.salesOrderDetails = response.date;
        this.loaderService.hide();

        if (this.salesOrderDetails != null) {
          this.getCustomerDetails(this.salesOrderDetails.customerId);
          // Add more checks for DELIVERED, PAID, etc., to jump steps if needed
          if (this.salesOrderDetails.status === "CREATED") {
            // Keep at step 1
          } else if (this.salesOrderDetails.status === "INVOICED") {
            this.goToNextStep(2); // Go to Invoice
            this.getInvoiceDetails(SoId);
          }
        }
      },
      (error: any) => {
        this.loaderService.hide()
        console.error('Error fetching sales order details:', error);
      }
    )
  }

  getInvoiceDetails(soId: number) {
    this.loaderService.show()
    return this.invoiceService.getInvoiceById(soId,
      (response: any) => {
        this.invoiceDetails = response.date;
        this.loaderService.hide()
      },
      (error: any) => {
        this.loaderService.hide()
        console.error('Error fetching invoice details:', error);
      }
    )
  }

  getCustomerDetails(contactId: number | string) {
    this.contactService.getContactById(contactId,
      (response:any) => {
        
      },
      (error:any) => {

      }
    )
  }
}

// export class ContactModel {
//     id!: number;
//     contactCode!: string;
//     name!: string;
//     email!: string;
//     phone!: string;
//     gstNumber!: string;
//     type!: ContactType;
//     active!: boolean;
//     addresses: AddressModel[] = [];
// }

// export class SalesOrderModal {
//     id!: number;
//     warehouseId!: number;
//     orderNumber!: string;
//     orderDate!: string;
//     contactMini!: ContactMiniModel
//     customerId!: number;
//     customerName!: string;
//     paymentTerms!: string;
//     totalAmount!: number;
//     discount!: number;
//     tax!: number;
//     subTotal!: number;
//     grandTotal!: number;
//     totalDiscount!: number;
//     totalTax!: number;
//     active!: boolean;
//     status!: string;
//     source!: string;
//     items!: SalesOrderItemsModal[];
//     remarks!: string;
// }

// export class SalesOrderItemsModal {
//     id!: number;
//     itemId!: number;
//     itemName!: string;
//     orderedQty!: number;
//     quantity!: number;
//     unitPrice!: number;
//     discount!: number;
//     tax!: number;
//     lineTotal!: number;
// }