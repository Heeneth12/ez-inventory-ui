import { CommonModule } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
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

@Component({
  selector: 'app-goods-receipt',
  standalone: true,
  imports: [CommonModule, StandardTableComponent],
  templateUrl: './goods-receipt.component.html',
  styleUrl: './goods-receipt.component.css'
})
export class GoodsReceiptComponent implements OnInit {

  @ViewChild('grnSummary') grnSummary!: TemplateRef<any>;

  grnList: GrnModel[] = [];
  grnFilter: any = {};
  selectedGrn: GrnModel | null = null;
  readonly ArrowRight = ArrowRight;
  pagination: PaginationConfig = { pageSize: 15, currentPage: 1, totalItems: 0 };

  // Columns Definition
  columns: TableColumn[] = [
    { key: 'grnNumber', label: 'GRN Number', width: '180px', type: 'link', sortable: true },
    { key: 'createdAt', label: 'GRN Date', width: '120px', type: 'date' },
    { key: 'purchaseOrderId', label: 'PO Reference', width: '150px', type: 'text' },
    { key: 'supplierInvoiceNo', label: 'Supplier', width: '200px', type: 'text' },
    { key: 'receivedDate', label: 'Received Date', width: '120px', type: 'text' },
    { key: 'status', label: 'Status', width: '100px', type: 'badge' },
    { key: 'actions', label: 'Actions', align: 'center', width: '100px', type: 'action', sortable: false }
  ];

  prActions: TableActionConfig[] = [
    {
      key: 'move_to_pr',
      label: 'Move to PR',
      icon: ArrowRight,
      color: 'danger',
      // Only show if status is Approved
      condition: (row) => row['status'] === 'APPROVED'
    }
  ];

  dateConfig: DatePickerConfig = {
    type: 'both', // or 'single'
    // label: 'Filter Dates',
    placeholder: 'Start - End'
  };

  constructor(
    private purchaseService: PurchaseService,
    private router: Router,
    private modalService: ModalService,
    private toastService: ToastService,
    private loaderSvc: LoaderService
  ) { }

  ngOnInit(): void {
    this.getAllGrn();
  }

  getAllGrn() {
    this.loaderSvc.show();
    const apiPage = this.pagination.currentPage > 0 ? this.pagination.currentPage - 1 : 0;
    this.purchaseService.getAllGrn(
      apiPage,
      this.pagination.pageSize,
      (response: any) => {
        this.grnList = response.data.content;
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
      case 'partial':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
      case 'rejected':
      case 'cancelled':
        return 'bg-red-100 text-red-700 border border-red-200';
      default:
        return 'bg-blue-100 text-blue-700 border border-blue-200';
    }
  }
}