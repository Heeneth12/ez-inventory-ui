import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeliveryService } from '../delivery.service';
import { DeliveryModel, RouteModel, ShipmentStatus } from '../delivery.model';
import { Play, CheckCircle, MapPin, LucideAngularModule } from 'lucide-angular';
import { LoaderService } from '../../../../layouts/components/loader/loaderService';
import { StandardTableComponent } from '../../../../layouts/components/standard-table/standard-table.component';
import { PaginationConfig, TableColumn, TableAction, TableActionConfig } from '../../../../layouts/components/standard-table/standard-table.model';
import { ToastService } from '../../../../layouts/components/toast/toastService';
import { DrawerService } from '../../../../layouts/components/drawer/drawerService';

@Component({
  selector: 'app-routes',
  standalone: true,
  imports: [CommonModule, StandardTableComponent, LucideAngularModule],
  templateUrl: './routes.component.html'
})
export class RoutesComponent implements OnInit {

  @ViewChild('routeDetailTemplate') routeDetailTemplate!: TemplateRef<any>;

  readonly MapPin = MapPin;
  readonly CheckCircle = CheckCircle;

  routeDetails: RouteModel[] = [];
  selectedRoute: RouteModel | null = null;

  pagination: PaginationConfig = { pageSize: 10, currentPage: 1, totalItems: 0 };

  // Define columns for the Route Manifest list
  columns: TableColumn[] = [
    { key: 'routeNumber', label: 'Route #', sortable: true },
    { key: 'areaName', label: 'Area/Zone', sortable: true },
    { key: 'driverName', label: 'Assigned Driver', type: 'text' },
    { key: 'vehicleNumber', label: 'Vehicle', type: 'text' },
    { key: 'status', label: 'Status', type: 'badge' },
    { key: 'startDate', label: 'Started At', type: 'date' },
    { key: 'action', label: 'Actions', type: 'action', align: 'right' }
  ];

  routeActions: TableActionConfig[] = [
    {
      key: 'start_trip',
      label: 'Start Trip',
      icon: Play,
      color: 'primary',
      condition: (row: any) => row.status === 'CREATED'
    },
    {
      key: 'complete_trip',
      label: 'Complete Manifest',
      icon: CheckCircle,
      color: 'success',
      condition: (row: any) => row.status === 'IN_TRANSIT'
    }
  ];


  constructor(
    private deliveryService: DeliveryService,
    private drawerService: DrawerService,
    private loader: LoaderService,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
    this.getRoutes();
  }

  getRoutes() {
    this.loader.show();
    const page = this.pagination.currentPage - 1;
    this.deliveryService.getAllRoutes(page, this.pagination.pageSize,
      (res: any) => {
        this.routeDetails = res.data.content;
        this.pagination.totalItems = res.data.totalElements;
        this.loader.hide();
      },
      (err: any) => {
        this.loader.hide();
        this.toast.show('Error loading routes', 'error');
      }
    );
  }

  handleTableAction(event: TableAction) {
    if (event.key === 'start_trip') {
      this.deliveryService.startRoute(event.row.id, () => {
        this.toast.show('Trip started. All items now SHIPPED', 'success');
        this.getRoutes();
      }, () => this.toast.show('Failed to start trip', 'error'));
    }
    else if (event.key === 'complete_trip') {
      this.deliveryService.completeRoute(event.row.id, () => {
        this.toast.show('Route manifest completed', 'success');
        this.getRoutes();
      }, (err: any) => this.toast.show(err.error?.message || 'Check if all items are delivered', 'error'));
    }
    else if (event.type == 'view') {
      this.fetchAndShowDetails(event.row.id);
    }
  }

  fetchAndShowDetails(routeId: string | number) {
    this.loader.show();
    this.deliveryService.getRouteDetails(routeId,
      (response: any) => {
        this.selectedRoute = response.data;
        this.loader.hide();
        this.viewDetails();
      },
      (err: any) => {
        this.loader.hide();
        this.toast.show('Failed to fetch route stops', 'error');
      }
    );
  }

  viewDetails() {
    this.drawerService.openTemplate(
      this.routeDetailTemplate,
      `Manifest: ${this.selectedRoute?.routeNumber}`,
      "md"
    );
  }


  markStopDelivered(stop: DeliveryModel) {
    this.loader.show();
    this.deliveryService.updateDeliveryStatus({
      id: stop.id,
      status: ShipmentStatus.DELIVERED
    },
      (res: any) => {
        this.toast.show(`Order ${stop.deliveryNumber} Delivered`, 'success');
        stop.status = 'DELIVERED'; // Local update for UI
        stop.deliveredDate = new Date();
        this.loader.hide();
      },
      (err: any) => {
        this.loader.hide();
        this.toast.show('Failed to update stop', 'error');
      });
  }

  /**
   * Helper to reuse your existing badge logic from standard table
   */
  getBadgeClass(status: any): string {
    // You can call your StandardTableComponent's getBadgeClass method 
    // or keep a local copy of that switch-case logic here
    return 'bg-blue-50 text-blue-700 border-blue-100';
  }

  checkAndCompleteManifest() {
    if (!this.selectedRoute) return;

    this.deliveryService.completeRoute(this.selectedRoute.id,
      () => {
        this.toast.show('Route Manifest Completed', 'success');
        this.drawerService.close();
        this.getRoutes();
      },
      (err: any) => this.toast.show(err.error?.message || 'Please complete all stops first', 'error')
    );
  }

  onPageChange(page: number) {
    this.pagination.currentPage = page;
    this.getRoutes();
  }
}