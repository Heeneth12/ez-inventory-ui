import { Component } from '@angular/core';
import { StandardTableComponent } from "../../../layouts/components/standard-table/standard-table.component";
import { Router } from '@angular/router';
import { PaginationConfig, TableColumn, TableAction } from '../../../layouts/components/standard-table/standard-table.model';
import { ToastService } from '../../../layouts/components/toast/toastService';
import { StockService } from '../stock.service';
import { StockLedger, StockLedgerFilter } from '../models/stock-ledger.model';
import { LoaderService } from '../../../layouts/components/loader/loaderService';
import { FilterOption } from '../../../layouts/UI/filter-dropdown/filter-dropdown.component';


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

  pagination: PaginationConfig = { pageSize: 20, currentPage: 1, totalItems: 0 };

  columns: TableColumn[] = [
    { key: 'itemId', label: 'Item ID', width: '75px', type: 'text' },
    { key: 'itemName', label: 'Item Name', width: '200px', type: 'text' },
    { key: 'warehouseId', label: 'Warehouse ID', width: '120px', type: 'text' },
    { key: 'createdAt', label: 'Created Date', width: '120px', type: 'date' },
    { key: 'transactionType', label: 'Txn Type', width: '120px', type: 'badge' },   // IN / OUT
    { key: 'quantity', label: 'Qty', align: 'right', width: '90px', type: 'number' },
    { key: 'beforeQty', label: 'Before Qty', align: 'right', width: '110px', type: 'number' },
    { key: 'afterQty', label: 'After Qty', align: 'right', width: '110px', type: 'number' },
    { key: 'referenceType', label: 'Ref Type', width: '120px', type: 'text' },      // GRN / SALE / RETURN / TRANSFER
    { key: 'referenceId', label: 'Ref ID', width: '110px', type: 'text' },
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
        { label: 'RETURN', value: 'RETURN' },
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

  page: number = 0;
  size: number = 10;
  tabs: any;

  constructor(
    private stockService: StockService,
    private router: Router,
    private toastService: ToastService,
    private loaderSvc: LoaderService
  ) { }


  ngOnInit(): void {
    this.getCurrentStock();
  }

  getCurrentStock() {
    this.loaderSvc.show();
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
        this.loaderSvc.hide();

      }, (error: any) => {
        this.loaderSvc.hide();
        this.toastService.show('Error fetching stock data', 'error');
      });
  }

  onPageChange(newPage: number) {
    this.pagination = { ...this.pagination, currentPage: newPage };
    this.getCurrentStock();
  }

  onLoadMore() {
    console.log('Load more triggered');
  }
  onTableAction($event: TableAction) {
    console.log('Table action:', $event);
  }

  
  onFilterUpdate($event: Record<string, any>) {
    this.stockLedgerFilter = $event;
    this.stockLedgerFilter.transactionTypes = $event['transactionType'] || null;
    this.stockLedgerFilter.referenceTypes = $event['referenceType'] || null;
    this.getCurrentStock();
  }

}
