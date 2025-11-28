import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StandardTableComponent } from '../../layouts/components/standard-table/standard-table.component';
import { PaginationConfig, TableColumn, TableAction } from '../../layouts/components/standard-table/standard-table.model';
import { ToastService } from '../../layouts/components/toast/toastService';
import { StockModel } from './models/stock.model';
import { StockService } from './stock.service';


@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [CommonModule, StandardTableComponent],
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.css']
})
export class StockComponent implements OnInit {

  stockList: StockModel[] = [];

  pagination: PaginationConfig = { pageSize: 20, currentPage: 1, totalItems: 0 };

  columns: TableColumn[] = [
    { key: 'id', label: 'ID', width: '60px', align: 'center', type: 'text' },
    { key: 'itemId', label: 'Item ID', width: '100px', type: 'text' },
    { key: 'warehouseId', label: 'Warehouse', width: '110px', type: 'text' },
    { key: 'openingQty', label: 'Opening Qty', align: 'right', width: '120px', type: 'number' },
    { key: 'inQty', label: 'In Qty', align: 'right', width: '100px', type: 'number' },
    { key: 'outQty', label: 'Out Qty', align: 'right', width: '100px', type: 'number' },
    { key: 'closingQty', label: 'Closing Qty', align: 'right', width: '120px', type: 'number' },
    { key: 'averageCost', label: 'Avg Cost', align: 'right', width: '120px', type: 'currency' },
    { key: 'stockValue', label: 'Stock Value', align: 'right', width: '140px', type: 'currency' },
    { key: 'actions', label: 'Actions', align: 'center', width: '120px', type: 'action', sortable: false }
  ];


  page: number = 0;
  size: number = 10;
  tabs: any;

  constructor(
    private stockService: StockService,
    private router: Router,
    private toastService: ToastService
  ) { }


  ngOnInit(): void {
    this.getCurrentStock();
  }

  getCurrentStock() {
    this.stockService.getCurrentStock(this.page, this.size, {},
      (response: any) => {
        this.stockList = response.data.content;
      }, (error: any) => {
        this.toastService.show('Error fetching stock data', 'error');
      });
  }

  onPageChange($event: number) {
    console.log('Page changed to:', $event);
  }
  onLoadMore() {
    console.log('Load more triggered');
  }
  onTableAction($event: TableAction) {
    console.log('Table action:', $event);
  }
}