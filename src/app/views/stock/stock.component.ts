import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StandardTableComponent } from '../../layouts/components/standard-table/standard-table.component';
import { PaginationConfig, TableColumn, TableAction } from '../../layouts/components/standard-table/standard-table.model';
import { ToastService } from '../../layouts/components/toast/toastService';
import { StockDashboardModel, StockModel } from './models/stock.model';
import { StockService } from './stock.service';
import { StatCardConfig, StatGroupComponent } from "../../layouts/UI/stat-group/stat-group.component"; 
import { AlertCircle, Package, TrendingUp, Zap } from 'lucide-angular';
import { STOCK_COLUMNS } from '../../layouts/config/tableConfig';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [CommonModule, StandardTableComponent, StatGroupComponent],
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.css']
})
export class StockComponent implements OnInit {

  stockList: StockModel[] = [];
  stockDashboardSummary: StockDashboardModel | null = null;
  pagination: PaginationConfig = { pageSize: 20, currentPage: 1, totalItems: 0 };
  columns: TableColumn[] = STOCK_COLUMNS;
  
  page: number = 0;
  size: number = 10;

  // Initialize with empty array
  stockDashboardStats: StatCardConfig[] = [];

  constructor(
    private stockService: StockService,
    private router: Router,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.getCurrentStock();
    this.getDashboardSummary();
  }

  // Mapped function to convert Backend Data -> StatGroup Config
  private buildStatsFromDashboard(summary: StockDashboardModel) {
    this.stockDashboardStats = [
      {
        key: 'totalStockValue',
        label: 'Total Stock Value',
        value: `₹${summary.totalStockValue.toLocaleString()}`,
        icon: Package,
        color: 'blue',
        trend: { 
          value: 'Current Value', 
          isUp: true 
        }
      },
      {
        key: 'netMovement',
        label: 'Net Stock Movement',
        value: `${summary.netMovementQty > 0 ? '+' : ''}${summary.netMovementQty} Units`,
        icon: TrendingUp,
        color: 'emerald', // Greenish for movement
        trend: { 
          value: `In: ${summary.totalInQty} | Out: ${summary.totalOutQty}`, 
          isUp: summary.netMovementQty >= 0 
        }
      },
      {
        key: 'outOfStock',
        label: 'Out of Stock Items',
        value: `${summary.totalItemsOutOfStock}`,
        icon: AlertCircle,
        color: 'rose', // Warning color
        trend: { 
          value: summary.totalItemsOutOfStock > 0 ? 'Action Required' : 'Optimal', 
          isUp: summary.totalItemsOutOfStock === 0 // Up (Good) if 0 items out of stock
        }
      },
      {
        key: 'fastMoving',
        label: 'Fast-Moving Items',
        value: `${summary.fastMovingItems?.length || 0}`,
        icon: Zap,
        color: 'orange',
        trend: { 
          value: 'High Demand', 
          isUp: true 
        }
      }
    ];
  }

  getDashboardSummary() {
    this.stockService.getStockDashboardSummary(
      1,
      (response: any) => {
        this.stockDashboardSummary = response.data;
        if (this.stockDashboardSummary) {
          this.buildStatsFromDashboard(this.stockDashboardSummary);
        }
      },
      (err: any) => {
        this.toastService.show('Error fetching stock dashboard', 'error');
      }
    );
  }

  getCurrentStock() {
    this.stockService.getCurrentStock(this.page, this.size, {},
      (response: any) => {
        this.stockList = response.data.content;
      }, (error: any) => {
        this.toastService.show('Error fetching stock data', 'error');
      }
    );
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