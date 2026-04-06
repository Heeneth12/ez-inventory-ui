import { Component, Input } from '@angular/core';
import { InvoiceService } from './invoice.service';
import { ToastService } from '../../../layouts/components/toast/toastService';
import { LoaderService } from '../../../layouts/components/loader/loaderService';
import { PaginationConfig, TableAction, TableColumn } from '../../../layouts/components/standard-table/standard-table.model';
import { Router } from '@angular/router';
import { BadgeIndianRupee, Banknote, BanknoteArrowDown, BanknoteArrowUp, CheckCheckIcon, Clock, PieChart, ShoppingCart, Truck, Users } from 'lucide-angular';
import { DrawerService } from '../../../layouts/components/drawer/drawerService';
import { StandardTableComponent } from "../../../layouts/components/standard-table/standard-table.component";
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { InvoiceFilterModal, InvoiceModal } from './invoice.modal';
import { PaymentService } from '../payments/payment.service';
import { InvoicePaymentSummaryModal } from '../payments/payment.modal';
import { ModalService } from '../../../layouts/components/modal/modalService';
import { PaymentSymmaryComponent } from '../payments/payment-symmary/payment-symmary.component';
import { DateRangeEmit } from '../../../layouts/UI/date-picker/date-picker.component';
import { StatCardConfig, StatGroupComponent } from "../../../layouts/UI/stat-group/stat-group.component";
import { INVOICE_ACTIONS, INVOICE_COLUMNS, INVOICE_DATE_CONFIG, INVOICE_FILTER_OPTIONS } from '../salesConfig';
import { ConfirmationModalService } from '../../../layouts/UI/confirmation-modal/confirmation-modal.service';
import { InvoiceFormComponent } from './invoice-form/invoice-form.component';
import { SalesReturnformComponent } from '../sales-returns/sales-returnform/sales-returnform.component';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { OrderTrackerComponent } from '../../../layouts/components/order-tracker/order-tracker.component';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, StandardTableComponent, StatGroupComponent],
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.css']
})
export class InvoicesComponent {

  @Input() statGroup?: boolean = true;
  @Input() customerId?: number;
  invoicesList: InvoiceModal[] = [];
  invoicesFilter: InvoiceFilterModal = new InvoiceFilterModal();
  paymentSummary: InvoicePaymentSummaryModal[] = [];
  private tableState$ = new Subject<void>();

  columns: TableColumn[] = INVOICE_COLUMNS;
  paymentDetailsActions = INVOICE_ACTIONS;
  invFilterOptions = INVOICE_FILTER_OPTIONS;
  dateConfig = INVOICE_DATE_CONFIG;

  isLoading: boolean = false;

  readonly Truck = Truck;
  pagination: PaginationConfig = { pageSize: 20, currentPage: 1, totalItems: 0 };

  constructor(
    private invoiceService: InvoiceService,
    private paymentService: PaymentService,
    public drawerService: DrawerService,
    private toastSvc: ToastService,
    private router: Router,
    private loaderSvc: LoaderService,
    private modalService: ModalService,
    private drawerSvc: DrawerService,
    private confirmationModalService: ConfirmationModalService
  ) {
  }

  ngOnInit(): void {
    if (this.customerId) {
      this.invoicesFilter.customerId = this.customerId;
    }
    this.setupTablePipeline();
    this.tableState$.next();
  }

  private setupTablePipeline() {
    this.tableState$.pipe(
      debounceTime(300),
    ).subscribe(() => {
      this.getAllInvoices();
      this.getInvoiceStats();
    });
  }

  getAllInvoices() {
    this.isLoading = true;
    const apiPage = this.pagination.currentPage > 0 ? this.pagination.currentPage - 1 : 0;
    this.invoiceService.getInvoices(
      apiPage,
      this.pagination.pageSize,
      this.invoicesFilter,
      (response: any) => {
        this.invoicesList = response.data.content;
        this.pagination = {
          currentPage: this.pagination.currentPage,
          totalItems: response.data.totalElements,
          pageSize: response.data.size
        };
        this.isLoading = false;
      },
      (error: any) => {
        this.isLoading = false;
        this.toastSvc.show('Failed to load Items', 'error');
        console.error('Error fetching items:', error);
      }
    );
  }



  handleTableAction(event: TableAction) {
    if (event.type === 'custom' && event.key === 'payment_details') {
      console.log(event)
      this.openPaymentSummary(event.row.id, event.row['customerId']);
    }
    if (event.type === 'custom' && event.key === 'receive_payment') {
      this.openPaymentSummary(event.row.id, event.row['customerId']);
      this.tableState$.next();
    }
    if (event.type === 'custom' && event.key === 'download_invoice') {
      this.downloadInvoicePdf(event.row.id);
    }
    if (event.type === 'custom' && event.key === 'sales_return') {
      this.openSalesReturnForm(event.row.id);
    }
    if (event.type === 'custom' && event.key === 'view_invoice') {
      this.openOrderTracker(event.row.id);
    }
    if (event.type === 'edit') {
      // Standard edit logic
    }
  }

  editInvoice(invoiceId: any) {
    this.router.navigate(['/sales/invoice/edit'], {
      queryParams: { invoiceId: invoiceId }
    });
  }

  openOrderTracker(invoiceNumber: any) {
    this.drawerSvc.openComponent(
      OrderTrackerComponent,
      { invoiceNumber: invoiceNumber },
      'Order Details',
      'xl',
    );
  }

