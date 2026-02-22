import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoaderService } from '../../../layouts/components/loader/loaderService';
import { ModalService } from '../../../layouts/components/modal/modalService';
import { HeaderAction, PaginationConfig, TableAction, TableActionConfig, TableColumn } from '../../../layouts/components/standard-table/standard-table.model';
import { ToastService } from '../../../layouts/components/toast/toastService';
import { PurchaseService } from '../purchase.service';
import { PurchaseReturnFilterModel, PurchaseReturnModel, ReturnStatus } from '../models/pr.model';
import { StandardTableComponent } from "../../../layouts/components/standard-table/standard-table.component";
import { DatePickerConfig, DateRangeEmit } from '../../../layouts/UI/date-picker/date-picker.component';
import { FilePlusCorner } from 'lucide-angular';
import { PR_COLUMN, PR_DATE_CONFIG, PRQ_ACTIONS, PRQ_FILTER_OPTIONS } from '../purchasesConfig';
import { FilterOption } from '../../../layouts/UI/filter-dropdown/filter-dropdown.component';
import { ConfirmationModalService } from '../../../layouts/UI/confirmation-modal/confirmation-modal.service';

@Component({
  selector: 'app-purchase-returns',
  standalone: true,
  imports: [CommonModule, StandardTableComponent],
  templateUrl: './purchase-returns.component.html',
  styleUrl: './purchase-returns.component.css'
})
export class PurchaseReturnsComponent implements OnInit {

  @Input() vendorId?: number;

  purchaseReturnList: PurchaseReturnModel[] = [];
  purchaseReturnFilter: PurchaseReturnFilterModel = new PurchaseReturnFilterModel();

  pagination: PaginationConfig = { pageSize: 15, currentPage: 1, totalItems: 0 };
  isLoading = false;
  selectedItemIds: (string | number)[] = [];

  columns: TableColumn[] = PR_COLUMN;
  dateConfig: DatePickerConfig = PR_DATE_CONFIG;
  prActions: TableActionConfig[] = PRQ_ACTIONS;
  prFilterOptions: FilterOption[] = PRQ_FILTER_OPTIONS;
  purchaseOrderList: any;

  myHeaderActions: HeaderAction[] = [
    {
      label: 'Create',
      icon: FilePlusCorner,
      variant: 'primary',
      action: () => console.log("heelo")
    },
  ];

  constructor(
    private purchaseService: PurchaseService,
    private router: Router,
    private modalService: ModalService,
    private toastService: ToastService,
    private confirmationModalSvc: ConfirmationModalService,
    private loaderSvc: LoaderService
  ) {
  }


  ngOnInit(): void {
    if (this.vendorId) {
      this.purchaseReturnFilter.vendorId = this.vendorId;
    }
    this.getPurchaseReturns();
  }

  getPurchaseReturns() {
    this.loaderSvc.show();
    const apiPage = this.pagination.currentPage > 0 ? this.pagination.currentPage - 1 : 0;
    this.purchaseService.getAllReturns(
      apiPage,
      this.pagination.pageSize,
      this.purchaseReturnFilter,
      (response: any) => {
        this.purchaseReturnList = response.data.content;
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

  confirmAndProcessReturn(prId: any) {
    this.confirmationModalSvc.open({
      title: `Confirm Purchase Return`,
      message: `
      Warning: This action is irreversible. 
      Once the vendor accepts, items will be permanently removed from stock. 
      Do you wish to proceed?`,
      intent: 'danger',
      confirmLabel: 'Yes, Return Items',
      cancelLabel: 'No, Keep Stock'
    }).then((confirmed: any) => {
      if (confirmed) {
        this.executeReturnStatusUpdate(prId, ReturnStatus.COMPLETED);
      }
    });
  }

  private executeReturnStatusUpdate(prId: any, status: ReturnStatus) {
    this.purchaseService.updatePurchaseReturnStatus(
      prId,
      status,
      (response: any) => {
        this.toastService.show('Stock updated and items returned successfully', 'success');
        this.getPurchaseReturns();
      },
      (error: any) => {
        this.toastService.show('Failed to process return', 'error');
        console.error('Error updating Purchase Return:', error);
      }
    );
  }

  onSelectionChange(selectedIds: (string | number)[]) {
    this.selectedItemIds = selectedIds;
    console.log("Current Selection:", this.selectedItemIds);
  }

  onTableAction(event: TableAction) {
    const { type, row, key } = event;

    switch (type) {
      case 'view':
        console.log("View:", row.id);
        break;
      case 'edit':
        console.log("sdsd")
        break;
      case 'delete':
        console.log("Delete:", row.id);
        break;
      case 'toggle':
        break;
    }
  }

  handleTableAction(event: TableAction) {
    if (event.type === 'custom' && event.key === 'update_pr') {
    }
    if (event.type === 'custom' && event.key === 'return_items') {
      this.confirmAndProcessReturn(event.row.id);
    }
  }

  onFilterUpdate($event: Record<string, any>) {
    console.log("Received filter update:", $event);
    this.purchaseReturnFilter.prStatuses = $event['status'] || null;
    this.getPurchaseReturns();
  }

  onPageChange(newPage: number) {
    this.pagination = { ...this.pagination, currentPage: newPage };
    this.getPurchaseReturns();
  }

  onLoadMore() {
  }

  onFilterDate(range: DateRangeEmit) {
    console.log('Filter table by:', range.from, range.to);
    this.purchaseReturnFilter.fromDate = range.from
      ? this.formatDate(range.from)
      : null;

    this.purchaseReturnFilter.toDate = range.to
      ? this.formatDate(range.to)
      : null;
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
