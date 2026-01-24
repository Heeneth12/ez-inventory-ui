import { CommonModule } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { StandardTableComponent } from '../../layouts/components/standard-table/standard-table.component';
import { PaginationConfig, TableColumn, TableAction, HeaderAction, TableActionConfig } from '../../layouts/components/standard-table/standard-table.model';
import { ToastService } from '../../layouts/components/toast/toastService';
import { ItemStockSearchModel, StockDashboardModel, StockFilterModel, StockModel, BatchDetailModel } from './models/stock.model';
import { StockService } from './stock.service';
import { StatCardConfig, StatGroupComponent } from "../../layouts/UI/stat-group/stat-group.component";
import { AlertCircle, CloudDownloadIcon, List, Package, TrendingUp, Zap, LucideAngularModule, Calendar, Search, Building2 } from 'lucide-angular';
import { STOCK_COLUMNS } from '../../layouts/config/tableConfig';
import { BulkUploadComponent } from '../../layouts/components/bulk-upload/bulk-upload.component';
import { DrawerService } from '../../layouts/components/drawer/drawerService';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [CommonModule, StandardTableComponent, StatGroupComponent, LucideAngularModule],
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.css']
})
export class StockComponent implements OnInit {

  @ViewChild('stockItemDetail') stockItemDetail!: TemplateRef<any>;

  stockList: StockModel[] = [];
  stockFilter: StockFilterModel = new StockFilterModel();
  selectedItemDetail: ItemStockSearchModel | null = null;
  stockDashboardSummary: StockDashboardModel | null = null;
  pagination: PaginationConfig = { pageSize: 20, currentPage: 1, totalItems: 0 };
  columns: TableColumn[] = STOCK_COLUMNS;


  //icons
  readonly packageIcon = Package;
  readonly layersIcon = List;
  readonly calendarIcon = Calendar;
  readonly searchIcon = Search;

  page: number = 0;
  size: number = 10;

  stockDashboardStats: StatCardConfig[] = [];

  headerActions: HeaderAction[] = [
    {
      label: 'Bulk Process',
      icon: CloudDownloadIcon,
      variant: 'primary',
      key: 'bulk_download',
      action: () => this.downloadCurrentStockReport()
    },
     {
      label: 'Warehouse',
      icon: Building2,
      variant: 'outline',
      key: 'bulk_download',
      action: () => console.log("Warehouse")
    }
  ];

  viewDetails: TableActionConfig[] = [
    {
      key: 'view_item_details',
      label: 'View Details',
      icon: List,
      color: 'primary',
      condition: (row) => true
    }
  ];

  constructor(
    private stockService: StockService,
    private router: Router,
    public drawerSvc: DrawerService,
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
      },
      {
        key: 'netMovement',
        label: 'Net Stock Movement',
        value: `${summary.netMovementQty > 0 ? '+' : ''}${summary.netMovementQty} Units`,
        icon: TrendingUp,
        color: 'emerald',
      },
      {
        key: 'outOfStock',
        label: 'Out of Stock Items',
        value: `${summary.totalItemsOutOfStock} Items`,
        icon: AlertCircle,
        color: 'rose',
      },
      {
        key: 'fastMoving',
        label: 'Fast-Moving Items',
        value: `${summary.fastMovingItems?.length || 0} Items`,
        icon: Zap,
        color: 'orange',
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

  searchItemInStockById(itemId: number) {
    this.stockFilter.itemId = itemId;
    this.stockFilter.warehouseId = 1;
    this.selectedItemDetail = null;
    this.stockService.searchItems(
      this.stockFilter,
      (response: any) => {
        const data = response?.data || [];
        if (data.length > 0) {
          // Assign the first item found
          this.selectedItemDetail = data[0];
          this.openStockItemDetailsDrawer();
        } else {
          this.toastService.show('No details found for this item', 'warning');
        }
      },
      (error: any) => {
        console.error("Failed to fetch details", error);
        this.toastService.show('Failed to fetch item details', 'error');
      }
    );
  }

  openStockItemDetailsDrawer() {
    this.drawerSvc.openTemplate(
      this.stockItemDetail,
      'Item Stock Details',
      'lg'
    );
  }

  calculateTotalStock(batches: BatchDetailModel[] | undefined): number {
    if (!batches) return 0;
    return batches.reduce((sum, batch) => sum + (batch.remainingQty || 0), 0);
  }
  // 1. Get Color Class based on expiry (Background or Text)
  getExpiryStatusColor(expiryDate: number, type: 'bg' | 'text'): string {
    const days = this.getDaysDifference(expiryDate);

    if (days < 0) return type === 'bg' ? 'bg-red-500' : 'text-red-600';
    if (days < 30) return type === 'bg' ? 'bg-amber-400' : 'text-amber-600'; // Warning
    return type === 'bg' ? 'bg-emerald-500' : 'text-emerald-600'; // Good
  }

  // 2. Get readable text (e.g., "Expires in 5 days")
  getDaysRemainingText(expiryDate: number): string {
    const days = Math.floor(this.getDaysDifference(expiryDate));
    if (days < 0) return `Expired ${Math.abs(days)} days ago`;
    if (days === 0) return 'Expires today';
    return `${days} days remaining`;
  }

  // Helper to calculate difference
  private getDaysDifference(expiryDate: number): number {
    const today = new Date().getTime();
    const expiry = new Date(expiryDate).getTime();
    return (expiry - today) / (1000 * 3600 * 24);
  }


  handleTableAction(event: TableAction) {
    // Check if the event is the specific custom action we defined
    if (event.type === 'custom' && event.key === 'view_item_details') {
      console.log('Viewing item details:', event.row);
      this.searchItemInStockById(event.row['itemId']);
    }
    // You can handle other actions here (edit, delete, etc.)
    else {
      this.onTableAction(event);
    }
  }

  downloadCurrentStockReport() {
    this.drawerSvc.openComponent(BulkUploadComponent,
      {},
      "Bulk Data Management",
      'lg'
    )
  }

  handleHeaderAction(event: HeaderAction) {
    if (event.key === 'bulk_download') {
      this.downloadCurrentStockReport();
    }
  }

  onPageChange(page: number) {
    this.page = page;
    this.getCurrentStock();
  }
  onLoadMore() {
    // Implement if using infinite scroll
  }

  onTableAction(event: TableAction) {
    console.log('Table action:', event);
  }
}