  getPaymentsByInvoiceId(invoiceId: any) {
    this.paymentService.getPaymentSummaryByInvoiceId(
      invoiceId,
      (response: any) => {
        this.paymentSummary = response.data;

        console.log('Payments for invoice:', response);
      },
      (error: any) => {
        this.toastSvc.show('Failed to load Payments', 'error');
        console.error('Error fetching payments:', error);
      }
    );
  }

  getInvoiceStats() {
    this.invoiceService.getInvoiceStats(
      this.invoicesFilter,
      (response: any) => {
        this.invoiceDashboardStats = [
          {
            key: 'totalInvoices',
            label: 'Total Invoice Value',
            value: '₹ ' + response.data.totalInvoiceValue,
            icon: BadgeIndianRupee,
            color: 'emerald',
          },
          {
            key: 'collected',
            label: 'Collected Amount',
            value: '₹ ' + response.data.collectedAmount,
            icon: BanknoteArrowUp,
            color: 'blue',
          },
          {
            key: 'uncollected',
            label: 'Uncollected Amount',
            value: '₹ ' + response.data.uncollectedAmount,
            icon: BanknoteArrowDown,
            color: 'orange',
          },
          {
            key: 'pendingInvoices',
            label: 'Pending Invoices',
            value: response.data.pendingCount + ' Orders',
            icon: Clock,
            color: 'amber',
          }]
      },
      (error: any) => {
        console.error('Error fetching invoice stats:', error);
      }
    );
  }

  openPaymentSummary(invoiceId: any, customerId: any) {
    this.modalService.openComponent(
      PaymentSymmaryComponent,
      { invoiceId, customerId },
      'lg'
    );
  }

  openInvoiceForm(invoiceId: any) {
    this.drawerSvc.openComponent(
      InvoiceFormComponent,
      { id: invoiceId },
      'Create Invoice',
      '2xl'
    );
  }

  openSalesReturnForm(invoiceId: any) {
    this.drawerSvc.openComponent(
      SalesReturnformComponent,
      { invoiceId: invoiceId },
      'Create Sales Return',
      '2xl'
    );
  }

  onSearchChange(searchQuery: string) {
    this.invoicesFilter.searchQuery = searchQuery?.trim() || undefined;
    this.pagination.currentPage = 1;
    this.tableState$.next();
  }

  downloadInvoicePdf(invoiceId: any) {
    this.loaderSvc.show();
    this.invoiceService.downloadInvoicePdf(invoiceId,
      (response: any) => {
        this.loaderSvc.hide();
        const blob = new Blob([response.body], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(
          url,
          'invoicePopup',
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


  confirmAndUpdateStatus(invoiceId: any, status: string) {
    const action = status === 'APPROVED' ? 'Approve' : 'Reject';
    this.confirmationModalService.open({
      title: `${action} Invoice`,
      message: `Are you sure you want to ${action.toLowerCase()} this invoice?`,
      intent: status === 'APPROVED' ? 'success' : 'danger',
      confirmLabel: `Yes, ${action}`,
      cancelLabel: 'No, Cancel'
    }).then(confirmed => {
      if (confirmed) {
        this.updateInvoiceStatus(invoiceId, status);
      }
    });
  }

  updateInvoiceStatus(invoiceId: any, status: string) {
    this.loaderSvc.show();
    this.invoiceService.updateInvoiceStatus(
      invoiceId,
      status,
      (response: any) => {
        this.loaderSvc.hide();
        this.toastSvc.show('Invoice status updated to ' + status, 'success');
        this.tableState$.next();
      },
      (error: any) => {
        this.loaderSvc.hide();
        this.toastSvc.show('Failed to update invoice status', 'error');
        console.error('Error updating invoice status:', error);
      }
    );
  }

  onTableAction(event: TableAction) {
    const { type, row, key } = event;

    switch (type) {
      case 'view':
        console.log("View:", row.id);
        break;
      case 'edit':
        if (this.customerId) {
          this.openInvoiceForm(row.id);
        } else {
          this.editInvoice(row.id);
        }
        break;
      case 'delete':
        console.log("Delete:", row.id);
        break;
      case 'toggle':
        break;
    }
  }

  onPageChange(newPage: number) {
    this.pagination = { ...this.pagination, currentPage: newPage };
    this.tableState$.next();
  }

  onLoadMore() {
    console.log('Load more triggered');
  }


  onFilterDate(range: DateRangeEmit) {
    console.log('Filter table by:', range.from, range.to);
    this.invoicesFilter.fromDate = range.from
      ? this.formatDate(range.from)
      : null;

    this.invoicesFilter.toDate = range.to
      ? this.formatDate(range.to)
      : null;
    this.tableState$.next();
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  onFilterUpdate($event: Record<string, any>) {
    console.log("Received filter update:", $event);
    this.invoicesFilter.invStatuses = $event['status'] || null;
    this.invoicesFilter.paymentStatus = $event['paymentStatus'] || null;
    this.tableState$.next();
  }


  invoiceDashboardStats: StatCardConfig[] = [
    {
      key: 'totalInvoices',
      label: 'Total Invoice Value',
      value: '$45,780',
      icon: BadgeIndianRupee,
      color: 'emerald',
    },
    {
      key: 'collected',
      label: 'Collected Amount',
      value: '$32,420',
      icon: BanknoteArrowUp,
      color: 'blue',
    },
    {
      key: 'uncollected',
      label: 'Uncollected Amount',
      value: '$13,360',
      icon: BanknoteArrowDown,
      color: 'orange',
    },
    {
      key: 'pendingInvoices',
      label: 'Pending Invoices',
      value: '28',
      icon: Clock,
      color: 'amber',
    }
  ];

}