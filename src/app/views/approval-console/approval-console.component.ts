import { CommonModule } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ApprovalConsoleService } from './approval-console.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Import FormsModule for the drawer inputs
import { LoaderService } from '../../layouts/components/loader/loaderService';
import { ModalService } from '../../layouts/components/modal/modalService';
import { ToastService } from '../../layouts/components/toast/toastService';
import { StatCardData } from "../../layouts/UI/stat-card/stat-card.component";
import { Settings2Icon, CircleX, CircleCheckBig, Package, AlertCircle, TrendingUp, Zap, List, LucideAngularModule, FileTextIcon, Loader2, Calendar, Percent, CheckCircle2, XCircle, ArrowRight, ClipboardListIcon, Clock, FileText } from 'lucide-angular';
import { StandardTableComponent } from "../../layouts/components/standard-table/standard-table.component";
import { HeaderAction, PaginationConfig, TableAction, TableActionConfig, TableColumn } from '../../layouts/components/standard-table/standard-table.model';
import { DrawerService } from '../../layouts/components/drawer/drawerService';
import { ApprovalConfigModel, ApprovalFilterModel, ApprovalRequestModel, ApprovalStatsModel, ApprovalType } from './approval-console.model';
import { APPROVAL_COLUMN } from '../../layouts/config/tableConfig';
import { SalesOrderModal } from '../sales/sales-order/sales-order.modal';
import { SalesOrderService } from '../sales/sales-order/sales-order.service';
import { StockAdjustmentDetailModel } from '../stock/models/stock-adjustment.model';
import { StockService } from '../stock/stock.service';
import { DatePickerConfig, DateRangeEmit } from '../../layouts/UI/date-picker/date-picker.component';
import { StatCardConfig, StatGroupComponent } from '../../layouts/UI/stat-group/stat-group.component';
import { FilterOption } from '../../layouts/UI/filter-dropdown/filter-dropdown.component';
import { ConfirmationModalService } from '../../layouts/UI/confirmation-modal/confirmation-modal.service';

@Component({
  selector: 'app-approval-console',
  standalone: true,
  imports: [CommonModule, StandardTableComponent, FormsModule, LucideAngularModule, StatGroupComponent],
  templateUrl: './approval-console.component.html',
  styleUrl: './approval-console.component.css'
})
export class ApprovalConsoleComponent implements OnInit {

  @ViewChild('configDrawer') configDrawer!: TemplateRef<any>;

  //sales order discount template
  @ViewChild('salesOrderDiscount') salesOrderDiscount!: TemplateRef<any>;
  salesOrderDetails: SalesOrderModal | null = null;


  @ViewChild('stockAdjustment') stockAdjustment!: TemplateRef<any>;
  stockAdjustmentDetails: StockAdjustmentDetailModel | null = null;

  approvals: ApprovalRequestModel[] = [];
  configs: ApprovalConfigModel[] = [];
  approvalFilter: ApprovalFilterModel = new ApprovalFilterModel();
  approvalStats: ApprovalStatsModel = new ApprovalStatsModel();

  approvalDashboardStats: StatCardConfig[] = [
    {
      key: 'pending_requests',
      label: 'Pending Approvals',
      value: '0 Items',
      icon: Clock,
      color: 'orange',
    },
    {
      key: 'approved_requests',
      label: 'Approved',
      value: '0 Items',
      icon: CheckCircle2,
      color: 'emerald',
    },
    {
      key: 'rejected_requests',
      label: 'Rejected',
      value: '0 Items',
      icon: XCircle,
      color: 'rose',
    },
    {
      key: 'total_requests',
      label: 'Total Requests',
      value: '0 Items',
      icon: FileText,
      color: 'blue',
    }
  ];


  isCreatingNew = false;
  newConfig: ApprovalConfigModel = this.getEmptyConfig();
  approvalTypeOptions = Object.values(ApprovalType);

  pagination: PaginationConfig = { pageSize: 15, currentPage: 1, totalItems: 0 };
  isLoading = false;

  approvalNote: string = '';
  currentReferenceId: string | number | null = null;
  currentRequestId: string | number | null = null;

