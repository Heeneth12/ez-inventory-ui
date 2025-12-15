import { CommonModule } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core'; // Added TemplateRef, ViewChild
import { StockAdjustmentDetailModel, StockAdjustmentModel } from '../models/stock-adjustment.model';
import { HeaderAction, PaginationConfig, TableAction, TableActionConfig } from '../../../layouts/components/standard-table/standard-table.model';
import { Router } from '@angular/router';
import { ArrowRight, Eye, FilePlusCorner, Printer, Receipt } from 'lucide-angular';
import { DrawerService } from '../../../layouts/components/drawer/drawerService';
import { LoaderService } from '../../../layouts/components/loader/loaderService';
import { ToastService } from '../../../layouts/components/toast/toastService';
import { STOCK_ADJUSTMENT_COLUMNS } from '../../../layouts/config/tableConfig';
import { StandardTableComponent } from "../../../layouts/components/standard-table/standard-table.component";
import { StockService } from '../stock.service';

@Component({
  selector: 'app-stock-adjustment',
  standalone: true,
  imports: [CommonModule, StandardTableComponent],
  templateUrl: './stock-adjustment.component.html',
  styleUrl: './stock-adjustment.component.css'
})
export class StockAdjustmentComponent implements OnInit {

  // Get reference to the HTML template
  @ViewChild('stockAdjestemnt') stockAdjTemplate!: TemplateRef<any>;

  stockAdjustmentDetails: StockAdjustmentModel[] = [];
  stockAdjustmentSummary: StockAdjustmentDetailModel | null = null;
  stockAdjColumn: any = STOCK_ADJUSTMENT_COLUMNS;

  pagination: PaginationConfig = { pageSize: 20, currentPage: 1, totalItems: 0 };

  soActions: TableActionConfig[] = [
    {
      key: 'view_stockadj_details',
      label: 'View Details',
      icon: ArrowRight,
      color: 'primary',
      condition: (row) => true // Show for all or filter based on status
    }
  ];


  myHeaderActions: HeaderAction[] = [
    {
      label: 'Create',
      icon: FilePlusCorner, // Pass the Lucide icon object directly file-plus-corner
      variant: 'primary',
      action: () => this.moveToCreateStockAdj() // Direct callback
    },
  ];

  constructor(
    private stockService: StockService,
    public drawerService: DrawerService,
    private toastSvc: ToastService,
    private router: Router,
    private loaderSvc: LoaderService
  ) { }

  ngOnInit(): void {
    this.getAllSalesAdjustments();
  }

  getAllSalesAdjustments() {
    this.loaderSvc.show();
    const apiPage = this.pagination.currentPage > 0 ? this.pagination.currentPage - 1 : 0;
    this.stockService.getStockAdjustments(
      apiPage,
      this.pagination.pageSize,
      {},
      (response: any) => {
        this.stockAdjustmentDetails = response.data.content;
        this.pagination = {
          currentPage: this.pagination.currentPage,
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

  moveToCreateStockAdj(){
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
    this.getAllSalesAdjustments();
  }

  onLoadMore() {
    console.log('Load more triggered');
  }
}