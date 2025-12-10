import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DeliveryFilterModel, DeliveryModel } from './delivery.model';
import { PaginationConfig, TableAction, TableColumn } from '../../../layouts/components/standard-table/standard-table.model';
import { Router } from '@angular/router';
import { LoaderService } from '../../../layouts/components/loader/loaderService';
import { ModalService } from '../../../layouts/components/modal/modalService';
import { ToastService } from '../../../layouts/components/toast/toastService';
import { DeliveryService } from './delivery.service';
import { StandardTableComponent } from "../../../layouts/components/standard-table/standard-table.component";

@Component({
  selector: 'app-delivery',
  standalone: true,
  imports: [CommonModule, StandardTableComponent],
  templateUrl: './delivery.component.html',
  styleUrl: './delivery.component.css'
})
export class DeliveryComponent implements OnInit {

  deliveryDetails: DeliveryModel[] = [];
  deliveryFilter: DeliveryFilterModel = new DeliveryFilterModel();

  pagination: PaginationConfig = { pageSize: 15, currentPage: 1, totalItems: 0 };
  isLoading = false;
  selectedItemIds: (string | number)[] = [];

  columns: TableColumn[] = [
    { key: 'id', label: 'ID', width: '60px', align: 'center', type: 'text' },
    { key: 'deliveryNumber', label: 'Delivery Number', width: '230px', type: 'text' },
    { key: 'itemCode', label: 'Code', width: '110px', type: 'text' },
    { key: 'customerName', label: 'Customer Name', width: '110px', type: 'text' },
    { key: 'type', label: 'Type', width: '100px', type: 'badge' },
    { key: 'status', label: 'Status', width: '90px', type: 'badge' },
    { key: 'scheduledDate', label: 'Scheduled Date', align: 'right', width: '110px', type: 'date' },
    { key: 'shippedDate', label: 'Shipped Date', align: 'right', width: '110px', type: 'date' },
    { key: 'deliveredDate', label: 'Delivered Date', align: 'right', width: '110px', type: 'date' },
    { key: 'actions', label: 'Actions', align: 'center', width: '120px', type: 'action', sortable: false }
  ];

  constructor(
    private deliveryService: DeliveryService,
    private router: Router,
    private toastService: ToastService,
    private loaderSvc: LoaderService,
    private modalService: ModalService
  ) {
  }
  ngOnInit(): void {
    this.getAllDeliveries();
  }

  getAllDeliveries() {
    this.loaderSvc.show();
    const apiPage = this.pagination.currentPage > 0 ? this.pagination.currentPage - 1 : 0;
    this.deliveryService.getAllDeliveries(
      apiPage,
      this.pagination.pageSize,
      this.deliveryFilter,
      (response: any) => {
        this.deliveryDetails = response.data.content;
        this.pagination = {
          currentPage: this.pagination.currentPage,
          totalItems: response.data.totalElements,
          pageSize: response.data.size
        };
        this.loaderSvc.hide();
      },
      (error: any) => {
        this.loaderSvc.hide();
        this.toastService.show('Failed to load Items', 'error');
        console.error('Error fetching items:', error);
      }
    );
  }

  onSelectionChange(selectedIds: (string | number)[]) {
    this.selectedItemIds = selectedIds;
    console.log("Current Selection:", this.selectedItemIds);
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
    this.getAllDeliveries();
  }

  onLoadMore() {
  }

}
