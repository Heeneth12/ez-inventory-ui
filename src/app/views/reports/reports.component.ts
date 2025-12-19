import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Download, TrendingUp, Package, AlertTriangle, PieChart } from 'lucide-angular';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './reports.component.html',
})
export class ReportsComponent implements AfterViewInit {
  activeReport: string = 'inventory';

  // Icons
  readonly Download = Download;

  ngAfterViewInit() {
    this.initStockChart();
    this.initCategoryChart();
  }

  initStockChart() {
    Highcharts.chart('stockChart', {
      chart: { type: 'areaspline', backgroundColor: 'transparent' },
      title: { text: '' },
      xAxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], lineWidth: 0 },
      yAxis: { title: { text: '' }, gridLineColor: '#f1f5f9' },
      credits: { enabled: false },
      plotOptions: {
        areaspline: { fillOpacity: 0.1 }
      },
      series: [{
        name: 'Inventory Level',
        data: [1200, 1350, 1100, 1500, 1400, 1600],
        color: '#2D4495'
      }, {
        name: 'Sales Demand',
        data: [800, 950, 1200, 1100, 1300, 1500],
        color: '#10b981'
      }]
    } as any);
  }

  initCategoryChart() {
    Highcharts.chart('categoryChart', {
      chart: { type: 'pie', backgroundColor: 'transparent' },
      title: { text: '' },
      credits: { enabled: false },
      plotOptions: {
        pie: { innerSize: '70%', borderPadding: 0, borderWidth: 0 }
      },
      series: [{
        name: 'Value',
        data: [
          { name: 'Finished Goods', y: 50, color: '#2D4495' },
          { name: 'Raw Materials', y: 30, color: '#10b981' },
          { name: 'Packing', y: 20, color: '#fbbf24' }
        ]
      }]
    } as any);
  }
}