  //icon 
  readonly CircleCheckBigIcon = CircleCheckBig;
  readonly CircleXIcon = CircleX;
  readonly PackageIcon = Package;
  readonly AlertCircleIcon = AlertCircle;
  readonly TrendingUpIcon = TrendingUp;
  readonly ZapIcon = Zap;
  readonly FileTextIcon = FileTextIcon;
  readonly LoaderIcon = Loader2;
  readonly CalendarIcon = Calendar;
  readonly PercentIcon = Percent;
  readonly CheckCircle2Icon = CheckCircle2;
  readonly XCircleIcon = XCircle;
  readonly ArrowRightIcon = ArrowRight;
  readonly ClipboardListIcon = ClipboardListIcon;

  //table config
  columns: TableColumn[] = APPROVAL_COLUMN;

  myHeaderActions: HeaderAction[] = [
    {
      label: 'Config',
      icon: Settings2Icon,
      variant: 'primary',
      action: () => this.openApprovalConfig()
    },
  ];

  approvalActions: TableActionConfig[] = [
    {
      key: 'approve',
      label: 'Approve',
      icon: CircleCheckBig,
      color: 'success',
      condition: (row) => row['status'] === 'PENDING'
    },
    {
      key: 'reject',
      label: 'Reject',
      icon: CircleX,
      color: 'danger',
      condition: (row) => row['status'] === 'PENDING'
    },
    {
      key: 'view',
      label: 'View',
      icon: List,
      color: 'primary',
      condition: (row) => true
    }
  ];

  filterConfig: FilterOption[] = [
    {
      id: 'status',
      label: 'Status',
      type: 'checkbox',
      searchable: true,
      options: [
        { label: 'PENDING', value: 'PENDING' },
        { label: 'APPROVED', value: 'APPROVED' },
        { label: 'REJECTED', value: 'REJECTED' }
      ]
    },
    {
      id: 'approval_type',
      label: 'Approval Type',
      type: 'checkbox',
      searchable: true,
      options: [
        { label: 'Stock Adjustment', value: 'STOCK_ADJUSTMENT' },
        { label: 'Sales Order Discount', value: 'SALES_ORDER_DISCOUNT' },
      ]
    }
  ];


  dateConfig: DatePickerConfig = {
    type: 'both',
    placeholder: 'Start - End'
  };


  constructor(
    private approvalConsoleService: ApprovalConsoleService,
    private salesOrderService: SalesOrderService,
    private stockService: StockService,
    private router: Router,
    private toastService: ToastService,
    private loaderSvc: LoaderService,
    private drawerService: DrawerService,
    private modalService: ModalService,
    private confirmationModalSvc: ConfirmationModalService
  ) { }

  ngOnInit(): void {
    this.getAllApprovals();
    this.getApprovalStats();
  }

  getAllApprovals() {
    this.loaderSvc.show();
    const apiPage = this.pagination.currentPage > 0 ? this.pagination.currentPage - 1 : 0;

    this.approvalConsoleService.getAllApprovals(
      apiPage,
      this.pagination.pageSize,
      this.approvalFilter,
      (response: any) => {
        this.approvals = response.data.content;
        this.pagination = {
          ...this.pagination,
          totalItems: response.data.totalElements,
          pageSize: response.data.size
        };
        this.loaderSvc.hide();
      },
      (error: any) => {
        this.loaderSvc.hide();
        this.toastService.show('Failed to load approvals', 'error');
      }
    );
  }

  openApprovalConfig() {
    this.loaderSvc.show();
    // 1. Fetch current configs to populate the drawer
    this.approvalConsoleService.getAllConfigs(
      1, 100,
      {},
      (response: any) => {
        this.configs = response.data.content || [];
        this.loaderSvc.hide();
        this.drawerService.openTemplate(this.configDrawer, 'Approval Rules Configuration', 'md');
      },
      (error: any) => {
        this.loaderSvc.hide();
        this.toastService.show('Failed to load configurations', 'error');
      }
    );
  }


