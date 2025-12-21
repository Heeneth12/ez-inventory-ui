import { CommonModule } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ApprovalConsoleService } from './approval-console.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Import FormsModule for the drawer inputs
import { LoaderService } from '../../layouts/components/loader/loaderService';
import { ModalService } from '../../layouts/components/modal/modalService';
import { ToastService } from '../../layouts/components/toast/toastService';
import { StatCardData, StatCardComponent } from "../../layouts/UI/stat-card/stat-card.component";
import { Settings2Icon, CircleX, CircleCheckBig, Package, AlertCircle, TrendingUp, Zap } from 'lucide-angular';
import { StandardTableComponent } from "../../layouts/components/standard-table/standard-table.component";
import { HeaderAction, PaginationConfig, TableAction, TableActionConfig, TableColumn } from '../../layouts/components/standard-table/standard-table.model';
import { DrawerService } from '../../layouts/components/drawer/drawerService';
import { ApprovalConfigModel, ApprovalRequestModel, ApprovalType } from './approval-console.model';
import { APPROVAL_COLUMN } from '../../layouts/config/tableConfig';

@Component({
  selector: 'app-approval-console',
  standalone: true,
  imports: [CommonModule, StandardTableComponent, FormsModule, StatCardComponent],
  templateUrl: './approval-console.component.html',
  styleUrl: './approval-console.component.css'
})
export class ApprovalConsoleComponent implements OnInit {

  @ViewChild('configDrawer') configDrawer!: TemplateRef<any>;

  approvals: ApprovalRequestModel[] = [];
  configs: ApprovalConfigModel[] = []; // List to store configs for the drawer

  isCreatingNew = false;
  newConfig: ApprovalConfigModel = this.getEmptyConfig();
  approvalTypeOptions = Object.values(ApprovalType);

  pagination: PaginationConfig = { pageSize: 15, currentPage: 1, totalItems: 0 };
  isLoading = false;

  //table config
  columns: TableColumn[] = APPROVAL_COLUMN;

  myHeaderActions: HeaderAction[] = [
    {
      label: 'Config',
      icon: Settings2Icon,
      variant: 'primary',
      action: () => this.openApprovalConfig() // Calls the function properly
    },
  ];

  approvalActions: TableActionConfig[] = [
    {
      key: 'approve',
      label: 'Approve',
      icon: CircleCheckBig,
      color: 'success',
      // Only show if status is PENDING
      condition: (row) => row['status'] === 'PENDING'
    },
    {
      key: 'reject',
      label: 'Reject',
      icon: CircleX,
      color: 'danger',
      // Only show if status is PENDING
      condition: (row) => row['status'] === 'PENDING'
    }
  ];

  constructor(
    private approvalConsoleService: ApprovalConsoleService,
    private router: Router,
    private toastService: ToastService,
    private loaderSvc: LoaderService,
    private drawerService: DrawerService,
    private modalService: ModalService
  ) { }

  ngOnInit(): void {
    this.getAllApprovals();
  }

  getAllApprovals() {
    this.loaderSvc.show();
    const apiPage = this.pagination.currentPage > 0 ? this.pagination.currentPage - 1 : 0;

    this.approvalConsoleService.getAllApprovals(
      apiPage,
      this.pagination.pageSize,
      {},
      (response: any) => {
        this.approvals = response.data.content; // Fixed: assign data to approvals
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

  toggleCreateNew() {
    this.isCreatingNew = !this.isCreatingNew;
    this.newConfig = this.getEmptyConfig(); // Reset form
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


  handleTableAction(event: TableAction) {
    if (event.type === 'custom' && event.key === 'approve') {
      this.processApproval(event.row.id, 'APPROVED');
      this.getAllApprovals();

    }
    if (event.type === 'custom' && event.key === 'reject') {
      this.processApproval(event.row.id, 'REJECTED');
      this.getAllApprovals();
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

  onLoadMore() { }


  selectedCardId: string | number = '1';
  handleCardSelection(card: StatCardData) {
    this.selectedCardId = card.id;
    // Perform other actions (filter lists, show charts, etc.)
  }

  stats: StatCardData[] = [
    {
      id: '1',
      title: 'Total Approve',
      value: '₹12,48,750',
      trendText: '6% vs last month',
      trendDirection: 'up',
      icon: Package,
      themeColor: 'blue'
    },
    
    {
      id: '2',
      title: 'Net Stock Movement',
      value: '+320 Units',
      trendText: 'Increased this month',
      trendDirection: 'up',
      icon: TrendingUp,
      themeColor: 'emerald'
    },

    {
      id: '3',
      title: 'Out of Stock Items',
      value: '14 Items',
      trendText: '3 items added this week',
      trendDirection: 'down',
      icon: AlertCircle,
      themeColor: 'purple'
    },

    {
      id: '4',
      title: 'Fast-Moving Items',
      value: '9 Products',
      trendText: 'Top sellers this month',
      trendDirection: 'up',
      icon: Zap,
      themeColor: 'purple'
    }
  ];

} 