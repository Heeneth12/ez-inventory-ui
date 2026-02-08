import { Component, TemplateRef, ViewChild } from '@angular/core';
import { StandardTableComponent } from "../../../layouts/components/standard-table/standard-table.component";
import { NEW_ORDERS_COLUMN, NEW_ORDERS_ACTIONS, NEW_ORDERS_DATE_CONFIG, filterConfig } from '../vendorConfig';
import { TableColumn, TableActionConfig, PaginationConfig, TableAction } from '../../../layouts/components/standard-table/standard-table.model';
import { DatePickerConfig, DateRangeEmit } from '../../../layouts/UI/date-picker/date-picker.component';
import { PurchaseRequestModel } from '../../purchases/models/prq.model';
import { VendorService } from '../vendor.service';
import { Router } from '@angular/router';
import { DrawerService } from '../../../layouts/components/drawer/drawerService';
import { LoaderService } from '../../../layouts/components/loader/loaderService';
import { ModalService } from '../../../layouts/components/modal/modalService';
import { ToastService } from '../../../layouts/components/toast/toastService';
import { LucideAngularModule, Search, ShoppingBag } from 'lucide-angular';
import { CommonModule } from '@angular/common';
import { FilterOption } from '../../../layouts/UI/filter-dropdown/filter-dropdown.component';
import { ConfirmationModalService } from '../../../layouts/UI/confirmation-modal/confirmation-modal.service';

@Component({
  selector: 'app-new-orders',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, StandardTableComponent],
  templateUrl: './new-orders.component.html',
  styleUrl: './new-orders.component.css'
})
export class NewOrdersComponent {

  readonly ShoppingBag = ShoppingBag;
  readonly SearchIcon = Search;

  //config
  columns: TableColumn[] = NEW_ORDERS_COLUMN
  newOrdersActions: TableActionConfig[] = NEW_ORDERS_ACTIONS
  filterConfig: FilterOption[] = filterConfig
  dateConfig: DatePickerConfig = NEW_ORDERS_DATE_CONFIG


  @ViewChild('prqSummary') prqSummary!: TemplateRef<any>;
  @ViewChild('conformationModal') conformationModal!: TemplateRef<any>;
  purchaseRequestList: PurchaseRequestModel[] = [];
  purchaseRequestDetails: PurchaseRequestModel | null = null;
  purchaseRequestfilter: any = {};

  pagination: PaginationConfig = { pageSize: 15, currentPage: 1, totalItems: 0 };
  isLoading = false;
  selectedItemIds: (string | number)[] = [];


  constructor(
    private vendorService: VendorService,
    private router: Router,
    private modalService: ModalService,
    private toastService: ToastService,
    private loaderSvc: LoaderService,
    private drawerService: DrawerService,
    private confirmationModalService: ConfirmationModalService
  ) {
  }

  ngOnInit(): void {
    this.getAllPRQ();
  }

  getAllPRQ() {
    this.loaderSvc.show();
    const apiPage = this.pagination.currentPage > 0 ? this.pagination.currentPage - 1 : 0;
    this.vendorService.getAllPrqs(
      apiPage,
      this.pagination.pageSize,
      {},
      (response: any) => {
        this.purchaseRequestList = response.data.content;
        this.pagination = {
          currentPage: this.pagination.currentPage,
          totalItems: response.data.totalElements,
          pageSize: response.data.size
        };
        this.loaderSvc.hide();
      },
      (error: any) => {
        this.loaderSvc.hide();
        this.toastService.show('Failed to load Items', 'error');
        console.error('Error fetching items:', error);
      }
    );
  }


  getPrqById(prqId: number) {
    this.vendorService.getPrqById(
      prqId,
      (response: any) => {
        this.purchaseRequestDetails = response.data;
      },
      (error: any) => {
        this.toastService.show("", 'error')
      }
    )
  }

  viewPrqDetails(poId: any) {
    this.getPrqById(poId);
    this.drawerService.openTemplate(
      this.prqSummary,
      'PO Summary',
      "lg"
    );
  }

  cancelOrderConfirmation(poId: any) {
    this.confirmationModalService.open({
      title: 'Cancel Order',
      message: 'Are you sure you want to cancel this order? This action cannot be undone.',
      intent: 'danger',
      confirmLabel: 'Yes, Cancel',
      cancelLabel: 'No, Keep'
    }).then(confirmed => {
      if (confirmed) {
        this.cancelOrder(poId);
      }
    });
  }

  cancelOrder(poId: any) {
    this.vendorService.updatePrqStatus( 
      poId,
      'REJECTED',
      (response: any) => {
        this.toastService.show('Order cancelled successfully', 'success');
        this.getAllPRQ();
      },
      (error: any) => {
        this.toastService.show('Failed to cancel order', 'error');
        console.error('Error cancelling order:', error);
      }
    );
  }

  onFilterUpdate($event: Record<string, any>) {
    console.log("Received filter update:", $event);
  }

  handleTableAction(event: TableAction) {
    if (event.type === 'custom' && event.key === 'edit_details') {
    }
    if (event.type === 'custom' && event.key === 'view_details') {
      this.viewPrqDetails(event.row.id);
    }
    if (event.type === 'custom' && event.key === 'cancel_order') {
      this.cancelOrderConfirmation(event.row.id);
    }
  }

  onTableAction(event: TableAction) {
    const { type, row, key } = event;
    switch (type) {
      case 'view':
        break;
      case 'edit':
        break;
      case 'delete':
        break;
      case 'toggle':
        break;
    }
  }

  onPageChange(newPage: number) {
    this.pagination = { ...this.pagination, currentPage: newPage };
  }

  onLoadMore() {
  }

  onFilterDate(range: DateRangeEmit) {
    console.log('Filter table by:', range.from, range.to);
    this.purchaseRequestfilter.fromDate = range.from
      ? this.formatDate(range.from)
      : null;

    this.purchaseRequestfilter.toDate = range.to
      ? this.formatDate(range.to)
      : null;
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

}