  getApprovalStats() {
    this.approvalConsoleService.getApprovalStats(
      (response: any) => {
        // Map response to stats config
        this.approvalStats = response.data;
        this.approvalDashboardStats.map(card => {
          switch (card.key) {
            case 'pending_requests':
              card.value = `${this.approvalStats.pendingCount} Items`;
              break;
            case 'approved_requests':
              card.value = `${this.approvalStats.approvedCount} Items`;
              break;
            case 'rejected_requests':
              card.value = `${this.approvalStats.rejectedCount} Items`;
              break;
            case 'total_requests':
              card.value = `${this.approvalStats.totalCount} Items`;
              break;
          }
        });
      },
      (error: any) => {
        this.toastService.show('Failed to load statistics', 'error');
      }
    );
  }

  processApproval(requestId: number | string, approvalStatus: 'APPROVED' | 'REJECTED') {
    this.approvalConsoleService.approvalProcess(
      {
        requestId: requestId,
        status: approvalStatus,
        remarks: 'test'
      },
      (response: any) => {
        this.toastService.show('Approval processed successfully', 'success');
      },
      (error: any) => {
        this.toastService.show('Failed to process approval', 'error');
      }
    );
  }

  processDrawerAction(status: 'APPROVED' | 'REJECTED') {
    if (!this.currentRequestId) return;

    if (status === 'REJECTED' && !this.approvalNote) {
      this.toastService.show('Please provide a reason for rejection.', 'warning');
      return;
    }

    this.loaderSvc.show();
    this.approvalConsoleService.approvalProcess(
      {
        requestId: this.currentRequestId,
        status: status,
        remarks: this.approvalNote
      },
      (response: any) => {
        this.toastService.show(`Request ${status === 'APPROVED' ? 'Approved' : 'Rejected'}`, 'success');
        this.drawerService.close();
        this.loaderSvc.hide();
        this.getAllApprovals();
      },
      (error: any) => {
        this.loaderSvc.hide();
        this.toastService.show('Failed to process approval', 'error');
      }
    );
  }

  toggleCreateNew() {
    this.isCreatingNew = !this.isCreatingNew;
    this.newConfig = this.getEmptyConfig(); // Reset form
  }

  onFilterUpdate($event: Record<string, any>) {
    console.log("Received filter update:", $event);
    this.approvalFilter.approvalStatuses = $event['status'] || null;
    this.approvalFilter.approvalTypes = $event['approval_type'] || null;
    this.getAllApprovals();
  }

  // Save (Works for both Create New and Edit Existing)
  saveConfig(config: ApprovalConfigModel) {
    if (!config.approvalType) {
      this.toastService.show('Please select an Approval Type', 'error');
      return;
    }

    this.loaderSvc.show();
    this.approvalConsoleService.saveApprovalConfig(
      config,
      (response: any) => {
        this.loaderSvc.hide();
        this.toastService.show('Configuration saved successfully', 'success');

        // If we just created a new one, refresh the list and close the create form
        if (this.isCreatingNew) {
          this.isCreatingNew = false;
          this.openApprovalConfig(); // Refresh list
        }
      },
      (error: any) => {
        this.loaderSvc.hide();
        this.toastService.show('Failed to save configuration', 'error');
      }
    );
  }

  // view approval details
  viewApprovalDetails(approvaltype: string, referanceCode: string, requestId: string | number) {
    this.currentReferenceId = referanceCode;
    this.currentRequestId = requestId;
    this.approvalNote = ''; // Reset note
    switch (approvaltype) {
      case ApprovalType.SALES_ORDER_DISCOUNT:
        this.getSalesOrderById(referanceCode);
        this.drawerService.openTemplate(this.salesOrderDiscount, 'Sales Order Discount Details', 'lg');
        break;
      case ApprovalType.STOCK_ADJUSTMENT:
        this.getStockAdjustmentDetails(referanceCode);
        this.drawerService.openTemplate(this.stockAdjustment, 'Stock Adjustment Details', 'lg');
        break;

      default:
        this.toastService.show('Approval type not supported for detail view', 'info');
        break;
    }
  }

