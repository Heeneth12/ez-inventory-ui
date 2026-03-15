import { Component, Input, ViewChild, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { ArrowRight } from 'lucide-angular';
import { DrawerService } from '../../../layouts/components/drawer/drawerService';
import { LoaderService } from '../../../layouts/components/loader/loaderService';
import { PaginationConfig, TableColumn, TableAction } from '../../../layouts/components/standard-table/standard-table.model';
import { ToastService } from '../../../layouts/components/toast/toastService';
import { SalesOrderService } from '../sales-order/sales-order.service';
import { SalesReturnService } from './sales-return.service';
import { SalesReturnFilter, SalesReturnModal } from './sales-return.modal';
import { StandardTableComponent } from "../../../layouts/components/standard-table/standard-table.component";
import { SALES_RETURNS_ACTIONS, SALES_RETURNS_COLUMNS, SALES_RETURNS_DATE_CONFIG, SALES_RETURNS_FILTER_OPTIONS } from '../salesConfig';
import { DateRangeEmit } from '../../../layouts/UI/date-picker/date-picker.component';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

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
  salesReturnFilter: SalesReturnFilter = new SalesReturnFilter();

  pagination: PaginationConfig = { pageSize: 20, currentPage: 1, totalItems: 0 };

  isLoading: boolean = false;

  columns: TableColumn[] = SALES_RETURNS_COLUMNS;
  tableActions = SALES_RETURNS_ACTIONS;
  filterOptions = SALES_RETURNS_FILTER_OPTIONS;
  dateConfig = SALES_RETURNS_DATE_CONFIG;
  private tableState$ = new Subject<void>();


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
    this.setupTablePipeline();
    this.tableState$.next();
  }

  private setupTablePipeline() {
    this.tableState$.pipe(
      debounceTime(300),
    ).subscribe(() => {
      this.getAllSalesReturns();
    });
  }

  getAllSalesReturns() {
    this.isLoading = true;
    const apiPage = this.pagination.currentPage > 0 ? this.pagination.currentPage - 1 : 0;
    this.salesReturnService.getAllSalesReturns(
      apiPage,
      this.pagination.pageSize,
      this.salesReturnFilter,
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


  downloadSalesReturnPdf(id: any) {
    this.loaderSvc.show();
    this.salesReturnService.downloadSalesReturnPdf(id,
      (response: any) => {
        this.loaderSvc.hide();
        const blob = new Blob([response.body], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(
          url,
          'salesReturnPopup',
          'width=900,height=800,top=50,left=100,toolbar=no,menubar=no,scrollbars=yes,resizable=yes'
        );
      },
      (error: any) => {
        this.loaderSvc.hide();
        this.toastSvc.show('Failed to download PDF', 'error');
        console.error('Error downloading PDF:', error);
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
        this.downloadSalesReturnPdf(row.id);
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
    this.salesReturnFilter.searchQuery = searchQuery?.trim() || undefined;
    this.pagination.currentPage = 1;
    this.tableState$.next();
  }

  onFilterDate(range: DateRangeEmit) {
    this.salesReturnFilter.fromDate = range.from ? this.formatDate(range.from) : null;
    this.salesReturnFilter.toDate = range.to ? this.formatDate(range.to) : null;
    this.pagination.currentPage = 1;
    this.tableState$.next();
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  onFilterUpdate($event: Record<string, any>) {
    this.salesReturnFilter.statuses = $event['status'] || null;
    this.pagination.currentPage = 1;
    this.tableState$.next();
  }

  onPageChange(newPage: number) {
    this.pagination = { ...this.pagination, currentPage: newPage };
    this.tableState$.next();
  }

  onLoadMore() {
    console.log('Load more triggered');
  }

}
