import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { StandardTableComponent } from "../../../layouts/components/standard-table/standard-table.component";
import { SalesOrderModal } from './sales-order.modal';
import { Router } from '@angular/router';
import { DrawerService } from '../../../layouts/components/drawer/drawerService';
import { PaginationConfig, TableAction, TableActionConfig, TableColumn } from '../../../layouts/components/standard-table/standard-table.model';
import { ToastService } from '../../../layouts/components/toast/toastService';
import { SalesOrderService } from './sales-order.service';
import { ArrowRight, View } from 'lucide-angular';
import { LoaderService } from '../../../layouts/components/loader/loaderService';

@Component({
  selector: 'app-sales-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, StandardTableComponent],
  templateUrl: './sales-order.component.html',
  styleUrls: ['./sales-order.component.css']
})
export class SalesOrderComponent implements OnInit {

  @ViewChild('soDetails') soDetails!: TemplateRef<any>;
  readonly ArrowRight = ArrowRight;
  salesOrders: SalesOrderModal[] = [];
  salesOrderDetail: SalesOrderModal | null = null;
  pagination: PaginationConfig = { pageSize: 20, currentPage: 1, totalItems: 0 };

  columns: TableColumn[] = [
    { key: 'orderNumber', label: 'Order No', width: '130px', type: 'link' },
    { key: 'customerId', label: 'Customer ID', width: '100px', type: 'text' },
    { key: 'customerName', label: 'Customer', width: '220px', type: 'text' },
    { key: 'orderDate', label: 'Order Date', width: '130px', type: 'date', align: 'center' },
    { key: 'grandTotal', label: 'Amount', width: '120px', type: 'currency', align: 'right' },
    { key: 'totalDiscount', label: "Dis %", width: '120px', type: 'currency', align: 'right' },
    { key: 'status', label: 'Status', width: '140px', type: 'badge' },
    { key: 'actions', label: 'Actions', width: '120px', type: 'action', align: 'center', sortable: false }
  ];

  soActions: TableActionConfig[] = [
    {
      key: 'move_to_invoice',
      label: 'Move to Invoice',
      icon: ArrowRight,
      color: 'primary',
      // Only show if status is Approved
      condition: (row) => row['status'] !== 'COMPLETED'
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
    this.getAllSalesOrders();
  }

  getAllSalesOrders() {
    this.loaderSvc.show();
    const apiPage = this.pagination.currentPage > 0 ? this.pagination.currentPage - 1 : 0;
    this.salesOrderService.getAllSalesOrders(
      apiPage,
      this.pagination.pageSize,
      {},
      (response: any) => {
        this.salesOrders = response.data.content;
        this.pagination = {
          currentPage: this.pagination.currentPage,
          totalItems: response.data.totalElements,
          pageSize: response.data.size
        };
        this.loaderSvc.hide();
      },
      (error: any) => {
        this.loaderSvc.hide();
        this.toastSvc.show('Failed to load Items', 'error');
        console.error('Error fetching items:', error);
      }
    );
  }

  getSalesOrderById(id: number | string) {
    this.salesOrderService.getSalesOrderById(
      Number(id),
      (response: any) => {
        this.salesOrderDetail = response.data;
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
    this.drawerService.open(this.soDetails);
  }

  updateSalesOrder(id: number | string) {
    this.router.navigate(['/sales/order/edit', id]);
  }

  handleTableAction(event: TableAction) {
    if (event.type === 'custom' && event.key === 'move_to_invoice') {
      console.log('Moving PO to Invoice:', event.row);
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
    this.getAllSalesOrders();
  }

  onLoadMore() {
    console.log('Load more triggered');
  }
}