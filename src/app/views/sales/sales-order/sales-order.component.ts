import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { StandardTableComponent } from "../../../layouts/components/standard-table/standard-table.component";
import { SalesOrderFilterModal, SalesOrderModal } from './sales-order.modal';
import { Router } from '@angular/router';
import { DrawerService } from '../../../layouts/components/drawer/drawerService';
import { PaginationConfig, TableAction, TableActionConfig } from '../../../layouts/components/standard-table/standard-table.model';
import { ToastService } from '../../../layouts/components/toast/toastService';
import { SalesOrderService } from './sales-order.service';
import { ArrowRight, BadgeIndianRupee, Clock, FileText, ListCheck, ListChevronsUpDown, XCircle } from 'lucide-angular';
import { LoaderService } from '../../../layouts/components/loader/loaderService';
import { DatePickerConfig, DateRangeEmit } from '../../../layouts/UI/date-picker/date-picker.component';
import { OrderTrackerComponent } from '../../../layouts/components/order-tracker/order-tracker.component';
import { StatCardConfig, StatGroupComponent } from '../../../layouts/UI/stat-group/stat-group.component';
import { SALES_ORDER_ACTIONS, SALES_ORDER_COLUMNS, SALES_ORDER_DATE_CONFIG, SALES_ORDER_FILTER_OPTIONS } from '../salesConfig';
import { ConfirmationModalService } from '../../../layouts/UI/confirmation-modal/confirmation-modal.service';
import { SalesOrderFormComponent } from './sales-order-form/sales-order-form.component';
import { debounceTime, Subject } from 'rxjs';
import { InvoiceFormComponent } from '../invoices/invoice-form/invoice-form.component';

@Component({
  selector: 'app-sales-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, StandardTableComponent, StatGroupComponent],
  templateUrl: './sales-order.component.html',
  styleUrls: ['./sales-order.component.css']
})
export class SalesOrderComponent implements OnInit {

  @Input() customerId?: number;
  @Input() statGroup?: boolean = true;

  @ViewChild('soDetails') soDetails!: TemplateRef<any>;
  readonly ArrowRight = ArrowRight;

  soColumn = SALES_ORDER_COLUMNS;
  soActions: TableActionConfig[] = SALES_ORDER_ACTIONS;
  soFilterOptions = SALES_ORDER_FILTER_OPTIONS;
  dateConfig: DatePickerConfig = SALES_ORDER_DATE_CONFIG;

  salesOrders: SalesOrderModal[] = [];
  salesOrderDetail: SalesOrderModal | null = null;
  salesOrderFilter: SalesOrderFilterModal = new SalesOrderFilterModal();
  isLoading = false;

  private tableState$ = new Subject<void>();

  pagination: PaginationConfig = { pageSize: 20, currentPage: 1, totalItems: 0 };

  // DUMMY STATS DATA
  salesOrderStats: StatCardConfig[] = [
    {
      key: 'totalValue',
      label: 'Total Sales Order Value',
      value: '₹0.00',
      icon: ListCheck,
      color: 'emerald',
    },
    {
      key: 'totalSOConvertedValue',
      label: 'Total SO Converted Value',
      value: '₹0.00',
      icon: BadgeIndianRupee,
      color: 'emerald',
    },
    {
      key: 'pendingInvoice',
      label: 'Pending Invoice',
      value: '0 Orders',
      icon: FileText,
      color: 'amber',
    },
    {
      key: 'cancelled',
      label: 'Cancelled Orders',
      value: '0',
      icon: XCircle,
      color: 'orange',
    }
  ];

  constructor(
    private salesOrderService: SalesOrderService,
    public drawerService: DrawerService,
    private toastSvc: ToastService,
    private router: Router,
    private loaderSvc: LoaderService,
    private drawerSvc: DrawerService,
    private confirmationModalService: ConfirmationModalService
  ) {
  }

  ngOnInit(): void {
    this.setupTablePipeline();
    if (this.customerId) {
      this.salesOrderFilter.customerId = this.customerId;
    }
    this.tableState$.next();
    this.getSalesOrderStats();
  }

  private setupTablePipeline() {
    this.tableState$.pipe(
      debounceTime(300),
    ).subscribe(() => {
      this.getAllSalesOrders();
    });
  }

