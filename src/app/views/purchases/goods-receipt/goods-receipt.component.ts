import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { StandardTableComponent } from '../../../layouts/components/standard-table/standard-table.component'; // Adjust path
import { PaginationConfig, TableAction, TableActionConfig, TableColumn } from '../../../layouts/components/standard-table/standard-table.model'; // Adjust path
import { LoaderService } from '../../../layouts/components/loader/loaderService';
import { ToastService } from '../../../layouts/components/toast/toastService';
import { ModalService } from '../../../layouts/components/modal/modalService';
import { PurchaseService } from '../purchase.service';
import { GrnModel } from '../models/grn.model';
import { PurchaseReturnFormComponent } from '../purchase-returns/purchase-return-form/purchase-return-form.component';
import { ArrowRight } from 'lucide-angular';
import { DatePickerConfig, DateRangeEmit } from '../../../layouts/UI/date-picker/date-picker.component';
import { GRN_COLUMN, GRN_DATE_CONFIG } from '../purchasesConfig';

@Component({
  selector: 'app-goods-receipt',
  standalone: true,
  imports: [CommonModule, StandardTableComponent],
  templateUrl: './goods-receipt.component.html',
  styleUrl: './goods-receipt.component.css'
})
export class GoodsReceiptComponent implements OnInit {

  @Input() vendorId?: number;

  @ViewChild('grnSummary') grnSummary!: TemplateRef<any>;

  grnList: GrnModel[] = [];
  grnFilter: any = {};
  selectedGrn: GrnModel | null = null;
  readonly ArrowRight = ArrowRight;
  pagination: PaginationConfig = { pageSize: 15, currentPage: 1, totalItems: 0 };

  // Columns Definition
  columns: TableColumn[] = GRN_COLUMN;

  prActions: TableActionConfig[] = [
    {
      key: 'move_to_pr',
      label: 'Move to PR',
      icon: ArrowRight,
      color: 'danger',
      // Only show if status is Approved
      condition: (row) => {
        // Check if status is RECEIVED and has items with available quantity
        if (row['status'] !== 'RECEIVED') return false;

        const items = row['items'] || [];
        if (!items.length) return false;

        // Calculate total available quantity
        const totalAvailableQty = items.reduce((sum: number, item: any) => {
          const receivedQty = item.receivedQty || 0;
          const returnedQty = item.returnedQty || 0;
          const availableQty = receivedQty - returnedQty;
          return sum + availableQty;
        }, 0);

        return totalAvailableQty > 0;
      }
    }
  ];

  dateConfig: DatePickerConfig = GRN_DATE_CONFIG;

  constructor(
    private purchaseService: PurchaseService,
    private router: Router,
    private modalService: ModalService,
    private toastService: ToastService,
    private loaderSvc: LoaderService
  ) { }

  ngOnInit(): void {
    if (this.vendorId) {
      this.grnFilter.vendorId = this.vendorId;
    }
    this.getAllGrn();
  }

  getAllGrn() {
    this.loaderSvc.show();
    const apiPage = this.pagination.currentPage > 0 ? this.pagination.currentPage - 1 : 0;
    this.purchaseService.getAllGrn(
      apiPage,
      this.pagination.pageSize,
      (response: any) => {
        this.grnList = response.data.content.map((grn: GrnModel) => {
          return {
            ...grn,
            displayStatus: this.getComputedStatus(grn)
          };
        });
        this.pagination = {
          currentPage: this.pagination.currentPage,

          totalItems: response.data.totalElements,
          pageSize: response.data.size
        };
        this.loaderSvc.hide();
      },
      (error: any) => {
        this.loaderSvc.hide();
        this.toastService.show('Failed to load GRN List', 'error');
        console.error('Error fetching GRNs:', error);
      }
    );
  }
  getComputedStatus(grn: GrnModel) {
    const items = grn.items || [];
    if (!items.length) return grn.status;

    const totalQty = items.reduce((sum, item) => sum + (item.receivedQty || 0), 0);
    const returnedQty = items.reduce((sum, item) => sum + (item.returnedQty || 0), 0);
    const pendingQty = totalQty - returnedQty;

    if (returnedQty === 0) return grn.status; // No returns yet
    if (pendingQty === 0) return 'FULLY_RETURNED'; // Fully returned
    return 'PARTIALLY_RETURNED'; // Some items returned, some pending
  }

  onPageChange(newPage: number) {
    this.pagination = { ...this.pagination, currentPage: newPage };
    this.getAllGrn();
  }

  createPurchaseReturn(grnId: any) {
    this.modalService.openComponent(
      PurchaseReturnFormComponent,
      {
        data: {
          grnId: grnId
        }
      },
      'lg'
    );
  }

  handleTableAction(event: TableAction) {
    if (event.type === 'custom' && event.key === 'move_to_pr') {
      console.log('Moving GRN to PR:', event.row);
      this.createPurchaseReturn(event.row.id);
    }
    if (event.type === 'edit') {
      // Standard edit logic
    }
  }

  onLoadMore() {
    // Implement if using infinite scroll instead of pagination
  }

  onTableAction(event: TableAction) {
    const { type, row } = event;

    switch (type) {
      case 'view':
        //this.getGrnById(row.id);
        this.createPurchaseReturn(row.id);
        break;
      case 'edit':
        // Navigate to edit page if applicable
        // this.router.navigate(['/inventory/grn/edit', row.id]);
        break;
      case 'delete':
        // Implement delete logic
        console.log("Delete:", row.id);
        break;
    }
  }

  onFilterDate(range: DateRangeEmit) {
    console.log('Filter table by:', range.from, range.to);
    this.grnFilter.fromDate = range.from
      ? this.formatDate(range.from)
      : null;

    this.grnFilter.toDate = range.to
      ? this.formatDate(range.to)
      : null;
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }


  getStatusColor(status: string | undefined): string {
    if (!status) return 'bg-gray-100 text-gray-600';

    const normalizedStatus = status.toLowerCase();

    switch (normalizedStatus) {
      case 'full':
      case 'completed':
        return 'bg-green-100 text-green-700 border border-green-200';
      case 'partially_returned':
      case 'fully_returned':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
      case 'rejected':
      case 'cancelled':
        return 'bg-red-100 text-red-700 border border-red-200';
      default:
        return 'bg-blue-100 text-blue-700 border border-blue-200';
    }
  }
}