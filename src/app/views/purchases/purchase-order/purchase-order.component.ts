import { CommonModule } from '@angular/common';
import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { StandardTableComponent } from "../../../layouts/components/standard-table/standard-table.component";
import { PaginationConfig, TableAction, TableActionConfig, TableColumn } from '../../../layouts/components/standard-table/standard-table.model';
import { PurchaseService } from '../purchase.service';
import { Router } from '@angular/router';
import { LoaderService } from '../../../layouts/components/loader/loaderService';
import { ToastService } from '../../../layouts/components/toast/toastService';
import { PurchaseOrderFilter, PurchaseOrderModel } from '../models/purchase-order.model';
import { ModalService } from '../../../layouts/components/modal/modalService';
import { DrawerService } from '../../../layouts/components/drawer/drawerService';
import { GoodsReceiptFormComponent } from '../goods-receipt/goods-receipt-form/goods-receipt-form.component';
import { ArrowRight, ClipboardList, Download, PenIcon, ShareIcon, X } from 'lucide-angular';
import { DatePickerConfig, DateRangeEmit } from '../../../layouts/UI/date-picker/date-picker.component';
import { ButtonConfig, ButtonGroupComponent } from '../../../layouts/UI/button-group/button-group.component';
import { PO_ACTIONS, PO_COLUMN, PO_DATE_CONFIG, PO_FILTER_OPTIONS } from '../purchasesConfig';
import { FilterOption } from '../../../layouts/UI/filter-dropdown/filter-dropdown.component';

@Component({
  selector: 'app-purchase-order',
  standalone: true,
  imports: [CommonModule, StandardTableComponent, ButtonGroupComponent],
  templateUrl: './purchase-order.component.html',
  styleUrl: './purchase-order.component.css'
})
export class PurchaseOrderComponent {

  @Input() vendorId?: number;

  //config
  columns: TableColumn[] = PO_COLUMN
  poActions: TableActionConfig[] = PO_ACTIONS
  dateConfig: DatePickerConfig = PO_DATE_CONFIG
  filterOptions = PO_FILTER_OPTIONS

  @ViewChild('opSummary') opSummary!: TemplateRef<any>;
  purchaseOrderFilter: PurchaseOrderFilter = new PurchaseOrderFilter();

  purchaseOrderList: PurchaseOrderModel[] = [];
  purchaseOrder: PurchaseOrderModel | null = null;
  readonly ArrowRight = ArrowRight;
  pagination: PaginationConfig = { pageSize: 15, currentPage: 1, totalItems: 0 };
  isLoading = false;
  selectedItemIds: (string | number)[] = [];

  opSummaryCompleted: ButtonConfig[] = [
    {
      label: 'Download',
      icon: Download,
      color: 'gray',
      size: 'md',
      action: () => console.log('Close modal'),
      disabled: false
    },
    {
      label: 'Share',
      icon: ShareIcon,
      color: 'blue',
      size: 'md',
      action: () => console.log('Save changes')
    }
  ];

  opSummaryDraft: ButtonConfig[] = [
    {
      label: 'Cancle PO',
      icon: X,
      color: 'red',
      size: 'md',
      action: () => this.purchaseOrder && this.updatePoStatus(this.purchaseOrder.id, "CANCELLED"),
      disabled: false
    },
    {
      label: 'Edit PO',
      icon: PenIcon,
      color: 'orange',
      size: 'md',
      action: () => console.log('Close modal'),
      disabled: false
    },
    {
      label: 'Conform PO',
      icon: ClipboardList,
      color: 'blue',
      size: 'md',
      action: () => this.purchaseOrder && this.updatePoStatus(this.purchaseOrder.id, "ISSUED")
    }
  ];

  constructor(
    private purchaseService: PurchaseService,
    private router: Router,
    private modalService: ModalService,
    private toastService: ToastService,
    private loaderSvc: LoaderService,
    private drawerService: DrawerService,
  ) {
  }

