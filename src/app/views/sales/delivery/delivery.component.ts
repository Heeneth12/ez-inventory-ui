import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { DeliveryFilterModel, DeliveryModel, RouteCreateRequest, ShipmentStatus } from './delivery.model';
import { HeaderAction, PaginationConfig, TableAction, TableColumn } from '../../../layouts/components/standard-table/standard-table.model';
import { Router } from '@angular/router';
import { LoaderService } from '../../../layouts/components/loader/loaderService';
import { ModalService } from '../../../layouts/components/modal/modalService';
import { ToastService } from '../../../layouts/components/toast/toastService';
import { DeliveryService } from './delivery.service';
import { StandardTableComponent } from "../../../layouts/components/standard-table/standard-table.component";
import { CheckCircle, Clock, Truck, XCircle } from 'lucide-angular';
import { DateRangeEmit } from '../../../layouts/UI/date-picker/date-picker.component';
import { DELIVERY_ACTIONS, DELIVERY_COLUMNS, DELIVERY_DATE_CONFIG, DELIVERY_FILTER_OPTIONS } from '../salesConfig';
import { StatCardConfig, StatGroupComponent } from "../../../layouts/UI/stat-group/stat-group.component";

@Component({
  selector: 'app-delivery',
  standalone: true,
  imports: [CommonModule, StandardTableComponent, StatGroupComponent],
  templateUrl: './delivery.component.html',
  styleUrl: './delivery.component.css'
})
export class DeliveryComponent implements OnInit {

  @Input() customerId?: number;
  @Input() statGroup?: boolean = true;

  deliveryDetails: DeliveryModel[] = [];
  deliveryFilter: DeliveryFilterModel = new DeliveryFilterModel();

  pagination: PaginationConfig = { pageSize: 15, currentPage: 1, totalItems: 0 };
  isLoading = false;
  selectedItemIds: (string | number)[] = [];

  columns: TableColumn[] = DELIVERY_COLUMNS;
  deliveryActions = DELIVERY_ACTIONS;
  dateConfig = DELIVERY_DATE_CONFIG;
  FilterOptions = DELIVERY_FILTER_OPTIONS;


  headerActions: HeaderAction[] = [
    {
      label: 'Create Route Manifest',
      icon: Truck,
      variant: 'primary',
      key: 'create_route',
    }
  ];

  deliveryDashboardStats: StatCardConfig[] = [
    {
      key: 'active_manifests',
      label: 'Active Manifests',
      value: 0,
      icon: Truck,
      color: 'emerald',
    },
    {
      key: 'pending_deliveries',
      label: 'Pending Deliveries',
      value: 0,
      icon: Clock,
      color: 'gray',
    },
    {
      key: 'completed_deliveries',
      label: 'Completed Deliveries',
      value: 0,
      icon: CheckCircle,
      color: 'gray',
    },
    {
      key: 'cash_on_delivery',
      label: 'Cash on Delivery',
      value: 0,
      icon: XCircle,
      color: 'gray',
    }
  ];;

  constructor(
    private deliveryService: DeliveryService,
    private router: Router,
    private toastService: ToastService,
    private loaderSvc: LoaderService,
    private modalService: ModalService
  ) {
  }
  ngOnInit(): void {
    if (this.customerId) {
      this.deliveryFilter.customerId = this.customerId;
    }
    this.getAllDeliveries();
    this.getSummaryStats();
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
      id,
      status,
      (response: any) => {
        this.toastService.show("Delivery updated successfully", 'success');
        this.getAllDeliveries();
      },
      (error: any) => {
        this.toastService.show("Failed to update delivery", 'error');
      }
    );
  }


  processBatchAssignment() {
    if (this.selectedItemIds.length === 0) {
      this.toastService.show("select atlease one", 'info');
      return;
    }
    const request: RouteCreateRequest = {
      areaName: 'Downtown Area', // This could come from a small popup input
      driverId: 1,             // Selected from an employee dropdown
      vehicleNumber: 'TRUCK-01',
      deliveryIds: this.selectedItemIds.map(id => Number(id))
    };

    this.deliveryService.createRoute(request,
      (res: any) => {
        this.toastService.show('Route Batch created successfully', 'success');
        this.selectedItemIds = [];
        this.getAllDeliveries();
      },
      (err: any) => this.toastService.show('Failed to create batch', 'error')
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

  getSummaryStats() {
    this.deliveryService.getRouteSummary((res: any) => {
      const data = res.data;
      this.deliveryDashboardStats = [
        {
          key: 'active_manifests',
          label: 'Active Manifests',
          value: data.totalRoutes,
          icon: Truck,
          color: 'emerald',
        },
        {
          key: 'pending_deliveries',
          label: 'Pending Deliveries',
          value: data.pendingDeliveries,
          icon: Clock,
          color: 'amber',
        },
        {
          key: 'completed_deliveries',
          label: 'Completed Deliveries',
          value: data.completedDeliveries,
          icon: CheckCircle,
          color: 'teal',
        },
        {
          key: 'cash_on_delivery',
          label: 'Cash on Delivery',
          value: data.cashOnDelivery,
          icon: XCircle,
          color: 'rose',
        }
      ];

    },
      (err: any) => this.toastService.show('Failed to load summary', 'error'));
  }

  handleTableAction(event: TableAction) {
    if (event.type === 'custom' && event.key === 'make_as_delivered') {
      this.updateDelivaryStatus(event.row.id, ShipmentStatus.DELIVERED);
    }
    if (event.type === 'custom' && event.key === 'move_to_delivery') {
      this.updateDelivaryStatus(event.row.id, ShipmentStatus.SHIPPED)
    }
    if (event.type === 'edit') {
      // Standard edit logic
    }
  }


  onFilterDate(range: DateRangeEmit) {
    console.log('Filter table by:', range.from, range.to);
    this.deliveryFilter.fromDate = range.from
      ? this.formatDate(range.from)
      : null;

    this.deliveryFilter.toDate = range.to
      ? this.formatDate(range.to)
      : null;
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  onFilterUpdate($event: Record<string, any>) {
    console.log("Received filter update:", $event);
    this.deliveryFilter.shipmentTypes = $event['type'] || null;
    this.deliveryFilter.shipmentStatuses = $event['shipmentStatus'] || null;
    this.getAllDeliveries();
  }

  handleHeaderAction(event: HeaderAction) {
    if (event.key === 'create_route') {
      this.processBatchAssignment();
    }
  }

  onPageChange(newPage: number) {
    this.pagination = { ...this.pagination, currentPage: newPage };
    this.getAllDeliveries();
  }

  onLoadMore() {
  }
}
