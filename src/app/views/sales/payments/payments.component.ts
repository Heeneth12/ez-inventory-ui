import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ModalService } from '../../../layouts/components/modal/modalService';
import { Router } from '@angular/router';
import { LoaderService } from '../../../layouts/components/loader/loaderService';
import { PaginationConfig, TableColumn, TableAction, TableActionConfig } from '../../../layouts/components/standard-table/standard-table.model';
import { ToastService } from '../../../layouts/components/toast/toastService';
import { PaymentService } from './payment.service';
import { StandardTableComponent } from "../../../layouts/components/standard-table/standard-table.component";
import { Banknote, PieChart, ScrollText, ShoppingCart, Users } from 'lucide-angular';
import { DrawerService } from '../../../layouts/components/drawer/drawerService';
import { PaymentModal, PaymentFilterModal } from './payment.modal';
import { StatCardConfig, StatGroupComponent } from "../../../layouts/UI/stat-group/stat-group.component";
import { PAYMENTS_ACTIONS, PAYMENTS_COLUMNS, PAYMENTS_DATE_CONFIG, PAYMENTS_FILTER_OPTIONS } from '../salesConfig';
import { DatePickerConfig, DateRangeEmit } from '../../../layouts/UI/date-picker/date-picker.component';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, StandardTableComponent, StatGroupComponent],
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.css'
})
export class PaymentsComponent {

  @Input() statGroup?: boolean = true;
  @Input() customerId?: number;
  paymentList: PaymentModal[] = [];
  paymentDetails: PaymentModal | null = null;

  pagination: PaginationConfig = { pageSize: 15, currentPage: 1, totalItems: 0 };
  isLoading = false;
  selectedItemIds: (string | number)[] = [];

  columns: TableColumn[] = PAYMENTS_COLUMNS;
  filterOptions = PAYMENTS_FILTER_OPTIONS;
  dateConfig: DatePickerConfig = PAYMENTS_DATE_CONFIG;
  payActions = PAYMENTS_ACTIONS;
  paymentFilter: PaymentFilterModal = new PaymentFilterModal();


  constructor(
    private paymentService: PaymentService,
    private router: Router,
    private toastService: ToastService,
    private loaderSvc: LoaderService,
    private drawerService: DrawerService,
    private modalService: ModalService
  ) {
  }

  ngOnInit(): void {
    if (this.customerId) {
      //this.salesOrderFilter.customerId = this.customerId;
    }
    this.getAllPayments();
  }

  getAllPayments() {
    this.loaderSvc.show();
    const apiPage = this.pagination.currentPage > 0 ? this.pagination.currentPage - 1 : 0;
    this.paymentService.getAllPayments(
      apiPage,
      this.pagination.pageSize,
      this.paymentFilter,
      (response: any) => {
        this.paymentList = response.data.content;
        this.pagination = {
          currentPage: this.pagination.currentPage,
          totalItems: response.data.totalElements,
          pageSize: response.data.size
        };
        this.loaderSvc.hide();
      },
      (error: any) => {
        this.loaderSvc.hide();
        this.toastService.show('Failed to load Payments', 'error');
        console.error('Error fetching payments:', error);
      }
    );
  }

  getPaymentDetailsById(paymentId: string | number) {
    this.paymentService.getPagetPaymentSummaryById(paymentId,
      (response: any) => {
        this.paymentDetails = response.data;
      },
      (error: any) => {
        this.toastService.show("", 'error')
      }
    );
  }


  onSelectionChange(selectedIds: (string | number)[]) {
    this.selectedItemIds = selectedIds;
    console.log("Current Selection:", this.selectedItemIds);
  }


  handleTableAction(event: TableAction) {
    if (event.type === 'custom' && event.key === 'payment_details') {
      this.getPaymentDetailsById(event.row.id);

    }
    if (event.type === 'custom' && event.key === 'download_receipt') {
      this.downloadReceiptPdf(event.row.id);
    }
  }

  downloadReceiptPdf(paymentId: any) {
    this.loaderSvc.show();
    this.paymentService.downloadPaymentPdf(paymentId,
      (response: any) => {
        this.loaderSvc.hide();
        const blob = new Blob([response.body], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(
          url,
          'ReceiptPopup',
          'width=900,height=800,top=50,left=100,toolbar=no,menubar=no,scrollbars=yes,resizable=yes'
        );
      },
      (error: any) => {
        this.loaderSvc.hide();
        this.toastService.show('Failed to download PDF', 'error');
        console.error('Error downloading PDF:', error);
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
    this.getAllPayments();
  }

  onLoadMore() {
  }

  onFilterDate(range: DateRangeEmit) {
    console.log('Filter table by:', range.from, range.to);
    this.paymentFilter.fromDate = range.from
      ? (this.formatDate(range.from) as any)
      : null;

    this.paymentFilter.toDate = range.to
      ? (this.formatDate(range.to) as any)
      : null;
    this.getAllPayments();
  }

  onFilterUpdate($event: Record<string, any>) {
    console.log("Received filter update:", $event);
    this.paymentFilter.paymentStatus = $event['paymentStatus'] || null;
    this.paymentFilter.paymentMethod = $event['paymentMethod'] || null;
    this.getAllPayments();
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  dashboardStats: StatCardConfig[] = [
    {
      key: 'revenue',
      label: 'Revenue this month',
      value: '$10,398',
      color: 'emerald',
      icon: Banknote,
      trend: { value: '+$498', isUp: true }
    },
    {
      key: 'profit',
      label: 'Profit this month',
      value: '$3,982',
      icon: PieChart,
      color: 'gray',
      trend: { value: '+$198', isUp: true }
    },
    {
      key: 'orders',
      label: 'Total Orders',
      value: '1,248',
      icon: ShoppingCart,
      color: 'gray',
      trend: { value: '+86', isUp: true }
    },
    {
      key: 'customers',
      label: 'New Customers',
      value: '342',
      icon: Users,
      color: 'gray',
      trend: { value: '-12', isUp: false }
    }
  ];
}