  // get approval details
  getSalesOrderById(id: number | string) {
    this.salesOrderService.getSalesOrderById(
      Number(id),
      (response: any) => {
        this.salesOrderDetails = response.data;
        console.log('Sales Order Details:', response.data);
      },
      (error: any) => {
        this.toastService.show('Failed to load Sales Order details', 'error');
        console.error('Error fetching Sales Order details:', error);
      }
    );
  }

  getStockAdjustmentDetails(id: number | string) {
    this.loaderSvc.show();
    this.stockService.getStockAdjustmentById(
      id,
      (response: any) => {
        this.stockAdjustmentDetails = response.data;
        this.loaderSvc.hide();
      },
      (error: any) => {
        this.loaderSvc.hide();
        this.toastService.show("Failed to load details", "error");
      }
    );
  }

  // Helper to calculate percentage
  // Helper to calculate percentage based on the new itemGrossTotal
  get discountPercentage(): number {
    if (!this.salesOrderDetails || !this.salesOrderDetails.itemGrossTotal || this.salesOrderDetails.itemGrossTotal === 0) {
      return 0;
    }
    // Calculates total combined discount against the absolute gross value
    return (this.salesOrderDetails.totalDiscount / this.salesOrderDetails.itemGrossTotal) * 100;
  }

  // Helper to calculate Total Adjustment Value dynamically
  get stockAdjustmentTotalValue(): number {
    if (!this.stockAdjustmentDetails || !this.stockAdjustmentDetails.items) return 0;
    return this.stockAdjustmentDetails.items.reduce((acc: number, item: any) => {
      // Assuming item has differenceQty and unitPrice/costPrice
      const qty = Math.abs(item.differenceQty || 0);
      const price = item.unitPrice || item.costPrice || 0;
      return acc + (qty * price);
    }, 0);
  }

  // Helper to get a blank object
  getEmptyConfig(): ApprovalConfigModel {
    return {
      approvalType: null as any, // User must select this
      isEnabled: true,
      thresholdAmount: undefined,
      thresholdPercentage: undefined,
      approverRole: 'MANAGER'
    };
  }

  approvalConformation(status: 'APPROVED' | 'REJECTED', approvalId: number | string) {
    const action = status === 'APPROVED' ? 'Approve' : 'Reject';
    this.confirmationModalSvc.open({
      title: `${action} Approval`,
      message: `Are you sure you want to ${action.toLowerCase()} this approval request?`,
      intent: status === 'APPROVED' ? 'success' : 'danger',
      confirmLabel: 'Yes, Confirm',
      cancelLabel: 'No, Cancel'
    }).then(confirmed => {
      if (confirmed) {
        this.processApproval(approvalId, status);
      }
    });
  }

  handleTableAction(event: TableAction) {
    if (event.type === 'custom' && event.key === 'approve') {
      this.approvalConformation('APPROVED', event.row.id);
      this.getAllApprovals();

    }
    if (event.type === 'custom' && event.key === 'reject') {
      this.approvalConformation('REJECTED', event.row.id);
      this.getAllApprovals();
    }
    if (event.type === 'custom' && event.key === 'view') {
      this.viewApprovalDetails(event.row['approvalType'], event.row['referenceId'], event.row['id']);
    }
    if (event.type === 'edit') {
      // Standard edit logic
    }
  }

  onTableAction(event: TableAction) {
    const { type, row } = event;
    if (type === 'view') {
      console.log('View Request:', row.id);
      // Navigate to details page if needed
    }
  }

  onPageChange(newPage: number) {
    this.pagination.currentPage = newPage;
    this.getAllApprovals();
  }

  handleCardAction(card: StatCardData) {
    console.log('Card Clicked:', card.title);
  }

  onLoadMore() {

  }


  selectedCardId: string | number = '1';
  handleCardSelection(card: StatCardData) {
    this.selectedCardId = card.id;
    // Perform other actions (filter lists, show charts, etc.)
  }

  onFilterDate(range: DateRangeEmit) {
    console.log('Filter table by:', range.from, range.to);
    this.approvalFilter.fromDate = range.from
      ? this.formatDate(range.from)
      : null;

    this.approvalFilter.toDate = range.to
      ? this.formatDate(range.to)
      : null;
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}   