  ngOnInit(): void {
    if (this.vendorId) {
      this.purchaseOrderFilter.vendorId = this.vendorId;
    }
    this.getAllPo();
  }

  getAllPo() {
    this.loaderSvc.show();
    const apiPage = this.pagination.currentPage > 0 ? this.pagination.currentPage - 1 : 0;
    this.purchaseService.getAllPo(
      apiPage,
      this.pagination.pageSize,
      this.purchaseOrderFilter,
      (response: any) => {
        this.purchaseOrderList = response.data.content;
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

  getPoById(poId: any) {
    this.loaderSvc.show()
    this.purchaseService.getPoById(poId,
      (response: any) => {
        this.purchaseOrder = response.data;
        this.loaderSvc.hide();
      },
      (error: any) => {
        this.loaderSvc.hide();
        this.toastService.show("error while getting data ", 'error')
      }
    )
  }

  openUpdatePoForm(poId: any) {
    this.router.navigate(['purchases/order/edit/', poId]);
  }

  onSelectionChange(selectedIds: (string | number)[]) {
    this.selectedItemIds = selectedIds;
    console.log("Current Selection:", this.selectedItemIds);
  }

  openGrnForm(poId: any) {
    this.modalService.openComponent(GoodsReceiptFormComponent, {
      data: {
        poId: poId
      }
    }, 'lg');
  }

  viewPoDetails(poId: any) {
    this.getPoById(poId);
    this.drawerService.openTemplate(
      this.opSummary,
      'PO Summary',
      "lg"
    );
  }

  updatePoStatus(poId: number | null, status: string) {
    if (poId == null) return;
    this.purchaseService.updatePoSatus(
      poId,
      status,
      (response: any) => {
        this.toastService.show("PO status updates to" + status, 'success');
        this.drawerService.close();
        this.getAllPo();
      },
      (error: any) => {
        this.toastService.show(" ", 'error')
      }
    )
  }

  handleTableAction(event: TableAction) {
    if (event.type === 'custom' && event.key === 'move_to_grn') {
      this.openGrnForm(event.row.id);
    }
    if (event.type === 'custom' && event.key === 'view_details') {
      this.viewPoDetails(event.row.id);
    }
    if (event.type === 'custom' && event.key === 'review_po') {
      this.openUpdatePoForm(event.row.id);
    }
  }

  onTableAction(event: TableAction) {
    const { type, row, key } = event;

    switch (type) {
      case 'view':
        console.log("View:", row.id);
        this.viewPoDetails(row.id);
        break;
      case 'edit':
        this.openUpdatePoForm(row.id);
        break;
      case 'delete':
        this.openGrnForm(row.id)
        console.log("Delete:", row.id);
        break;
      case 'toggle':
        break;
    }
  }

  onPageChange(newPage: number) {
    this.pagination = { ...this.pagination, currentPage: newPage };
    this.getAllPo();
  }

  onLoadMore() {
  }


  // inside your component class

  getStatusColor(status: string | undefined): string {
    if (!status) return 'bg-gray-100 text-gray-600';

    const normalizedStatus = status.toLowerCase();

    switch (normalizedStatus) {
      case 'approved':
      case 'completed':
        return 'bg-green-100 text-green-700 border border-green-200';
      case 'pending':
      case 'draft':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 text-red-700 border border-red-200';
      default:
        return 'bg-blue-100 text-blue-700 border border-blue-200';
    }
  }

  onFilterUpdate($event: Record<string, any>) {
    console.log("Received filter update:", $event);
    this.purchaseOrderFilter.poStatuses = $event['status'] || null;
    this.getAllPo();
  }

  onFilterDate(range: DateRangeEmit) {
    console.log('Filter table by:', range.from, range.to);
    this.purchaseOrderFilter.fromDate = range.from
      ? this.formatDate(range.from)
      : null;

    this.purchaseOrderFilter.toDate = range.to
      ? this.formatDate(range.to)
      : null;
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