  getAllSalesOrders() {
    this.isLoading = true;
    const apiPage = this.pagination.currentPage > 0 ? this.pagination.currentPage - 1 : 0;
    this.salesOrderService.getAllSalesOrders(
      apiPage,
      this.pagination.pageSize,
      this.salesOrderFilter,
      (response: any) => {
        this.salesOrders = response.data.content;
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

  getSalesOrderById(id: number | string) {
    this.salesOrderService.getSalesOrderById(
      Number(id),
      (response: any) => {
        this.salesOrderDetail = response.data;
        console.log('Sales Order Details:', response.data);
      }
      ,
      (error: any) => {
        this.toastSvc.show('Failed to load Sales Order details', 'error');
        console.error('Error fetching Sales Order details:', error);
      }
    );
  }

  getSalesOrderStats() {
    this.salesOrderService.getSalesOrderStats(
      {},
      (response: any) => {
        this.salesOrderStats = [
          {
            key: 'totalValue',
            label: 'Total Sales Order Value',
            value: '₹' + response.data.totalValue,
            icon: ListCheck,
            color: 'emerald',
          },
          {
            key: 'totalSOConvertedValue',
            label: 'Total SO Converted Value',
            value: '₹ ' + response.data.convertedSalesValue,
            icon: BadgeIndianRupee,
            color: 'emerald',
          },
          {
            key: 'pendingApproval',
            label: 'Pending Approval',
            value: response.data.pendingApprovalCount + ' Orders',
            icon: Clock,
            color: 'amber',
          },
          {
            key: 'cancelled',
            label: 'Cancelled Orders',
            value: response.data.cancelledCount,
            icon: XCircle,
            color: 'orange',
          }
        ];
        console.log('Sales Order Stats:', response.data);
      }
      ,
      (error: any) => {
        this.toastSvc.show('Failed to load Sales Order stats', 'error');
        console.error('Error fetching Sales Order stats:', error);
      }
    );
  }

  confirmAndUpdateStatus(salesOrderId: any, status: string) {
    const action = status === 'APPROVED' ? 'Approve' : 'Cancel';
    this.confirmationModalService.open({
      title: `${action} Sales Order`,
      message: `Are you sure you want to ${action.toLowerCase()} this sales order?`,
      intent: status === 'APPROVED' ? 'success' : 'danger',
      confirmLabel: `Yes, ${action}`,
      cancelLabel: 'No, Cancel'
    }).then(confirmed => {
      if (confirmed) {
        this.updateSalesOrderStatus(salesOrderId, status);
      }
    });
  }

  updateSalesOrderStatus(salesOrderId: any, status: string) {
    this.loaderSvc.show();
    this.salesOrderService.updateSalesOrderStatus(
      salesOrderId,
      status,
      (response: any) => {
        this.loaderSvc.hide();
        this.toastSvc.show('Sales Order status updated to ' + status, 'success');
        this.getAllSalesOrders();
      }
      ,
      (error: any) => {
        this.loaderSvc.hide();
        this.toastSvc.show('Failed to update Sales Order status', 'error');
        console.error('Error updating Sales Order status:', error);
      }
    );
  }

  viewSalesOrderDetail(id: number | string) {
    this.getSalesOrderById(id);
    this.drawerService.openComponent(
      OrderTrackerComponent,
      { salesOrderId: id },
      'Order Details',
      'xl',
    );
  }

  updateSalesOrderFormMiniForm(soId: any) {
    this.drawerSvc.openComponent(
      SalesOrderFormComponent,
      { id: soId },
      'Update Sales Order',
      '2xl'
    );
  }

  updateSalesOrder(id: number | string) {
    this.router.navigate(['/sales/order/edit', id]);
  }

  handleTableAction(event: TableAction) {
    if (event.type === 'custom' && event.key === 'move_to_invoice') {
      if (this.customerId) {
        this.openInvoiceForm(event.row.id);
      } else {
        this.router.navigate(['/sales/invoice/create'], {
          queryParams: { salesOrderId: event.row.id }
        });
      }
    }
    if (event.type === 'custom' && event.key === 'move_to_cancle') {
      this.confirmAndUpdateStatus(event.row.id, 'CANCELLED');
    }
    if (event.type === 'custom' && event.key === 'view_sales_order') {
      this.openOrderTracker(event.row.id);
    }
  }

  openOrderTracker(soId: any) {
    this.drawerSvc.openComponent(
      OrderTrackerComponent,
      { salesOrderId: soId },
      'Order Details',
      'xl',
    );
  }


  openInvoiceForm(soId: any) {
    this.drawerSvc.openComponent(
      InvoiceFormComponent,
      { salesOrderId: soId },
      'Create Invoice',
      '2xl'
    );
  }

  onTableAction(event: TableAction) {
    const { type, row, key } = event;

    switch (type) {
      case 'view':
        console.log("View:", row.id);
        this.openOrderTracker(row.id);
        break;
      case 'edit':
        if (this.customerId) {
          this.updateSalesOrderFormMiniForm(row.id);
        } else {
          this.updateSalesOrder(row.id);
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

  onFilterDate(range: DateRangeEmit) {
    console.log('Filter table by:', range.from, range.to);
    this.salesOrderFilter.fromDate = range.from
      ? this.formatDate(range.from)
      : null;

    this.salesOrderFilter.toDate = range.to
      ? this.formatDate(range.to)
      : null;
    this.pagination.currentPage = 1;
    this.tableState$.next();
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  onFilterUpdate($event: Record<string, any>) {
    console.log("Received filter update:", $event);
    this.salesOrderFilter.soStatuses = $event['status'] || null;
    this.salesOrderFilter.soSource = $event['source'] || null;
    this.pagination.currentPage = 1;
    this.tableState$.next();
  }

  onSearchChange(searchQuery: string) {
    this.salesOrderFilter.searchQuery = searchQuery;
    this.pagination.currentPage = 1;
    this.tableState$.next();
  }

  onLoadMore() {
    console.log('Load more triggered');
  }
}
