import { Component } from '@angular/core';
import { InvoiceService } from './invoice.service';
import { ToastService } from '../../../layouts/components/toast/toastService';
import { LoaderService } from '../../../layouts/components/loader/loaderService';
import { PaginationConfig, TableAction, TableActionConfig, TableColumn } from '../../../layouts/components/standard-table/standard-table.model';
import { Router } from '@angular/router';
import { ArrowRight, Truck } from 'lucide-angular';
import { DrawerService } from '../../../layouts/components/drawer/drawerService';
import { StandardTableComponent } from "../../../layouts/components/standard-table/standard-table.component";
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { InvoiceModal } from './invoice.modal';
import { PaymentService } from '../payments/payment.service';
import { InvoicePaymentSummaryModal } from '../payments/payment.modal';
import { ModalService } from '../../../layouts/components/modal/modalService';
import { PaymentSymmaryComponent } from '../payments/payment-symmary/payment-symmary.component';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, StandardTableComponent],
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.css']
})
export class InvoicesComponent {

  invoicesList: InvoiceModal[] = [];
  paymentSummary: InvoicePaymentSummaryModal[] = [];

  readonly Truck = Truck;
  pagination: PaginationConfig = { pageSize: 20, currentPage: 1, totalItems: 0 };

  columns: TableColumn[] = [
    { key: 'invoiceNumber', label: 'Invoice No', width: '130px', type: 'link' },
    { key: 'salesOrderId', label: 'SO ID', width: '100px', type: 'text' },
    { key: 'customerName', label: 'Customer', width: '220px', type: 'text' },
    { key: 'invoiceDate', label: 'Invoice Date', width: '130px', type: 'date', align: 'center' },
    { key: 'grandTotal', label: 'Amount', width: '120px', type: 'currency', align: 'right' },
    { key: 'totalDiscount', label: "Dis %", width: '120px', type: 'currency', align: 'right' },
    { key: 'status', label: 'Status', width: '140px', type: 'badge' },
    { key: 'amountPaid', label: 'Paid Amount', width: '130px', type: 'currency', align: 'right' },
    { key: 'balance', label: 'Balance', width: '130px', type: 'currency', align: 'right' },
    { key: 'grandTotal', label: 'Total Amount', width: '130px', type: 'currency', align: 'right' },
    { key: 'actions', label: 'Actions', width: '120px', type: 'action', align: 'center', sortable: false }
  ];

  soActions: TableActionConfig[] = [
    {
      key: 'move_to_delivery',
      label: 'Move to Delivery',
      icon: Truck,
      color: 'primary',
      // Only show if status is Approved
      condition: (row) => row['status'] !== 'FULLY_INVOICED'
    }
  ];

  constructor(
    private invoiceService: InvoiceService,
    private paymentService: PaymentService,
    public drawerService: DrawerService,
    private toastSvc: ToastService,
    private router: Router,
    private loaderSvc: LoaderService,
    private modalService: ModalService
  ) {
  }

  ngOnInit(): void {
    this.getAllInvoices();
  }

  getAllInvoices() {
    this.loaderSvc.show();
    const apiPage = this.pagination.currentPage > 0 ? this.pagination.currentPage - 1 : 0;
    this.invoiceService.getInvoices(
      apiPage,
      this.pagination.pageSize,
      {},
      (response: any) => {
        this.invoicesList = response.data.content;
        this.pagination = {
          currentPage: this.pagination.currentPage,
          totalItems: response.data.totalElements,
          pageSize: response.data.size
        };
        this.loaderSvc.hide();
      },
      (error: any) => {
        this.loaderSvc.hide();
        this.toastSvc.show('Failed to load Items', 'error');
        console.error('Error fetching items:', error);
      }
    );
  }



  handleTableAction(event: TableAction) {
    if (event.type === 'custom' && event.key === 'move_to_invoice') {
      console.log(':', event.row);
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

  getPaymentsByInvoiceId(invoiceId: any) {
    this.paymentService.getPaymentSummary(
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

  openPaymentSummary(invoiceId: any) {
    this.modalService.openComponent(
      PaymentSymmaryComponent,
      { invoiceId },
      'lg'
    );
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

  onTableAction(event: TableAction) {
    const { type, row, key } = event;

    switch (type) {
      case 'view':
        this.openPaymentSummary(row.id);
        console.log("View:", row.id);
        break;
      case 'edit':
        this.editInvoice(row.id);
        console.log("Edit:", row.id);
        break;
      case 'delete':
        this.downloadInvoicePdf(row.id);
        console.log("Delete:", row.id);
        break;
      case 'toggle':
        break;
    }
  }

  onPageChange(newPage: number) {
    this.pagination = { ...this.pagination, currentPage: newPage };
    this.getAllInvoices();
  }

  onLoadMore() {
    console.log('Load more triggered');
  }
}
