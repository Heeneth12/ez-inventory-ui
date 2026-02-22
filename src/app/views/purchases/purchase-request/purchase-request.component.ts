import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DrawerService } from '../../../layouts/components/drawer/drawerService';
import { LoaderService } from '../../../layouts/components/loader/loaderService';
import { ModalService } from '../../../layouts/components/modal/modalService';
import { ToastService } from '../../../layouts/components/toast/toastService';
import { PurchaseService } from '../purchase.service';
import { PaginationConfig, TableAction, TableActionConfig, TableColumn } from '../../../layouts/components/standard-table/standard-table.model';
import { DatePickerConfig, DateRangeEmit } from '../../../layouts/UI/date-picker/date-picker.component';
import { PurchaseRequestFilterModel, PurchaseRequestModel } from '../models/prq.model';
import { PRQ_ACTIONS, PRQ_COLUMN, PRQ_DATE_CONFIG, PRQ_FILTER_OPTIONS } from '../purchasesConfig';
import { StandardTableComponent } from '../../../layouts/components/standard-table/standard-table.component';
import { Search, ShoppingBag, LucideAngularModule } from 'lucide-angular';
import { ConfirmationModalService } from '../../../layouts/UI/confirmation-modal/confirmation-modal.service';

@Component({
  selector: 'app-purchase-request',
  standalone: true,
  imports: [CommonModule, StandardTableComponent, LucideAngularModule],
  templateUrl: './purchase-request.component.html',
  styleUrl: './purchase-request.component.css'
})
export class PurchaseRequestComponent implements OnInit {
  
  @Input() vendorId?: number;

  //icons
  readonly ShoppingBag = ShoppingBag;
  readonly SearchIcon = Search;

  //config
  columns: TableColumn[] = PRQ_COLUMN
  prqActions: TableActionConfig[] = PRQ_ACTIONS
  dateConfig: DatePickerConfig = PRQ_DATE_CONFIG
  filterOptions = PRQ_FILTER_OPTIONS

  @ViewChild('prqSummary') prqSummary!: TemplateRef<any>;
  purchaseRequestList: PurchaseRequestModel[] = [];
  purchaseRequestDetails: PurchaseRequestModel | null = null;
  purchaseRequestfilter: PurchaseRequestFilterModel = new PurchaseRequestFilterModel();

  pagination: PaginationConfig = { pageSize: 15, currentPage: 1, totalItems: 0 };
  isLoading = false;
  selectedItemIds: (string | number)[] = [];

  constructor(
    private purchaseService: PurchaseService,
    private router: Router,
    private modalService: ModalService,
    private toastService: ToastService,
    private loaderSvc: LoaderService,
    private drawerService: DrawerService,
    private confirmationModalService: ConfirmationModalService
  ) {
  }

  ngOnInit(): void {
    if (this.vendorId) {
      this.purchaseRequestfilter.vendorId = this.vendorId;
    }
    this.getAllPRQ();
  }

  getAllPRQ() {
    this.loaderSvc.show();
    const apiPage = this.pagination.currentPage > 0 ? this.pagination.currentPage - 1 : 0;
    this.purchaseService.getAllPrqs(
      apiPage,
      this.pagination.pageSize,
      this.purchaseRequestfilter,
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
    this.purchaseService.getPrqById(
      prqId,
      (response: any) => {
        this.purchaseRequestDetails = response.data;
      },
      (error: any) => {
        this.toastService.show("", 'error')
      }
    )
  }

  updatePrqStatus(prqId: number, status: string) {
    this.purchaseService.updatePrqStatus(
      prqId,
      status,
      (response: any) => {
        this.toastService.show("PRQ status updates to " + status, 'success');
        this.getAllPRQ();
      },
      (error: any) => {
        this.toastService.show("Failed to update PRQ status", 'error')
      }
    )
  }

  confirmAndUpdateStatus(prqId: any, status: string) {
    const action = status === 'APPROVED' ? 'Approve' : 'Reject';
    this.confirmationModalService.open({
      title: `${action} PRQ`,
      message: `Are you sure you want to ${action.toLowerCase()} this purchase request?`,
      intent: status === 'APPROVED' ? 'success' : 'danger',
      confirmLabel: `Yes, ${action}`,
      cancelLabel: 'No, Cancel'
    }).then(confirmed => {
      if (confirmed) {
        this.updatePrqStatus(prqId, status);
      }
    });
  }

  viewPrqDetails(poId: any) {
    this.getPrqById(poId);
    this.drawerService.openTemplate(
      this.prqSummary,
      'PO Summary',
      "lg"
    );
  }


  openUpdatePrqForm(poId: any) {
    this.router.navigate(['purchases/prq/edit/', poId]);
  }


  handleTableAction(event: TableAction) {
    if (event.type === 'custom' && event.key === 'edit_details') {
      this.openUpdatePrqForm(event.row.id);
    }
    if (event.type === 'custom' && event.key === 'view_details') {
      this.viewPrqDetails(event.row.id);
    }
    if (event.type === 'custom' && event.key === 'review_prq') {
      this.openUpdatePrqForm(event.row.id);
    }
    if (event.type === 'custom' && event.key === 'delete_prq') {
      this.confirmAndUpdateStatus(event.row.id, 'REJECTED');
    }
  }

  onTableAction(event: TableAction) {
    const { type, row, key } = event;
    switch (type) {
      case 'view':
        this.viewPrqDetails(event.row.id);
        break;
      case 'edit':
        this.openUpdatePrqForm(event.row.id)
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

  onFilterUpdate($event: Record<string, any>) {
    console.log("Received filter update:", $event);
    this.purchaseRequestfilter.status = $event['status'] || null;
    this.getAllPRQ();
  }


  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
