import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DeliveryFilterModel, DeliveryModel, DeliveryStatusUpdateRequest, RouteCreateRequest, ShipmentStatus } from './delivery.model';
import { HeaderAction, PaginationConfig, TableAction, TableColumn } from '../../../layouts/components/standard-table/standard-table.model';
import { LoaderService } from '../../../layouts/components/loader/loaderService';
import { ToastService } from '../../../layouts/components/toast/toastService';
import { DeliveryService } from './delivery.service';
import { StandardTableComponent } from '../../../layouts/components/standard-table/standard-table.component';
import { CheckCircle, Clock, Download, LucideAngularModule, Truck, XCircle } from 'lucide-angular';
import { DateRangeEmit } from '../../../layouts/UI/date-picker/date-picker.component';
import { DELIVERY_ACTIONS, DELIVERY_COLUMNS, DELIVERY_DATE_CONFIG, DELIVERY_FILTER_OPTIONS } from '../salesConfig';
import { StatCardConfig, StatGroupComponent } from '../../../layouts/UI/stat-group/stat-group.component';
import { ConfirmationModalService } from '../../../layouts/UI/confirmation-modal/confirmation-modal.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-delivery',
  standalone: true,
  imports: [CommonModule, StandardTableComponent, StatGroupComponent, LucideAngularModule],
  templateUrl: './delivery.component.html',
  styleUrl: './delivery.component.css'
})
export class DeliveryComponent implements OnInit {

  @Input() customerId?: number;
  @Input() statGroup?: boolean = true;

  readonly TruckIcon = Truck;
  readonly CheckCircleIcon = CheckCircle;
  readonly ClockIcon = Clock;
  readonly XCircleIcon = XCircle;

