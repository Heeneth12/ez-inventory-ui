import { Component } from '@angular/core';
import { StandardTableComponent } from "../../../layouts/components/standard-table/standard-table.component";
import { Router } from '@angular/router';
import { PaginationConfig, TableColumn, TableAction, TableActionConfig } from '../../../layouts/components/standard-table/standard-table.model';
import { ToastService } from '../../../layouts/components/toast/toastService';
import { StockService } from '../stock.service';
import { StockLedger, StockLedgerFilter } from '../models/stock-ledger.model';
import { LoaderService } from '../../../layouts/components/loader/loaderService';
import { FilterOption } from '../../../layouts/UI/filter-dropdown/filter-dropdown.component';
import { DatePickerConfig, DateRangeEmit } from '../../../layouts/UI/date-picker/date-picker.component';
import { List, Download } from 'lucide-angular';
import { HeaderAction } from '../../../layouts/components/standard-table/standard-table.model';
import { DrawerService } from '../../../layouts/components/drawer/drawerService';
import { BulkUploadComponent } from '../../../layouts/components/bulk-upload/bulk-upload.component';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';


@Component({
  selector: 'app-stock-ledger',
  standalone: true,
  imports: [StandardTableComponent],
  templateUrl: './stock-ledger.component.html',
  styleUrl: './stock-ledger.component.css'
})
export class StockLedgerComponent {


  stockLedgerList: StockLedger[] = [];
  stockLedgerFilter: StockLedgerFilter = new StockLedgerFilter();
  private tableState$ = new Subject<void>();

  isLoading: boolean = false;
  pagination: PaginationConfig = { pageSize: 20, currentPage: 1, totalItems: 0 };

  columns: TableColumn[] = [
    { key: 'itemId', label: 'Item ID', width: '90px', type: 'text' },
    { key: 'itemName', label: 'Item Name', width: '170px', type: 'text' },
    { key: 'warehouseId', label: 'Warehouse ID', width: '120px', type: 'text' },
    { key: 'createdAt', label: 'Created Date', width: '120px', type: 'date' },
    { key: 'transactionType', label: 'Txn Type', width: '120px', type: 'badge' },   // IN / OUT
    { key: 'quantity', label: 'Qty', align: 'right', width: '90px', type: 'number' },
    { key: 'beforeQty', label: 'Before Qty', align: 'right', width: '110px', type: 'number' },
    { key: 'afterQty', label: 'After Qty', align: 'right', width: '110px', type: 'number' },
    { key: 'referenceType', label: 'Ref Type', width: '120px', type: 'text' },      // GRN / SALE / RETURN / TRANSFER
    { key: 'referenceId', label: 'Ref ID', width: '90px', type: 'text' },
    { key: 'actions', label: 'Actions', width: '10px', type: 'action', align: 'center' },
  ];

  filterConfig: FilterOption[] = [
    {
      id: 'referenceType',
      label: 'Reference Type',
      type: 'checkbox',
      searchable: true,
      options: [
        { label: 'GRN', value: 'GRN' },
        { label: 'SALE', value: 'SALE' },
        { label: 'PURCHASE_RETURN', value: 'PURCHASE_RETURN' },
        { label: 'ADJUSTMENT', value: 'ADJUSTMENT' },
        { label: 'TRANSFER', value: 'TRANSFER' }
      ]
    },
    {
      id: 'transactionType',
      label: 'Transaction Type',
      type: 'checkbox',
      searchable: true,
      options: [
        { label: 'IN', value: 'IN' },
        { label: 'OUT', value: 'OUT' }
      ]
    }
  ];
  dateConfig: DatePickerConfig = {
    type: 'both',
    placeholder: 'Start - End'
  };

  slActions: TableActionConfig[] = [
    {
      key: 'view_stock_ledger_details',
      label: 'View Details',
      icon: List,
      color: 'primary',
      condition: (row) => true
    }
  ];

  headerActions: HeaderAction[] = [
    {
      label: 'Report',
      icon: Download,
      variant: 'secondary',
      key: 'report',
      action: () => this.openReport(),
      hidden: false
    }
  ];

  page: number = 0;
  size: number = 10;
  tabs: any;

  constructor(
    private stockService: StockService,
    private router: Router,
    private toastService: ToastService,
    private loaderSvc: LoaderService,
    private drawerSvc: DrawerService
  ) { }


  ngOnInit(): void {
    this.setupTablePipeline();
    this.tableState$.next();
  }

  private setupTablePipeline() {
    this.tableState$.pipe(
      debounceTime(300),
    ).subscribe(() => {
      this.getCurrentStock();
    });
  }

  getCurrentStock() {
    this.isLoading = true;

    const apiPage = this.pagination.currentPage > 0 ? this.pagination.currentPage - 1 : 0;
    this.stockService.getStockTransactions(
      apiPage,
      this.pagination.pageSize,
      this.stockLedgerFilter,
      (response: any) => {
        this.stockLedgerList = response.data.content;
        this.pagination = {
          currentPage: this.pagination.currentPage,
          totalItems: response.data.totalElements,
          pageSize: response.data.size
        };
        this.isLoading = false;

      }, (error: any) => {
        this.isLoading = false;
        this.toastService.show('Error fetching stock data', 'error');
      }
    );
  }

  onPageChange(newPage: number) {
    this.pagination = { ...this.pagination, currentPage: newPage };
    this.tableState$.next();
  }

  onLoadMore() {
    console.log('Load more triggered');
  }

  openReport() {
    this.drawerSvc.openComponent(BulkUploadComponent,
      {
        type: 'download',
        serviceType: 'stock-ledger',
        customFilters: this.stockLedgerFilter
      },
      "Report Download",
      'lg'
    );
  }

  handleTableAction(event: TableAction) {
    // Check if the event is the specific custom action we defined
    if (event.type === 'custom' && event.key === 'view_stock_ledger_details') {
      console.log('View stock ledger details:', event.row.id);
    }
    else {
    }
  }


  onFilterUpdate($event: Record<string, any>) {
    this.stockLedgerFilter = $event;
    this.stockLedgerFilter.transactionTypes = $event['transactionType'] || null;
    this.stockLedgerFilter.referenceTypes = $event['referenceType'] || null;
    this.tableState$.next();
  }

  onFilterDate(range: DateRangeEmit) {
    console.log('Filter table by:', range.from, range.to);
    this.stockLedgerFilter.fromDate = range.from
      ? this.formatDate(range.from)
      : null;

    this.stockLedgerFilter.toDate = range.to
      ? this.formatDate(range.to)
      : null;
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

}
