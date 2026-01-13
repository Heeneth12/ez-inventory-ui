import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { StandardTableComponent } from "../../../layouts/components/standard-table/standard-table.component";
import { PaginationConfig, TableAction, TableActionConfig, TableColumn } from '../../../layouts/components/standard-table/standard-table.model';
import { PurchaseService } from '../purchase.service';
import { Router } from '@angular/router';
import { LoaderService } from '../../../layouts/components/loader/loaderService';
import { ToastService } from '../../../layouts/components/toast/toastService';
import { PurchaseOrderModel } from '../models/purchase-order.model';
import { ModalService } from '../../../layouts/components/modal/modalService';
import { DrawerService } from '../../../layouts/components/drawer/drawerService';
import { GoodsReceiptFormComponent } from '../goods-receipt/goods-receipt-form/goods-receipt-form.component';
import { ArrowRight, ListCheck, ListCollapse } from 'lucide-angular';

@Component({
  selector: 'app-purchase-order',
  standalone: true,
  imports: [CommonModule, StandardTableComponent],
  templateUrl: './purchase-order.component.html',
  styleUrl: './purchase-order.component.css'
})
export class PurchaseOrderComponent {

  @ViewChild('opSummary') opSummary!: TemplateRef<any>;

  purchaseOrderList: PurchaseOrderModel[] = [];
  purchaseOrder: PurchaseOrderModel | null = null;
  readonly ArrowRight = ArrowRight;
  pagination: PaginationConfig = { pageSize: 15, currentPage: 1, totalItems: 0 };
  isLoading = false;
  selectedItemIds: (string | number)[] = [];

  columns: TableColumn[] = [
    { key: 'orderNumber', label: 'PO Number', width: '100px', type: 'link' },
    { key: 'createdAt', label: 'Order Date', width: '110px', type: 'date' },
    { key: 'expectedDeliveryDate', label: 'Delivery Date', width: '110px', type: 'date' },
    { key: 'supplierName', label: 'Supplier', width: '110px', type: 'text' },
    { key: 'status', label: 'status', width: '100px', type: 'badge' },
    { key: 'totalAmount', label: 'TotalAmount', width: '110px', type: 'currency', align: 'right' },
    { key: 'actions', label: 'Actions', align: 'center', width: '120px', type: 'action', sortable: false }
  ];

  poActions: TableActionConfig[] = [
    {
      key: 'move_to_grn',
      label: 'Move to GRN',
      icon: ArrowRight,
      color: 'primary',
      // Only show if status is Approved
      condition: (row) => row['status'] !== 'COMPLETED'
    },

    {
      key: 'view_grn_details',
      label: 'GRN Details',
      icon: ArrowRight,
      color: 'success',
      condition: (row) => row['status'] === 'COMPLETED'
    },
    {
      key: 'view_details',
      label: 'View Details',
      icon: ListCollapse,
      color: 'neutral',
      condition: (row) => true
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
    this.getAllPo();
  }

  getAllPo() {
    this.loaderSvc.show();
    const apiPage = this.pagination.currentPage > 0 ? this.pagination.currentPage - 1 : 0;
    this.purchaseService.getAllPo(
      apiPage,
      this.pagination.pageSize,
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
      size: 'lg',
      data: {
        poId: poId
      }
    })
  }

  handleTableAction(event: TableAction) {
    if (event.type === 'custom' && event.key === 'move_to_grn') {
      console.log('Moving PO to GRN:', event.row);
      this.openGrnForm(event.row.id);
    }
    if (event.type === 'edit') {
      // Standard edit logic
    }
  }

  onTableAction(event: TableAction) {
    const { type, row, key } = event;

    switch (type) {
      case 'view':
        console.log("View:", row.id);
        this.getPoById(row.id);
        this.drawerService.openTemplate(
          this.opSummary,
          'PO Summary',
          "lg"
        )
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
}
