import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DeliveryFilterModel, DeliveryModel, ShipmentStatus } from './delivery.model';
import { PaginationConfig, TableAction, TableActionConfig, TableColumn } from '../../../layouts/components/standard-table/standard-table.model';
import { Router } from '@angular/router';
import { LoaderService } from '../../../layouts/components/loader/loaderService';
import { ModalService } from '../../../layouts/components/modal/modalService';
import { ToastService } from '../../../layouts/components/toast/toastService';
import { DeliveryService } from './delivery.service';
import { StandardTableComponent } from "../../../layouts/components/standard-table/standard-table.component";
import { Truck, TruckElectric } from 'lucide-angular';
import { DELIVERY_COLUMNS } from '../../../layouts/config/tableConfig';

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

  columns: TableColumn[] = DELIVERY_COLUMNS;
  deliveryActions: TableActionConfig[] = [
    {
      key: 'make_as_delivered',
      label: 'Mark as Delivered',
      icon: Truck,
      color: 'primary',
      // Only show if status is Approved
      condition: (row) => row['status'] === 'SHIPPED'
    },
    {
      key: 'move_to_delivery',
      label: 'Move to delivary',
      icon: TruckElectric,
      color: 'danger',
      // Only show if status is Approved
      condition: (row) => row['status'] === 'SCHEDULED'
    }
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

  updateDelivaryStatus(id: any, status: ShipmentStatus) {
    this.deliveryService.updateDeliveryStatus(
      {
        id: id,
        status: status
      },
      (response: any) => {
        this.toastService.show("Delivery updated successfully", 'success');
        this.getAllDeliveries();
      },
      (error: any) => {
        this.toastService.show("Failed to update delivery", 'error');
      }
    );
  }

  deliveriedInvoice(deliveryIds: string | number) {
    this.deliveryService.markAsDelivered(deliveryIds,
      (response: any) => {
        this.toastService.show('Delivery marked as delivered', 'success');
        this.getAllDeliveries();
      },
      (error: any) => {
        this.toastService.show('Failed to mark as delivered', 'error');
        console.error('Error marking as delivered:', error);
      }
    );
  }

  handleTableAction(event: TableAction) {
    if (event.type === 'custom' && event.key === 'make_as_delivered') {
      console.log(':', event.row);
      this.updateDelivaryStatus(event.row.id, ShipmentStatus.DELIVERED);
    }
    if (event.type === 'custom' && event.key === 'move_to_delivery') {
      this.updateDelivaryStatus(event.row.id, ShipmentStatus.SHIPPED)
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
    this.getAllDeliveries();
  }

  onLoadMore() {
  }

}
