import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DeliveryFilterModel, DeliveryModel, RouteCreateRequest, ShipmentStatus } from './delivery.model';
import { HeaderAction, PaginationConfig, TableAction, TableColumn } from '../../../layouts/components/standard-table/standard-table.model';
import { LoaderService } from '../../../layouts/components/loader/loaderService';
import { ToastService } from '../../../layouts/components/toast/toastService';
import { DeliveryService } from './delivery.service';
import { StandardTableComponent } from '../../../layouts/components/standard-table/standard-table.component';
import { CalendarClock, CheckCircle, Clock, Download, LucideAngularModule, MapPin, Route, Truck, User, XCircle } from 'lucide-angular';
import { DateRangeEmit } from '../../../layouts/UI/date-picker/date-picker.component';
import { DELIVERY_ACTIONS, DELIVERY_COLUMNS, DELIVERY_DATE_CONFIG, DELIVERY_FILTER_OPTIONS } from '../salesConfig';
import { StatCardConfig, StatGroupComponent } from '../../../layouts/UI/stat-group/stat-group.component';
import { DrawerService } from '../../../layouts/components/drawer/drawerService';
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
  @ViewChild('deliveryDetailTemplate') deliveryDetailTemplate!: TemplateRef<any>;

  readonly MapPinIcon = MapPin;
  readonly RouteIcon = Route;
  readonly CalendarClockIcon = CalendarClock;
  readonly UserIcon = User;
  readonly TruckIcon = Truck;

  deliveryDetails: DeliveryModel[] = [];
  selectedDelivery: DeliveryModel | null = null;
  deliveryFilter: DeliveryFilterModel = new DeliveryFilterModel();
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
  ];;

  constructor(
    private deliveryService: DeliveryService,
    private toastService: ToastService,
    private loaderSvc: LoaderService,
    private drawerService: DrawerService,
    private sanitizer: DomSanitizer,
    private confirmationModalService: ConfirmationModalService
  ) {
  }

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
    console.log('Current Selection:', this.selectedItemIds);
  }

  updateDelivaryStatus(id: any, status: ShipmentStatus) {
    this.deliveryService.updateDeliveryStatus(
      id,
      status,
      (response: any) => {
        this.toastService.show('Delivery updated successfully', 'success');
        this.tableState$.next();
        // If the drawer is open with this delivery, update its status
        if (this.selectedDelivery && this.selectedDelivery.id === id) {
          //this.selectedDelivery.status ;
        }
      },
      (error: any) => {
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
      (res: any) => {
        this.toastService.show('Route Batch created successfully', 'success');
        this.selectedItemIds = [];
        this.tableState$.next();
      },
      (err: any) => this.toastService.show('Failed to create batch', 'error')
    );
  }

  deliveriedInvoice(deliveryIds: string | number) {
    this.deliveryService.markAsDelivered(deliveryIds,
      (response: any) => {
        this.toastService.show('Delivery marked as delivered', 'success');
        this.tableState$.next();
      },
      (error: any) => {
        this.toastService.show('Failed to mark as delivered', 'error');
        console.error('Error marking as delivered:', error);
      }
    );
  }


  downloadBulkDeliveryItemsExcel() {
    this.deliveryService.downloadBulkDeliveryItemsExcel(this.deliveryFilter,
      (res: any) => {
        this.toastService.show('Bulk delivery items downloaded successfully', 'success');
      },
      (err: any) => this.toastService.show('Failed to download bulk delivery items', 'error')
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
      this.updateDelivaryStatus(event.row.id, ShipmentStatus.SHIPPED);
    }
    if (event.type === 'custom' && event.key === 'view_delivery') {
      this.openDeliveryDetails(event.row.id);
    }
    if (event.type === 'edit') {
      // Standard edit logic
    }
  }

  openDeliveryDetails(deliveryId: string | number) {
    this.loaderSvc.show();
    this.deliveryService.getDeliveryById(String(deliveryId),
      (response: any) => {
        this.selectedDelivery = response.data;
        this.loaderSvc.hide();
        this.drawerService.openTemplate(
          this.deliveryDetailTemplate,
          `Delivery: ${this.selectedDelivery?.deliveryNumber || deliveryId}`,
          'lg'
        );
      },
      () => {
        this.loaderSvc.hide();
        this.toastService.show('Failed to fetch delivery details', 'error');
      }
    );
  }

  getMapUrl(address?: string): SafeResourceUrl {
    const destination = encodeURIComponent(address || 'Chennai');
    const url = `https://maps.google.com/maps?q=${destination}&z=14&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getExpectedArrival(delivery: DeliveryModel | null): string | null {
    if (!delivery) return null;
    const date = delivery.deliveredDate || delivery.scheduledDate || delivery.shippedDate;
    return date ? this.formatDate(date) : null;
  }

  onFilterDate(range: DateRangeEmit) {
    console.log('Filter table by:', range.from, range.to);
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
    console.log('Received filter update:', $event);
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

  onLoadMore() {
  }
}
