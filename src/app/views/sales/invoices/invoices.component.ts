import { Component } from '@angular/core';
import { InvoiceService } from './invoice.service';
import { ToastService } from '../../../layouts/components/toast/toastService';
import { LoaderService } from '../../../layouts/components/loader/loaderService';
import { PaginationConfig, TableAction, TableActionConfig, TableColumn } from '../../../layouts/components/standard-table/standard-table.model';
import { Router } from '@angular/router';
import { ArrowRight, FileDown, ReceiptIndianRupee, ScrollText, Truck } from 'lucide-angular';
import { DrawerService } from '../../../layouts/components/drawer/drawerService';
import { StandardTableComponent } from "../../../layouts/components/standard-table/standard-table.component";
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { InvoiceModal, InvoiceStatus } from './invoice.modal';
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
    { key: 'contactMini', label: 'Customer', width: '100px', type: 'fullProfile', align: 'left' },
    { key: 'invoiceNumber', label: 'Invoice No', width: '130px', type: 'link' },
    { key: 'invoiceDate', label: 'Inv-Date', width: '130px', type: 'date', align: 'center' },
    { key: 'grandTotal', label: 'Amount', width: '120px', type: 'currency', align: 'right' },
    { key: 'totalDiscount', label: "Dis %", width: '120px', type: 'currency', align: 'right' },
    { key: 'status', label: 'Status', width: '140px', type: 'badge' },
    { key: 'paymentStatus', label: 'Pay-Status', width: '140px', type: 'badge' },
    { key: 'amountPaid', label: 'Paid Amt', width: '130px', type: 'currency', align: 'right' },
    { key: 'balance', label: 'Balance', width: '130px', type: 'currency', align: 'right' },
    { key: 'grandTotal', label: 'Total Amt', width: '130px', type: 'currency', align: 'right' },
    { key: 'actions', label: 'Actions', width: '120px', type: 'action', align: 'center', sortable: false }
  ];

  paymentDetailsActions: TableActionConfig[] = [
    {
      key: 'payment_details',
      label: 'Payment details',
      icon: ScrollText,
      color: 'success',
      // Only show if status is Approved
      condition: (row) => row['paymentStatus'] === 'PAID'
    },
    {
      key: 'receive_payment',
      label: 'Receive Payment',
      icon: ReceiptIndianRupee,
      color: 'primary',
      // Only show if status is Approved
      condition: (row) => row['paymentStatus'] === 'UNPAID' || row['paymentStatus'] === 'PARTIALLY_PAID'
    },
    {
      key: 'download_invoice',
      label: 'Download',
      icon: FileDown,
      color: 'neutral',
      // Only show if status is Approved
      condition: (row) => true
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
    if (event.type === 'custom' && event.key === 'payment_details') {
      this.openPaymentSummary(event.row.id);
    }
    if (event.type === 'custom' && event.key === 'receive_payment') {
      this.openPaymentSummary(event.row.id);
      this.getAllInvoices();
    }
    if (event.type === 'custom' && event.key === 'download_invoice') {
      this.downloadInvoicePdf(event.row.id);
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

  updateInvoiceStatus(invoiceId: any, status: InvoiceStatus) {
    this.loaderSvc.show();
    this.invoiceService.updateInvoiceStatus(
      {
        "invoiceId": invoiceId,
        "status": status
      },
      (response: any) => {
        this.loaderSvc.hide();
        this.getAllInvoices();
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
        this.editInvoice(row.id);
        console.log("Edit:", row.id);
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
    this.getAllInvoices();
  }

  onLoadMore() {
    console.log('Load more triggered');
  }
}
