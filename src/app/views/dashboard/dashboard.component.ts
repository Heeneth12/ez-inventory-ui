import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import {
  LucideAngularModule,
  Eye, Users, MousePointerClick, ShoppingCart, TrendingUp,
  TrendingDown, MoreVertical, Download, Plus, ChevronDown,
  Star, Send, Calendar,
  Bell
} from 'lucide-angular';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, AfterViewInit {

  currentTab: 'dashboard' | 'tasks' | 'calender' = 'dashboard';
  allTabs = ['dashboard', 'tasks', 'calender'] as const;
  @ViewChild('profitChart') profitChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('activityChart') activityChartRef!: ElementRef<HTMLCanvasElement>;

  private profitChart: Chart | null = null;
  private activityChart: Chart | null = null;

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
    bell: Bell
  };

  hoveredDayIndex: number | null = null;

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

  ngOnInit() { }

  ngAfterViewInit() {
    // Wait for DOM to be fully ready
    setTimeout(() => {
      this.initProfitChart();
      this.initActivityChart();
    }, 300);
  }

  private initProfitChart() {
    if (!this.profitChartRef?.nativeElement) {
      console.error('Profit chart canvas not found');
      return;
    }

    const ctx = this.profitChartRef.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('Could not get 2D context for profit chart');
      return;
    }

    // Destroy existing chart if it exists
    if (this.profitChart) {
      this.profitChart.destroy();
    }

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 250);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.01)');

    // Dummy data for profit chart
    const profitData = {
      labels: ['Jan 1', 'Jan 5', 'Jan 10', 'Jan 15', 'Jan 20', 'Jan 25', 'Jan 30'],
      values: [5200, 6800, 5500, 8200, 7100, 9500, 11200]
    };

    this.profitChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: profitData.labels,
        datasets: [{
          label: 'Profit',
          data: profitData.values,
          borderColor: '#3b82f6',
          backgroundColor: gradient,
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: '#3b82f6',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            mode: 'index',
            intersect: false,
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
              label: ({ parsed }) => parsed?.y != null ? `$${parsed.y.toLocaleString()}` : ''
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
            border: { display: false },
            grid: {
              color: '#f1f5f9',
              drawTicks: false,
            },
            ticks: {
              color: '#94a3b8',
              font: {
                size: 12,
              },
              callback: (value) => `$${Number(value) / 1000}k`,
              padding: 12
            }
          }
        },
        interaction: {
          mode: 'index',
          intersect: false
        }
      }
    });
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

  handleTabChange(tab: 'dashboard' | 'tasks' | 'calender') {
    this.currentTab = tab;
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