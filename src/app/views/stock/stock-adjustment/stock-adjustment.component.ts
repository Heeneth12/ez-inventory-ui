import { CommonModule } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core'; // Added TemplateRef, ViewChild
import { StockAdjustmentDetailModel, StockAdjustmentFilter, StockAdjustmentModel } from '../models/stock-adjustment.model';
import { HeaderAction, PaginationConfig, TableAction, TableActionConfig } from '../../../layouts/components/standard-table/standard-table.model';
import { Router } from '@angular/router';
import { ArrowRight, FilePlusCorner } from 'lucide-angular';
import { DrawerService } from '../../../layouts/components/drawer/drawerService';
import { LoaderService } from '../../../layouts/components/loader/loaderService';
import { ToastService } from '../../../layouts/components/toast/toastService';
import { STOCK_ADJUSTMENT_COLUMNS } from '../../../layouts/config/tableConfig';
import { StandardTableComponent } from "../../../layouts/components/standard-table/standard-table.component";
import { StockService } from '../stock.service';
import { DatePickerConfig, DateRangeEmit } from '../../../layouts/UI/date-picker/date-picker.component';
import { FilterOption } from '../../../layouts/UI/filter-dropdown/filter-dropdown.component';
import { Subject } from 'rxjs/internal/Subject';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-stock-adjustment',
  standalone: true,
  imports: [CommonModule, StandardTableComponent],
  templateUrl: './stock-adjustment.component.html',
  styleUrl: './stock-adjustment.component.css'
})
export class StockAdjustmentComponent implements OnInit {

  private tableRefresh$ = new Subject<void>();

  // Get reference to the HTML template
  @ViewChild('stockAdjestemnt') stockAdjTemplate!: TemplateRef<any>;

  stockAdjustmentDetails: StockAdjustmentModel[] = [];
  stockAdjustmentSummary: StockAdjustmentDetailModel | null = null;
  stockAdjustmentFilter: StockAdjustmentFilter = new StockAdjustmentFilter();
  stockAdjColumn: any = STOCK_ADJUSTMENT_COLUMNS;

  pagination: PaginationConfig = { pageSize: 20, currentPage: 1, totalItems: 0 };

  soActions: TableActionConfig[] = [
    {
      key: 'view_stockadj_details',
      label: 'View Details',
      icon: ArrowRight,
      color: 'primary',
      condition: (row) => true
    }
  ];

  myHeaderActions: HeaderAction[] = [
    {
      label: 'Create',
      icon: FilePlusCorner,
      variant: 'secondary',
      action: () => this.moveToCreateStockAdj()
    },
  ];

  filterConfig: FilterOption[] = [
    {
      id: 'type',
      label: 'Type',
      type: 'checkbox',
      searchable: true,
      options: [
        { label: 'COMPLETED', value: 'COMPLETED' },
        { label: 'PENDING APPROVAL', value: 'PENDING_APPROVAL' },
        { label: 'DRAFT', value: 'DRAFT' },
        { label: 'REJECTED', value: 'REJECTED' }
      ]
    }
  ];

  dateConfig: DatePickerConfig = {
    type: 'both',
    placeholder: 'Start - End'
  };

  constructor(
    private stockService: StockService,
    public drawerService: DrawerService,
    private toastSvc: ToastService,
    private router: Router,
    private loaderSvc: LoaderService
  ) { }

  ngOnInit(): void {
    this.setupTablePipeline();
    this.tableRefresh$.next();
  }

  private setupTablePipeline() {
    this.tableRefresh$.pipe(
      debounceTime(400)
    ).subscribe(() => {
      this.getAllSalesAdjustments();
    });
  }

  getAllSalesAdjustments() {
    this.loaderSvc.show();
    const apiPage = this.pagination.currentPage > 0 ? this.pagination.currentPage - 1 : 0;
    this.stockService.getStockAdjustments(
      apiPage,
      this.pagination.pageSize,
      this.stockAdjustmentFilter,
      (response: any) => {
        this.stockAdjustmentDetails = response.data.content;
        this.pagination = {
          ...this.pagination, // Keep current state
          totalItems: response.data.totalElements,
          pageSize: response.data.size
        };
        this.loaderSvc.hide();
      },
      (error: any) => {
        this.loaderSvc.hide();
        this.toastSvc.show('Failed to load Stock Adjustments', 'error');
      }
    );
  }

  moveToCreateStockAdj() {
    this.router.navigate(['/stock/adjustment/create']);
  }

  // Updated to use the ViewChild
  viewStockAdjustmentDetails(id: number | string) {
    this.stockAdjustmentSummary = null; // Reset previous data
    this.drawerService.openTemplate(
      this.stockAdjTemplate, // Pass the actual template reference
      'Adjustment Details',
      'xl',
    );
    this.getStockAdjustmentDetails(id);
  }

  getStockAdjustmentDetails(id: number | string) {
    this.loaderSvc.show();
    this.stockService.getStockAdjustmentById(
      id,
      (response: any) => {
        this.stockAdjustmentSummary = response.data;
        this.loaderSvc.hide();
      },
      (error: any) => {
        this.loaderSvc.hide();
        this.toastSvc.show("Failed to load details", "error");
      }
    );
  }

  handleTableAction(event: TableAction) {
    if (event.type === 'custom' && event.key === 'view_stockadj_details') {
      console.log('View stock adj details:', event.row.id);
      this.viewStockAdjustmentDetails(event.row.id);
    }
    if (event.type === 'edit') {
      // Standard edit logic
    }
  }

  onTableAction(event: TableAction) {
    const { type, row, key } = event;

    switch (type) {
      case 'view':
        console.log("View:", row.id);
        break;
      case 'edit':
        break;
      case 'delete':
        console.log("Delete:", row.id);

        break;
      case 'toggle':
        break;
    }
  }

  onPageChange(newPage: number) {
    this.pagination = { ...this.pagination, currentPage: newPage };
    this.tableRefresh$.next();
  }

  onLoadMore() {
    console.log('Load more triggered');
    this.tableRefresh$.next();
  }

  onFilterDate(range: DateRangeEmit) {
    this.stockAdjustmentFilter.fromDate = range.from ? this.formatDate(range.from) : null;
    this.stockAdjustmentFilter.toDate = range.to ? this.formatDate(range.to) : null;
    this.pagination.currentPage = 1;
    this.tableRefresh$.next();
  }

  onFilterUpdate($event: Record<string, any>) {
    this.stockAdjustmentFilter.statuses = $event['type'] || null;
    this.pagination.currentPage = 1;
    this.tableRefresh$.next();
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}