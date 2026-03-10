import { Component, Input, ViewChild, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { ArrowRight } from 'lucide-angular';
import { DrawerService } from '../../../layouts/components/drawer/drawerService';
import { LoaderService } from '../../../layouts/components/loader/loaderService';
import { PaginationConfig, TableColumn, TableAction } from '../../../layouts/components/standard-table/standard-table.model';
import { ToastService } from '../../../layouts/components/toast/toastService';
import { SalesOrderService } from '../sales-order/sales-order.service';
import { SalesReturnService } from './sales-return.service';
import { SalesReturnModal } from './sales-return.modal';
import { StandardTableComponent } from "../../../layouts/components/standard-table/standard-table.component";
import { SALES_RETURNS_ACTIONS, SALES_RETURNS_COLUMNS, SALES_RETURNS_DATE_CONFIG, SALES_RETURNS_FILTER_OPTIONS } from '../salesConfig';
import { DateRangeEmit } from '../../../layouts/UI/date-picker/date-picker.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sales-returns',
  standalone: true,
  imports: [StandardTableComponent, CommonModule],
  templateUrl: './sales-returns.component.html',
  styleUrl: './sales-returns.component.css'
})
export class SalesReturnsComponent {

  @ViewChild('srDetails') srDetailsTemplate!: TemplateRef<any>;

  @Input() statGroup?: boolean = true;
  @Input() customerId?: number;
  readonly ArrowRight = ArrowRight;

  salesReturns: SalesReturnModal[] = [];
  salesReturnDetail: SalesReturnModal | null = null;

  pagination: PaginationConfig = { pageSize: 20, currentPage: 1, totalItems: 0 };

  salesReturnsFilter: any = {};
  isLoading: boolean = false;

  columns: TableColumn[] = SALES_RETURNS_COLUMNS;
  tableActions = SALES_RETURNS_ACTIONS;
  filterOptions = SALES_RETURNS_FILTER_OPTIONS;
  dateConfig = SALES_RETURNS_DATE_CONFIG;


  constructor(
    private salesOrderService: SalesOrderService,
    private salesReturnService: SalesReturnService,
    public drawerService: DrawerService,
    private toastSvc: ToastService,
    private router: Router,
    private loaderSvc: LoaderService
  ) {
  }

  ngOnInit(): void {
    if (this.customerId) {
      //this.salesOrderFilter.customerId = this.customerId;
    }
    this.getAllSalesReturns();
  }

  getAllSalesReturns() {
    this.isLoading = true;
    const apiPage = this.pagination.currentPage > 0 ? this.pagination.currentPage - 1 : 0;
    this.salesReturnService.getAllSalesReturns(
      apiPage,
      this.pagination.pageSize,
      this.salesReturnsFilter,
      (response: any) => {
        this.salesReturns = response.data.content;
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

  onTableAction(event: TableAction) {
    const { type, row, key } = event;

    if (type === 'custom') {
      if (key === 'return_details') {
        this.salesReturnDetail = row as SalesReturnModal;
        this.drawerService.openTemplate(this.srDetailsTemplate, 'Sales Return Details', '2xl');
      }
      if (key === 'download_receipt') {
        console.log("Download receipt for:", row.id);
      }
    }

    switch (type) {
      case 'view':
        console.log("View:", row.id);
        break;
      case 'edit':
        break;
      case 'delete':
        console.log("Delete:", row.id);
        break;
    }
  }

  onSearchChange(searchQuery: string) {
    this.salesReturnsFilter.searchQuery = searchQuery?.trim() || undefined;
    this.pagination.currentPage = 1;
    this.getAllSalesReturns();
  }

  onFilterDate(range: DateRangeEmit) {
    this.salesReturnsFilter.fromDate = range.from ? this.formatDate(range.from) : null;
    this.salesReturnsFilter.toDate = range.to ? this.formatDate(range.to) : null;
    this.pagination.currentPage = 1;
    this.getAllSalesReturns();
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  onFilterUpdate($event: Record<string, any>) {
    this.salesReturnsFilter.statuses = $event['status'] || null;
    this.pagination.currentPage = 1;
    this.getAllSalesReturns();
  }

  onPageChange(newPage: number) {
    this.pagination = { ...this.pagination, currentPage: newPage };
    this.getAllSalesReturns();
  }

  onLoadMore() {
    console.log('Load more triggered');
  }

}
