import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesOrderService } from '../../../views/sales/sales-order/sales-order.service';
import { InvoiceService } from '../../../views/sales/invoices/invoice.service';
import { SalesOrderModal, } from '../../../views/sales/sales-order/sales-order.modal';
import { InvoiceModal } from '../../../views/sales/invoices/invoice.modal';
import { ContactService } from '../../../views/contacts/contacts.service';
import { LoaderService } from '../loader/loaderService';
import { ToastService } from '../toast/toastService';
import { StepConfig, StepperComponent } from "../../UI/stepper/stepper.component";
import { User, ReceiptText, Truck, ReceiptIndianRupee } from 'lucide-angular';
import { ContactCardComponent } from "../contact-card/contact-card.component";
import { DeliveryService } from '../../../views/sales/delivery/delivery.service';
import { DeliveryModel } from '../../../views/sales/delivery/delivery.model';

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


  currentStep = 0;
  steps: StepConfig[] = [
    { key: 'so', label: 'Sales Order', icon: User, state: 'active' },
    { key: 'inv', label: 'Invoice', icon: ReceiptText, state: 'pending', disabled: true },
    { key: 'dele', label: 'Delivary', icon: Truck, state: 'pending', disabled: true },
    { key: 'pay', label: 'Payment', icon: ReceiptIndianRupee, state: 'pending', disabled: true }
  ];

  handleStepChange(step: StepConfig) {
    const index = this.steps.findIndex(s => s.key === step.key);
    if (index !== -1) {
      this.currentStep = index;
    }
  }


  goToNext() {
    this.steps[this.currentStep].state = 'completed';
    this.currentStep++;
    this.steps[this.currentStep].state = 'active';
    this.steps[this.currentStep].disabled = false;
  }

  constructor(
    private salesOrderService: SalesOrderService,
    private invoiceService: InvoiceService,
    private contactService: ContactService,
    private loaderService: LoaderService,
    private deliveryService: DeliveryService,
    private toastService: ToastService
  ) {
  }

  ngOnInit() {
    if (this.salesOrderId != null) {
      this.getSalesOrderDetails(this.salesOrderId)

    }
  }

  ngOnDestroy() {

  }

  getSalesOrderDetails(SoId: number) {
    this.loaderService.show();
    return this.salesOrderService.getSalesOrderById(SoId,
      (response: any) => {
        this.salesOrderDetails = response.data;
        this.loaderService.hide();
        if (this.salesOrderDetails != null) {
          this.contactId = this.salesOrderDetails.customerId;
          // Add more checks for DELIVERED, PAID, etc., to jump steps if needed
          if (this.salesOrderDetails.status === "CREATED") {
            // Keep at step 1

          } else if (this.salesOrderDetails.status === "FULLY_INVOICED") {
            this.getInvoiceDetails(SoId);
            this.steps[1].disabled = false;
            this.steps[1].state = 'active';
          }
        }
      },
      (error: any) => {
        this.loaderService.hide();
        console.error('Error fetching sales order details:', error);
      }
    )
  }

  getInvoiceDetails(soId: number) {
    this.loaderService.show();
    return this.invoiceService.getInvoiceById(soId,
      (response: any) => {
        this.invoiceDetails = response.date;
        this.loaderService.hide();
        //this.getDeliverieDetails(this.invoiceDetails)
      },
      (error: any) => {
        this.loaderService.hide();
        console.error('Error fetching invoice details:', error);
      }
    )
  }

  getDeliverieDetails(deliveryId: string) {
    this.loaderService.show();
    this.deliveryService.getDeliveryById(
      deliveryId,
      (response: any) => {
        this.deliveryDetails = response.data;
        this.loaderService.hide();
      },
      (error: any) => {
        this.loaderService.hide();
        this.toastService.show('Failed to load Items', 'error');
        console.error('Error fetching items:', error);
      }
    );
  }
}