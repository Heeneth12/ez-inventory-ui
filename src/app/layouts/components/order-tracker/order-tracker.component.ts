import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SalesOrderService } from '../../../views/sales/sales-order/sales-order.service';
import { InvoiceService } from '../../../views/sales/invoices/invoice.service';
import { SalesOrderModal, SalesOrderItemsModal } from '../../../views/sales/sales-order/sales-order.modal';
import { InvoiceModal, InvoiceItemModal } from '../../../views/sales/invoices/invoice.modal';
import { ContactModel } from '../../../views/contacts/contacts.model';
import { ContactService } from '../../../views/contacts/contacts.service';
import { LoaderService } from '../loader/loaderService';
import { ToastService } from '../toast/toastService';

// --- Interfaces (Provided in prompt, defined here for completeness) ---
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

// --- Dummy Data Models (Mocking the imports for this example) ---
// Note: In a real Angular app, these would come from the imported files.

export class MockSalesOrderModal implements SalesOrderModal {
    id: number = 1;
    warehouseId: number = 101;
    orderNumber: string = 'SO-75643290';
    orderDate: string = '2025-06-09T08:00:00';
    customerId: number = 201;
    customerName: string = 'Alice Johnson';
    paymentTerms: string = 'Net 30';
    totalAmount: number = 330.00;
    discount: number = 50.00;
    tax: number = 10.00;
    subTotal: number = 300.00;
    grandTotal: number = 280.00;
    totalDiscount: number = 50.00;
    active: boolean = true;
    status: string = 'INVOICED'; // Start status for demonstration
    items: SalesOrderItemsModal[] = [{ id: 1, itemId: 1, itemName: 'Premium Widget X', orderedQty: 2, quantity: 2, unitPrice: 50.00, discount: 0, tax: 5, lineTotal: 100 }, { id: 2, itemId: 2, itemName: 'Service Plan A', orderedQty: 1, quantity: 1, unitPrice: 200.00, discount: 50.00, tax: 5, lineTotal: 180 }];
    remarks: string = 'Urgent delivery requested.';
}

export class MockInvoiceModal implements InvoiceModal {
    id: number = 1;
    invoiceNumber: string = 'INV-001290';
    salesOrderId: number = 1;
    customerId: number = 201;
    status: string = 'PAID_PENDING';
    invoiceDate: Date = new Date('2025-06-10T10:30:00');
    items: InvoiceItemModal[] = [{ id: 1, invoiceId: 1, itemId: 1, itemName: 'Premium Widget X', quantity: 2, batchNumber: 'B-001', sku: 'WGTX', unitPrice: 50.00, discountAmount: 0, taxAmount: 5, lineTotal: 100 }, { id: 2, invoiceId: 1, itemId: 2, itemName: 'Service Plan A', quantity: 1, batchNumber: 'B-002', sku: 'SRVCA', unitPrice: 200.00, discountAmount: 50.00, taxAmount: 5, lineTotal: 180 }];
    subTotal: number = 300.00;
    discountAmount: number = 50.00;
    taxAmount: number = 10.00;
    grandTotal: number = 280.00;
    amountPaid: number = 0;
    balance: number = 280.00;
    remarks: string = 'Payment due in 30 days.';
}

export class MockContactModel implements ContactModel {
    id: number = 201;
    contactCode: string = 'CUST-001';
    name: string = 'Alice Johnson';
    email: string = 'alice@example.com';
    phone: string = '+1 555-123-4567';
    gstNumber: string = 'GSTIN12345';
    type: any = 'CUSTOMER'; // Using 'any' to avoid defining the full enum here
    active: boolean = true;
    addresses: any[] = [{ addressLine1: '4517 Washington Ave.', city: 'Manchester', state: 'KY', pinCode: '41737', type: 'SHIPPING' }];
}


@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, DatePipe], // Include DatePipe for formatting dates
  templateUrl: './order-tracker.component.html',
  styleUrls: ['./order-tracker.component.css']
})
export class OrderTrackerComponent implements OnInit, OnDestroy {

  // --- Data Properties ---
  salesOrderDetails: SalesOrderModal = new MockSalesOrderModal();
  invoiceDetails: InvoiceModal = new MockInvoiceModal();
  customerDetails: ContactModel = new MockContactModel();
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
    // Initialize component state for demo: set Invoice as current view
    this.currentStepIndex = 1; 
  }

  ngOnInit() {
    // In a real app, you would call getSalesOrderDetails(orderId) here
    // this.getSalesOrderDetails(75643290); 
  }

  ngOnDestroy() {
  }

  // --- Core Navigation Logic ---

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

  // --- Data Fetching Logic (Adjusted to use goToNextStep) ---

  getSalesOrderDetails(SoId: number) {
    this.loaderService.show()
    return this.salesOrderService.getSalesOrderById(SoId,
      (response: any) => {
        this.salesOrderDetails = response.date;
        this.loaderService.hide();
        this.getCustomerDetails(this.salesOrderDetails.customerId);

        // Logic to advance the stepper based on real SO status
        if (this.salesOrderDetails.status === "CREATED") {
          // Keep at step 1
        } else if (this.salesOrderDetails.status === "INVOICED") {
          this.goToNextStep(2); // Go to Invoice
          this.getInvoiceDetails(SoId);
        }
        // Add more checks for DELIVERED, PAID, etc., to jump steps if needed
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
        
        // Logic to advance the stepper based on real Invoice status
        if (this.invoiceDetails.status === "PAID_PENDING") {
           // Assume Delivery (Step 3) starts after Invoice is created
           this.goToNextStep(3); 
        }
      },
      (error: any) => {
        this.loaderService.hide()
        console.error('Error fetching invoice details:', error);
      }
    )
  }

  getCustomerDetails(ContactId: number) {
    // ... (logic remains the same)
  }
}