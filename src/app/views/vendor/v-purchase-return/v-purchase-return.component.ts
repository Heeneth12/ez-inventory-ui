import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FilePlusCorner } from 'lucide-angular';
import { LoaderService } from '../../../layouts/components/loader/loaderService';
import { ModalService } from '../../../layouts/components/modal/modalService';
import { PaginationConfig, TableColumn, TableActionConfig, HeaderAction, TableAction } from '../../../layouts/components/standard-table/standard-table.model';
import { ToastService } from '../../../layouts/components/toast/toastService';
import { DatePickerConfig, DateRangeEmit } from '../../../layouts/UI/date-picker/date-picker.component';
import { PurchaseReturnModel } from '../../purchases/models/purchase-return.model';
import { PurchaseService } from '../../purchases/purchase.service';
import { StandardTableComponent } from "../../../layouts/components/standard-table/standard-table.component";
import { PurchaseRequestFilterModel } from '../../purchases/models/prq.model';
import { UserInitResponse } from '../../../layouts/models/Init-response.model';
import { Observable } from 'rxjs';
import { AuthService } from '../../../layouts/guards/auth.service';
import { V_PR_ACTIONS, V_PR_COLUMN, V_PR_DATE_CONFIG, V_PR_FILTER_OPTIONS } from '../vendorConfig';
import { FilterOption } from '../../../layouts/UI/filter-dropdown/filter-dropdown.component';

@Component({
  selector: 'app-v-purchase-return',
  standalone: true,
  imports: [CommonModule, StandardTableComponent],
  templateUrl: './v-purchase-return.component.html',
  styleUrl: './v-purchase-return.component.css'
})
export class VPurchaseReturnComponent {

  purchaseReturnList: PurchaseReturnModel[] = [];
  purchaseReturnFilter: PurchaseRequestFilterModel = new PurchaseRequestFilterModel();

  pagination: PaginationConfig = { pageSize: 15, currentPage: 1, totalItems: 0 };
  isLoading = false;
  selectedItemIds: (string | number)[] = [];
  userData$: Observable<UserInitResponse | null>;

  columns: TableColumn[] = V_PR_COLUMN;
  dateConfig: DatePickerConfig = V_PR_DATE_CONFIG;
  prActions: TableActionConfig[] = V_PR_ACTIONS;
  filterConfig: FilterOption[] = V_PR_FILTER_OPTIONS;

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
    private loaderSvc: LoaderService,
    private authSvs: AuthService
  ) {
    this.userData$ = this.authSvs.currentUser$;
    this.userData$.subscribe(user => {
      if (user && user.id) {
        this.purchaseReturnFilter.vendorId = user.id;
      }
    });
  }


  ngOnInit(): void {
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

  updateStatusPurchseReturn(prId: any, status: ReturnStatus) {
    this.purchaseService.updatePurchaseReturnStatus(prId, status,
      (response: any) => {
        this.toastService.show('Purchase Return updated successfully', 'success');
        this.getPurchaseReturns();
      },
      (error: any) => {
        this.toastService.show('Failed to update Purchase Return', 'error');
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
    if (event.type === 'custom' && event.key === 'accept_pr') {
      this.updateStatusPurchseReturn(event.row.id, ReturnStatus.ACCEPTED);
    }

  }

  onPageChange(newPage: number) {
    this.pagination = { ...this.pagination, currentPage: newPage };
    this.getPurchaseReturns();
  }

  onLoadMore() {
  }

  onFilterUpdate($event: Record<string, any>) {
    console.log("Received filter update:", $event);
    this.getPurchaseReturns();
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

enum ReturnStatus {
  DRAFT = 'DRAFT',
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  PENDING_APPROVAL = "PENDING_APPROVAL",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED"
}