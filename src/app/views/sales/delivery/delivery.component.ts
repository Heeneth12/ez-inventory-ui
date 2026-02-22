import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { DeliveryFilterModel, DeliveryModel, RouteCreateRequest, ShipmentStatus } from './delivery.model';
import { HeaderAction, PaginationConfig, TableAction, TableActionConfig, TableColumn } from '../../../layouts/components/standard-table/standard-table.model';
import { Router } from '@angular/router';
import { LoaderService } from '../../../layouts/components/loader/loaderService';
import { ModalService } from '../../../layouts/components/modal/modalService';
import { ToastService } from '../../../layouts/components/toast/toastService';
import { DeliveryService } from './delivery.service';
import { StandardTableComponent } from "../../../layouts/components/standard-table/standard-table.component";
import { CheckCircle, Clock, Truck, TruckElectric, XCircle } from 'lucide-angular';
import { DELIVERY_COLUMNS } from '../../../layouts/config/tableConfig';
import { StatCardData, StatCardComponent } from '../../../layouts/UI/stat-card/stat-card.component';

@Component({
  selector: 'app-delivery',
  standalone: true,
  imports: [CommonModule, StandardTableComponent, StatCardComponent],
  templateUrl: './delivery.component.html',
  styleUrl: './delivery.component.css'
})
export class DeliveryComponent implements OnInit {

  @Input() customerId?: number;
  deliveryDetails: DeliveryModel[] = [];
  deliveryFilter: DeliveryFilterModel = new DeliveryFilterModel();

  pagination: PaginationConfig = { pageSize: 15, currentPage: 1, totalItems: 0 };
  isLoading = false;
  selectedItemIds: (string | number)[] = [];

  stats: StatCardData[] = [];

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

  headerActions: HeaderAction[] = [
    {
      label: 'Create Route Manifest',
      icon: Truck,
      variant: 'primary',
      key: 'create_route',
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
    if(this.customerId){
      //this.salesOrderFilter.customerId = this.customerId;
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
  
  selectedCardId: string | number = '1';
  handleCardSelection(card: StatCardData) {
    this.selectedCardId = card.id;
    // Perform other actions (filter lists, show charts, etc.)
  }

  getSummaryStats() {
    this.deliveryService.getRouteSummary((res: any) => {
      const data = res.data;
      this.stats = [
        {
          id: '1',
          title: 'Active Manifests',
          value: data.totalRoutes.toString(),
          trendText: 'Live trips',
          trendDirection: 'up',
          icon: Truck,
          themeColor: 'blue'
        },
        {
          id: '2',
          title: 'Pending Delivery',
          value: data.pendingDeliveries.toString(),
          trendText: 'Scheduled & Shipped',
          trendDirection: 'up',
          icon: Clock,
          themeColor: 'orange'
        },
        {
          id: '3',
          title: 'Delivered',
          value: data.completedDeliveries.toString(),
          trendText: 'Successfully dropped',
          trendDirection: 'up',
          icon: CheckCircle,
          themeColor: 'emerald'
        },
        {
          id: '4',
          title: 'Cancellations',
          value: data.cancelledDeliveries.toString(),
          trendText: 'Failed/Refused',
          trendDirection: 'down',
          icon: XCircle,
          themeColor: 'emerald'
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
