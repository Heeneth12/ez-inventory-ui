import { Component, Input, OnChanges, SimpleChanges, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { LucideAngularModule, FileText, CheckCircle2, Truck, CreditCard, ChevronRight, Download, User, Calendar, AlertCircle, Building2, Mail, MapPin, Phone, Receipt, Check } from 'lucide-angular';
import { SalesOrderService } from '../../../views/sales/sales-order/sales-order.service';
import { InvoiceService } from '../../../views/sales/invoices/invoice.service';
import { LoaderService } from '../loader/loaderService';
import { ToastService } from '../toast/toastService';
import { SalesOrderModal } from '../../../views/sales/sales-order/sales-order.modal';
import { InvoiceModal, InvoiceFilterModal } from '../../../views/sales/invoices/invoice.modal';
import { ContactService } from '../../../views/contacts/contacts.service';
import { ContactModel } from '../../../views/contacts/contacts.model';
import { ModalService } from '../modal/modalService';

@Component({
  selector: 'app-sales-flow-tracker',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, CurrencyPipe, DatePipe],
  templateUrl: './sales-flow-tracker.component.html',
  styleUrl: './sales-flow-tracker.component.css'
})
export class SalesFlowTrackerComponent implements OnChanges {

  @Input() salesOrderId!: number;

  // Data Containers
  salesOrderDetail = signal<SalesOrderModal | null>(null);
  invoiceDetail = signal<InvoiceModal | null>(null);
  contactDetail = signal<ContactModel | null>(null);

  // UI State
  activeStep = signal<number>(1);
  isLoading = signal<boolean>(false);

  // Stepper Config
  steps = [
    { id: 1, label: 'Sales Order', icon: FileText },
    { id: 2, label: 'Invoice', icon: CheckCircle2 },
    { id: 3, label: 'Delivery', icon: Truck },
    { id: 4, label: 'Payment', icon: CreditCard }
  ];

  readonly Icons = { FileText, CheckCircle2, Truck, CreditCard, ChevronRight, Download, User, Calendar, AlertCircle, Mail, Phone, MapPin, Building2, Receipt, Check };

  constructor(
    private salesOrderService: SalesOrderService,
    private invoiceService: InvoiceService,
    private contactService: ContactService,
    private loaderSvc: LoaderService,
    private toastSvc: ToastService,
    private modalService: ModalService
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['salesOrderId'] && this.salesOrderId) {
      this.loadFullFlow();
    }
  }

  loadFullFlow() {
    this.isLoading.set(true);
    this.salesOrderDetail.set(null);
    this.invoiceDetail.set(null);
    // 1. Fetch Sales Order
    this.salesOrderService.getSalesOrderById(this.salesOrderId,
      (res: any) => {
        const so = res.data;
        this.salesOrderDetail.set(so);
        // Fetch Contact Details
        if (so.contactId) {
          this.getContactDetailsById(so.contactId);
        }
        // 2. Determine Next Step
        // If status implies invoicing started, fetch invoice
        const status = so.status?.toLowerCase();
        if (status?.includes('fully_invoiced') || status?.includes('partially_invoiced')) {
          this.fetchLinkedInvoice(so.id);
        } else {
          this.updateStageAndStopLoading(1);
        }
      },
      (err: any) => {
        this.isLoading.set(false);
        this.toastSvc.show("Error loading order", "error");
      }
    );
  }

  fetchLinkedInvoice(soId: number) {
    const filter = new InvoiceFilterModal();
    filter.salesOrderId = soId;

    this.invoiceService.searchInvoices(filter,
      (res: any) => {
        // Assuming search returns a list (Page), take the first one for this flow
        // Adjust this if your API returns a single object
        const inv = res.data?.content ? res.data.content[0] : res.data;
        if (inv) {
          this.invoiceDetail.set(inv);
          this.updateStageAndStopLoading(2); // Move to Stage 2
        } else {
          this.updateStageAndStopLoading(1);
        }
      },
      (err: any) => {
        this.updateStageAndStopLoading(1); // Fallback to stage 1 on error
      }
    );
  }


  getContactDetailsById(contactId: any) {
    this.contactService.getContactById(contactId,
      (res: any) => {
        this.contactDetail.set(res.data);
      },
      (err: any) => {
        this.toastSvc.show("Error loading contact details", "error");
        this.contactDetail.set(null);
      }
    );
  }


  updateStageAndStopLoading(stage: number) {
    this.activeStep.set(stage);
    this.isLoading.set(false);
  }

  // --- UI Helpers ---

  calculatedStage = computed(() => {
    if (this.invoiceDetail()) return 2;
    if (this.salesOrderDetail()) return 1;
    return 0;
  });

  get progressWidth(): string {
    const stage = this.calculatedStage();
    // 0% for stage 1, 33% for stage 2, 66% for stage 3, 100% for stage 4
    const percentage = ((stage - 1) / (this.steps.length - 1)) * 100;
    return `${Math.max(0, percentage)}%`;
  }

  getStepStatus(stepId: number): 'completed' | 'active' | 'pending' {
    const current = this.calculatedStage();
    if (stepId < current) return 'completed';
    if (stepId === current) return 'active';
    return 'pending';
  }
}