  deliveryDetails: DeliveryModel[] = [];
  deliveryFilter: DeliveryFilterModel = new DeliveryFilterModel();
  deliveryStatusUpdate: DeliveryStatusUpdateRequest = new DeliveryStatusUpdateRequest();
  private tableState$ = new Subject<void>();

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
    },
    {
      label: 'Bulk Delivery Items',
      icon: Download,
      variant: 'secondary',
      key: 'download_bulk_delivery_items',
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
  ];

  constructor(
    private deliveryService: DeliveryService,
    private toastService: ToastService,
    private loaderSvc: LoaderService,
    private router: Router,
    private route: ActivatedRoute,
    private confirmationModalService: ConfirmationModalService
  ) { }

  ngOnInit(): void {
    if (this.customerId) {
      this.deliveryFilter.customerId = this.customerId;
    }
    this.setupTablePipeline();
    this.tableState$.next();
    this.getSummaryStats();
  }

  private setupTablePipeline() {
    this.tableState$.pipe(
      debounceTime(300),
    ).subscribe(() => {
      this.getAllDeliveries();
    });
  }

  getAllDeliveries() {
    this.isLoading = true;
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
        this.isLoading = false;
      },
      (error: any) => {
        this.isLoading = false;
        this.toastService.show('Failed to load Items', 'error');
        console.error('Error fetching items:', error);
      }
    );
  }

  onSelectionChange(selectedIds: (string | number)[]) {
    this.selectedItemIds = selectedIds;
  }

  updateDelivaryStatus(id: number | string, status: ShipmentStatus, reason: string | null = null, scheduledDate: Date | null = null) {
    this.deliveryStatusUpdate.status = status;
    this.deliveryStatusUpdate.reason = reason;
    this.deliveryStatusUpdate.scheduledDate = scheduledDate;
    this.deliveryService.updateDeliveryStatus(
      id,
      this.deliveryStatusUpdate,
      null, // No file for now
      () => {
        this.toastService.show('Delivery updated successfully', 'success');
        this.tableState$.next();
      },
      () => {
        this.toastService.show('Failed to update delivery', 'error');
      }
    );
  }

  markDeliveryAsShipped(id: any) {
    this.updateDelivaryStatus(id, ShipmentStatus.SHIPPED);
  }

  markDeliveryAsDelivered(id: any) {
    this.updateDelivaryStatus(id, ShipmentStatus.DELIVERED);
  }

  markDeliveryAsCancelled(id: any, reason: string) {
    this.updateDelivaryStatus(id, ShipmentStatus.CANCELLED, reason);
  }

  markDeliveryAsRescheduled(id: any, scheduledDate: string, reason: string) {
    this.updateDelivaryStatus(id, ShipmentStatus.SCHEDULED, reason, new Date(scheduledDate));
  }

  processBatchAssignment() {
    if (this.selectedItemIds.length === 0) {
      this.toastService.show('select atlease one', 'info');
      return;
    }
    const request: RouteCreateRequest = {
      areaName: 'Downtown Area',
      driverId: 1,
      vehicleNumber: 'TRUCK-01',
      deliveryIds: this.selectedItemIds.map(id => Number(id))
    };

    this.deliveryService.createRoute(request,
      () => {
        this.toastService.show('Route Batch created successfully', 'success');
        this.selectedItemIds = [];
        this.tableState$.next();
      },
      () => this.toastService.show('Failed to create batch', 'error')
    );
  }

  downloadBulkDeliveryItemsExcel() {
    this.deliveryService.downloadBulkDeliveryItemsExcel(this.deliveryFilter,
      () => {
        this.toastService.show('Bulk delivery items downloaded successfully', 'success');
      },
      () => this.toastService.show('Failed to download bulk delivery items', 'error')
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
      () => this.toastService.show('Failed to load summary', 'error'));
  }

  handleTableAction(event: TableAction) {
    if (event.type === 'custom' && event.key === 'make_as_delivered') {
      this.updateDelivaryStatus(event.row.id, ShipmentStatus.DELIVERED);
    }
    if (event.type === 'custom' && event.key === 'move_to_delivery') {
      this.updateDelivaryStatus(event.row.id, ShipmentStatus.SHIPPED);
    }
    if (event.type === 'custom' && event.key === 'view_delivery') {
      this.router.navigate(['detail', event.row.id], { relativeTo: this.route });
    }
  }

  onFilterDate(range: DateRangeEmit) {
    this.deliveryFilter.fromDate = range.from
      ? this.formatDate(range.from)
      : null;
    this.deliveryFilter.toDate = range.to
      ? this.formatDate(range.to)
      : null;
    this.tableState$.next();
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  onFilterUpdate($event: Record<string, any>) {
    this.deliveryFilter.shipmentTypes = $event['type'] || null;
    this.deliveryFilter.shipmentStatuses = $event['shipmentStatus'] || null;
    this.tableState$.next();
  }

  handleHeaderAction(event: HeaderAction) {
    if (event.key === 'create_route') {
      if (this.selectedItemIds.length === 0) {
        this.toastService.show('Please select at least one delivery item to create a route manifest.', 'info');
        return;
      }
      this.confirmationModalService.open({
        title: 'Create Route Manifest',
        message: `Are you sure you want to create a route manifest for the ${this.selectedItemIds.length} selected deliveries?`,
        intent: 'info',
        confirmLabel: 'Yes, Create',
        cancelLabel: 'No, Cancel'
      }).then(confirmed => {
        if (confirmed) {
          this.processBatchAssignment();
        }
      });
    }
    if (event.key === 'download_bulk_delivery_items') {
      const selectedCount = this.selectedItemIds.length;
      const message = selectedCount > 0
        ? `Are you sure you want to download bulk delivery items for the ${selectedCount} selected items?`
        : 'Are you sure you want to download bulk delivery items?';

      this.confirmationModalService.open({
        title: 'Download Bulk Delivery Items',
        message: message,
        intent: 'info',
        confirmLabel: 'Yes, Download',
        cancelLabel: 'No, Cancel'
      }).then(confirmed => {
        if (confirmed) {
          this.downloadBulkDeliveryItemsExcel();
        }
      });
    }
  }

  onPageChange(newPage: number) {
    this.pagination = { ...this.pagination, currentPage: newPage };
    this.tableState$.next();
  }

  onLoadMore() { }
}
