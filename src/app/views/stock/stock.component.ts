import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StandardTableComponent } from '../../layouts/components/standard-table/standard-table.component';
import { PaginationConfig, TableColumn, TableAction } from '../../layouts/components/standard-table/standard-table.model';
import { ToastService } from '../../layouts/components/toast/toastService';
import { StockDashboardModel, StockModel } from './models/stock.model';
import { StockService } from './stock.service';
import { StatCardComponent, StatCardData } from "../../layouts/UI/stat-card/stat-card.component";
import { Activity, AlertCircle, Calendar, ClipboardList, DollarSign, Package, ShoppingCart, TrendingUp, Truck, Users, Zap } from 'lucide-angular';
import { STOCK_COLUMNS } from '../../layouts/config/tableConfig';


@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [CommonModule, StandardTableComponent, StatCardComponent],
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.css']
})
export class StockComponent implements OnInit {

  stockList: StockModel[] = [];
  stockDashboardSummary: StockDashboardModel | null = null;

  pagination: PaginationConfig = { pageSize: 20, currentPage: 1, totalItems: 0 };

  columns: TableColumn[] = STOCK_COLUMNS;
  selectedCardId: string | number = '1';


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
    this.getDashboardSummary();
  }

  stats: StatCardData[] = [
    {
      id: '1',
      title: 'Total Stock Value',
      value: '₹12,48,750',
      trendText: '6% vs last month',
      trendDirection: 'up',
      icon: Package,
      themeColor: 'blue'
    },

    {
      id: '2',
      title: 'Net Stock Movement',
      value: '+320 Units',
      trendText: 'Increased this month',
      trendDirection: 'up',
      icon: TrendingUp,
      themeColor: 'emerald'
    },

    {
      id: '3',
      title: 'Out of Stock Items',
      value: '14 Items',
      trendText: '3 items added this week',
      trendDirection: 'down',
      icon: AlertCircle,
      themeColor: 'purple'
    },

    {
      id: '4',
      title: 'Fast-Moving Items',
      value: '9 Products',
      trendText: 'Top sellers this month',
      trendDirection: 'up',
      icon: Zap,
      themeColor: 'purple'
    }
  ];


  private buildStatsFromDashboard(summary: StockDashboardModel) {
    this.stats = [
      {
        id: '1',
        title: 'Total Stock Value',
        value: `₹${summary.totalStockValue.toLocaleString()}`, // ⭐ important
        trendText: 'Current inventory value',
        trendDirection: 'up',
        icon: Package,
        themeColor: 'blue'
      },
      {
        id: '2',
        title: 'Net Stock Movement',
        value: `${summary.netMovementQty > 0 ? '+' : ''}${summary.netMovementQty} Units`,
        trendText: `In: ${summary.totalInQty} | Out: ${summary.totalOutQty}`,
        trendDirection: summary.netMovementQty >= 0 ? 'up' : 'down',
        icon: TrendingUp,
        themeColor: 'emerald'
      },
      {
        id: '3',
        title: 'Out of Stock Items',
        value: `${summary.totalItemsOutOfStock} Items`,
        trendText: 'Requires attention',
        trendDirection: summary.totalItemsOutOfStock > 0 ? 'down' : 'up',
        icon: AlertCircle,
        themeColor: 'orange'
      },
      {
        id: '4',
        title: 'Fast-Moving Items',
        value: `${summary.fastMovingItems?.length || 0} Products`,
        trendText: 'High demand items',
        trendDirection: 'up',
        icon: Zap,
        themeColor: 'purple'
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


  handleCardSelection(card: StatCardData) {
    this.selectedCardId = card.id;
    // Perform other actions (filter lists, show charts, etc.)
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