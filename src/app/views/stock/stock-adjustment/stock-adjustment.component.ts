import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { StockAdjustmentModel } from '../models/stock-adjustment.model';
import { PaginationConfig, TableAction, TableActionConfig } from '../../../layouts/components/standard-table/standard-table.model';
import { Router } from '@angular/router';
import { ArrowRight } from 'lucide-angular';
import { DrawerService } from '../../../layouts/components/drawer/drawerService';
import { LoaderService } from '../../../layouts/components/loader/loaderService';
import { SalesFlowTrackerComponent } from '../../../layouts/components/sales-flow-tracker/sales-flow-tracker.component';
import { ToastService } from '../../../layouts/components/toast/toastService';
import { SALES_ORDER_COLUMNS } from '../../../layouts/config/tableConfig';
import { SalesOrderService } from '../../sales/sales-order/sales-order.service';

@Component({
  selector: 'app-stock-adjustment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stock-adjustment.component.html',
  styleUrl: './stock-adjustment.component.css'
})
export class StockAdjustmentComponent {

  stockAdjustmentDetails: StockAdjustmentModel[] = [];

  pagination: PaginationConfig = { pageSize: 20, currentPage: 1, totalItems: 0 };

  soColumn: any = SALES_ORDER_COLUMNS;

  soActions: TableActionConfig[] = [
    {
      key: 'move_to_invoice',
      label: 'Move to Invoice',
      icon: ArrowRight,
      color: 'primary',
      // Only show if status is Approved
      condition: (row) => row['status'] === 'CREATED'
    }
  ];

  constructor(
    private salesOrderService: SalesOrderService,
    public drawerService: DrawerService,
    private toastSvc: ToastService,
    private router: Router,
    private loaderSvc: LoaderService
  ) {
  }

  ngOnInit(): void {
    this.getAllSalesAdjustments();
  }

  getAllSalesAdjustments() {
    this.loaderSvc.show();
    const apiPage = this.pagination.currentPage > 0 ? this.pagination.currentPage - 1 : 0;
    this.salesOrderService.getAllSalesOrders(
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
        console.error('Error fetching Stock Adjustments:', error);
      }
    );
  }

  getSalesOrderById(id: number | string) {
    this.salesOrderService.getSalesOrderById(
      Number(id),
      (response: any) => {
        console.log('Sales Order Details:', response.data);
      }
      ,
      (error: any) => {
        this.toastSvc.show('Failed to load Sales Order details', 'error');
        console.error('Error fetching Sales Order details:', error);
      }
    );
  }

  viewSalesOrderDetail(id: number | string) {
    this.getSalesOrderById(id);
    this.drawerService.openComponent(
      SalesFlowTrackerComponent,
      { salesOrderId: id },
      'Order Details',
      'xl',
    );
  }

  updateSalesOrder(id: number | string) {
    this.router.navigate(['/sales/order/edit', id]);
  }

  handleTableAction(event: TableAction) {
    if (event.type === 'custom' && event.key === 'move_to_invoice') {
      console.log('Moving PO to Invoice:', event.row.id);
      this.router.navigate(['/sales/invoice/create'], {
        queryParams: { salesOrderId: event.row.id }
      });
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
        this.viewSalesOrderDetail(row.id);
        break;
      case 'edit':
        this.updateSalesOrder(row.id);
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
  }

  onLoadMore() {
    console.log('Load more triggered');
  }

}
