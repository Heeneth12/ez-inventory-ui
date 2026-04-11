import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../layouts/guards/auth.service';
import { UserInitResponse } from '../../layouts/models/Init-response.model';
import { ToastService } from '../../layouts/components/toast/toastService';
import { ConfirmationModalService } from '../../layouts/UI/confirmation-modal/confirmation-modal.service';
import {
  LucideAngularModule,
  Eye, Users, MousePointerClick, ShoppingCart, TrendingUp,
  TrendingDown, MoreVertical, Download, Plus, ChevronDown,
  Star, Send, Calendar,
  Bell,
  PackageCheck,
  ShoppingBag,
  Coins,
  Notebook,
  FileText,
  ArrowRight,
  Check,
  X,
  List
} from 'lucide-angular';
import { Chart, registerables } from 'chart.js';
import { ApprovalConsoleService } from '../approval-console/approval-console.service';
import { ApprovalRequestModel } from '../approval-console/approval-console.model';
import { Router } from '@angular/router';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, AfterViewInit {

  @ViewChild('profitChart') profitChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('activityChart') activityChartRef!: ElementRef<HTMLCanvasElement>;

  private profitChart: Chart | null = null;
  private activityChart: Chart | null = null;
  activeReport: string = 'inventory';
  userData$: Observable<UserInitResponse | null>;
  pendingApprovals: ApprovalRequestModel[] = [];
  pendingApprovalsCount: number = 0;

  readonly icons = {
    eye: Eye,
    users: Users,
    click: MousePointerClick,
    cart: ShoppingCart,
    trendingUp: TrendingUp,
    trendingDown: TrendingDown,
    more: MoreVertical,
    download: Download,
    plus: Plus,
    chevronDown: ChevronDown,
    star: Star,
    send: Send,
    calendar: Calendar,
    bell: Bell,
    packageCheck: PackageCheck,
    purchaseQueue: Send,
    shoppingCart: ShoppingBag,
    salesData: ShoppingCart,
    coins: Coins,
    notes: Notebook,
    fileText: FileText,
    arrowRight: ArrowRight,
    check: Check,
    x: X,
    list: List
  };

  hoveredDayIndex: number | null = null;
  today = new Date();

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  navigateToCreateOrder() { this.router.navigate(['/sales/order']); }
  navigateToCreateInvoice() { this.router.navigate(['/sales/invoice']); }
  navigateToItems() { this.router.navigate(['/items']); }

  // Top Metrics
  metrics = [
    {
      label: 'Page Views',
      value: '16,431',
      change: '+15.3%',
      isPositive: true,
      icon: Eye,
      comparison: 'vs 14,215 last period'
    },
    {
      label: 'Visitors',
      value: '6,225',
      change: '+8.6%',
      isPositive: true,
      icon: Users,
      comparison: 'vs 5,734 last period'
    },
    {
      label: 'Click',
      value: '2,832',
      change: '-10.5%',
      isPositive: false,
      icon: MousePointerClick,
      comparison: 'vs 3,167 last period'
    },
    {
      label: 'Orders',
      value: '1,224',
      change: '+4.4%',
      isPositive: true,
      icon: ShoppingCart,
      comparison: 'vs 1,172 last period'
    }
  ];

  // Customer Stats
  customerStats = [
    { label: 'New Users', value: '2,884', color: 'bg-blue-500', barColor: 'bg-blue-500', percentage: 65 },
    { label: 'Existing Users', value: '1,432', color: 'bg-emerald-500', barColor: 'bg-emerald-500', percentage: 40 },
    { label: 'Unsubscribed', value: '562', color: 'bg-orange-500', barColor: 'bg-orange-500', percentage: 15 }
  ];



  // Daily Activity Data with actual values
  dailyActivity = [
    { day: 'Sun', value: 3842, fullDay: 'Sunday', date: 'Jan 12' },
    { day: 'Mon', value: 8162, isHighest: true, fullDay: 'Monday', date: 'Jan 13' },
    { day: 'Tue', value: 6234, fullDay: 'Tuesday', date: 'Jan 14' },
    { day: 'Wed', value: 4521, fullDay: 'Wednesday', date: 'Jan 15' },
    { day: 'Thu', value: 5834, fullDay: 'Thursday', date: 'Jan 16' },
    { day: 'Fri', value: 4187, fullDay: 'Friday', date: 'Jan 17' },
    { day: 'Sat', value: 3256, fullDay: 'Saturday', date: 'Jan 18' }
  ];

  maxActivity = Math.max(...this.dailyActivity.map(d => d.value));



  // Data for the Cash Denominations section
  notes = [
    { label: 'Hundreds', value: 100, qty: 0 },
    { label: 'Fifties', value: 50, qty: 0 },
    { label: 'Twenties', value: 20, qty: 0 },
    { label: 'Tens', value: 10, qty: 0 },
    { label: 'Fives', value: 5, qty: 0 },
    { label: 'Ones', value: 1, qty: 0 }
  ];

  // Sales Data Dummy
  salesData = [
    { invoice: 'INV-8821', method: 'Cash', amount: 120.00 },
    { invoice: 'INV-8822', method: 'UPI/Card', amount: 450.50 },
    { invoice: 'INV-8823', method: 'Cash', amount: 35.00 }
  ];

  constructor(
    private authSvs: AuthService,
    private approvalConsoleService: ApprovalConsoleService,
    private router: Router,
    private toastService: ToastService,
    private confirmationModalSvc: ConfirmationModalService
  ) {
    this.userData$ = this.authSvs.currentUser$;
  }

  ngOnInit() {
    this.fetchPendingApprovals();
  }

  fetchPendingApprovals() {
    this.approvalConsoleService.getAllApprovals(
      0,
      4,
      { approvalStatuses: ['PENDING'] },
      (response: any) => {
        this.pendingApprovals = response.data.content;
        this.pendingApprovalsCount = response.data.totalElements;
      },
      (error: any) => {
        console.error('Failed to fetch pending approvals', error);
      }
    );
  }

  navigateToApprovals() {
    this.router.navigate(['/approval']);
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

  processApproval(requestId: number | string, approvalStatus: 'APPROVED' | 'REJECTED') {
    this.approvalConsoleService.approvalProcess(
      {
        requestId: requestId,
        status: approvalStatus,
        remarks: 'Actioned from dashboard'
      },
      (response: any) => {
        this.toastService.show('Approval processed successfully', 'success');
        this.fetchPendingApprovals(); // Refresh list after action
      },
      (error: any) => {
        this.toastService.show('Failed to process approval', 'error');
      }
    );
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  ngAfterViewInit() {
    // Wait for DOM to be fully ready
    setTimeout(() => {
      this.initActivityChart();
    }, 300);
  }

  private initActivityChart() {
    if (!this.activityChartRef?.nativeElement) {
      console.error('Activity chart canvas not found');
      return;
    }

    const ctx = this.activityChartRef.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('Could not get 2D context for activity chart');
      return;
    }

    // Destroy existing chart if it exists
    if (this.activityChart) {
      this.activityChart.destroy();
    }

    // Dummy data for activity chart
    const activityData = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      values: [4200, 5800, 4500, 6200, 7800, 5100, 3900]
    };

    // Create gradient for bars
    const gradient = ctx.createLinearGradient(0, 0, 0, 250);
    gradient.addColorStop(0, '#3b82f6');
    gradient.addColorStop(1, '#60a5fa');

    this.activityChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: activityData.labels,
        datasets: [{
          label: 'Activity',
          data: activityData.values,
          backgroundColor: gradient,
          borderRadius: 4,
          borderSkipped: false,
          hoverBackgroundColor: '#2563eb',
          barThickness: 32
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            titleColor: '#fff',
            bodyColor: '#cbd5e1',
            borderColor: '#334155',
            borderWidth: 1,
            padding: 16,
            displayColors: false,
            cornerRadius: 8,
            titleFont: {
              size: 13,
              weight: 'bold'
            },
            bodyFont: {
              size: 15,
              weight: 'bold'
            },
            callbacks: {
              title: (items) => items[0].label,
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: '#94a3b8',
              font: {
                size: 12,
              },
              padding: 8
            }
          },
          y: {
            display: false,
            grid: { display: false }
          }
        }
      }
    });
  }

  getActivityHeight(value: number): number {
    return (value / this.maxActivity) * 100;
  }

  setHoveredDay(index: number | null) {
    this.hoveredDayIndex = index;
  }

  ngOnDestroy() {
    // Clean up charts on component destroy
    if (this.profitChart) {
      this.profitChart.destroy();
    }
    if (this.activityChart) {
      this.activityChart.destroy();
    }
  }
}