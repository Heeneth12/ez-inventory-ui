import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Download, TrendingUp, Package, AlertTriangle, PieChart, ShoppingCart, ShoppingBag, Users, UserPlus, FileText, Activity, CreditCard, Box, Filter, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-angular';
import * as Highcharts from 'highcharts';
import { StatCardConfig, StatGroupComponent } from "../../layouts/UI/stat-group/stat-group.component";
import { SalesOrderService } from '../sales/sales-order/sales-order.service';
import { ToastService } from '../../layouts/components/toast/toastService';
import { RouterModule } from '@angular/router';

interface Tab {
  label: string;
  icon: any;
  value: string;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, StatGroupComponent, RouterModule],
  templateUrl: './reports.component.html',
})
export class ReportsComponent implements AfterViewInit {

  // Icons
  icons = {
    Download, TrendingUp, Package, AlertTriangle, PieChart, ShoppingCart, ShoppingBag,
    Users, UserPlus, FileText, Activity, CreditCard, Box, Filter, ArrowUpRight, ArrowDownRight, Clock
  };

  tabs: Tab[] = [
    { label: 'Sales', icon: TrendingUp, value: 'sales' },
    { label: 'Purchase', icon: ShoppingBag, value: 'purchase' },
    { label: 'Stock', icon: Package, value: 'stock' },
    { label: 'Users', icon: Users, value: 'user' },
  ];
  activeMainTab: string = 'sales';
  activeUserSubTab: string = 'employees';
  isLoading: boolean = false;
  salesOrderConversionData: any[] = [];


  constructor(
    private salesOrderService: SalesOrderService,
    private toastService: ToastService
  ) {
    this.getSalesOrderConversionReport();
  }

  getSalesOrderConversionReport() {
    this.isLoading = true;
    this.salesOrderService.getSalesOrderConversionReport({}, (res: any) => {
      console.log(res);
      if (res && res.data) {
        this.salesOrderConversionData = res.data;
        if (this.activeMainTab === 'sales') {
          setTimeout(() => this.initSalesCharts(), 50);
        }
      }
      this.isLoading = false;
    }, (err: any) => {
      console.log(err);
      this.isLoading = false;
    });
  }

  salesReportStats: StatCardConfig[] = [
    { key: 'total_revenue', label: 'Total Revenue', value: '₹84.2L', icon: TrendingUp, trend: { isUp: true, value: '+12.5%' }, color: 'indigo' },
    { key: 'total_orders', label: 'Total Orders', value: '1,245', icon: ShoppingCart, trend: { isUp: true, value: '+8.2%' }, color: 'emerald' },
    { key: 'avg_order_value', label: 'Avg. Order Value', value: '₹6,750', icon: CreditCard, trend: { isUp: true, value: '+2.1%' }, color: 'blue' },
    { key: 'pending_orders', label: 'Pending Orders', value: '42', icon: AlertTriangle, trend: { isUp: false, value: 'Attention' }, color: 'rose' }
  ];

  purchaseReportStats: StatCardConfig[] = [
    { key: 'total_purchase', label: 'Total Purchase', value: '₹45.8L', icon: TrendingUp, trend: { isUp: true, value: '+5.4%' }, color: 'emerald' },
    { key: 'pos_issued', label: 'POs Issued', value: '324', icon: FileText, trend: { isUp: true, value: '+5 this mo' }, color: 'slate' },
    { key: 'pending_delivery', label: 'Pending Delivery', value: '18', icon: Package, trend: { isUp: false, value: '3 delayed' }, color: 'amber' },
    { key: 'top_vendor', label: 'Top Vendor', value: 'Electro Comp.', icon: Users, trend: { isUp: true, value: '+5 this mo' }, color: 'slate' }
  ];

  stockReportStats: StatCardConfig[] = [
    { key: 'total_stock', label: 'Total Stock Value', value: '₹84.2L', icon: Box, trend: { isUp: true, value: '+4.2%' }, color: 'slate' },
    { key: 'low_stock', label: 'Low Stock Items', value: '12', icon: AlertTriangle, trend: { isUp: false, value: 'Reorder soon' }, color: 'rose' },
    { key: 'turnover_rate', label: 'Turnover Rate', value: '4.2x', icon: Activity, trend: { isUp: true, value: '+5 this mo' }, color: 'slate' },
    { key: 'inventory_accuracy', label: 'Inventory Accuracy', value: '99.4%', icon: PieChart, trend: { isUp: true, value: '+5 this mo' }, color: 'indigo' }
  ];

  employeeReportStats: StatCardConfig[] = [
    { key: 'total_emp', label: 'Total Employees', value: '142', icon: Users, trend: { isUp: true, value: '+5 this mo' }, color: 'indigo' },
    { key: 'active_staff', label: 'Active Staff', value: '135', icon: UserPlus, trend: { isUp: true, value: '+5 this mo' }, color: 'emerald' },
    { key: 'on_leave', label: 'On Leave', value: '7', icon: Clock, trend: { isUp: false, value: '3 delayed' }, color: 'amber' },
    { key: 'open_positions', label: 'Open Positions', value: '12', icon: FileText, trend: { isUp: false, value: '3 delayed' }, color: 'slate' }
  ];

  customerReportStats: StatCardConfig[] = [
    { key: 'total_customers', label: 'Total Customers', value: '458', icon: Users, trend: { isUp: true, value: '+12%' }, color: 'indigo' },
    { key: 'active_accounts', label: 'Active Accounts', value: '392', icon: Activity, trend: { isUp: true, value: '+12%' }, color: 'slate' },
    { key: 'customer_lifetime', label: 'Customer Lifetime', value: '3.2 Yrs', icon: Clock, trend: { isUp: true, value: '+12%' }, color: 'slate' },
    { key: 'churn_risk', label: 'Churn Risk', value: '5%', icon: AlertTriangle, trend: { isUp: false, value: 'Below avg' }, color: 'rose' }
  ];

  ngAfterViewInit() {
    this.renderCurrentCharts();
  }

  setMainTab(tab: string) {
    this.activeMainTab = tab;
    if (tab !== 'user') {
      setTimeout(() => this.renderCurrentCharts(), 50);
    }
  }

  setUserSubTab(tab: string) {
    this.activeUserSubTab = tab;
  }

  renderCurrentCharts() {
    if (this.activeMainTab === 'sales') {
      this.initSalesCharts();
    } else if (this.activeMainTab === 'purchase') {
      this.initPurchaseCharts();
    } else if (this.activeMainTab === 'stock') {
      this.initStockCharts();
    }
  }

  // here i sales chate show tow codanets data wise number of sales order converted to invoce conversion here 
  initSalesCharts() {
    if (document.getElementById('salesRevenueChart')) {
      const categories = this.salesOrderConversionData.map(d => d.reportDate);
      const totalOrders = this.salesOrderConversionData.map(d => d.totalSalesOrders);
      const convertedToInvoice = this.salesOrderConversionData.map(d => d.convertedToInvoice);

      Highcharts.chart('salesRevenueChart', {
        chart: { type: 'areaspline', backgroundColor: 'transparent', style: { fontFamily: 'inherit' } },
        title: { text: '' },
        xAxis: { categories: categories.length ? categories : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'], lineWidth: 0, tickWidth: 0 },
        yAxis: { title: { text: '' }, gridLineColor: '#f1f5f9' },
        credits: { enabled: false },
        plotOptions: { areaspline: { fillOpacity: 0.1, marker: { enabled: false } } },
        series: [{
          name: 'Total Sales Orders',
          data: totalOrders.length ? totalOrders : [0, 0, 0, 0, 0, 0, 0, 0],
          color: '#2D4495',
          lineWidth: 3
        }, {
          name: 'Converted to Invoice',
          data: convertedToInvoice.length ? convertedToInvoice : [0, 0, 0, 0, 0, 0, 0, 0],
          color: '#10b981',
          lineWidth: 3
        }]
      } as any);
    }

    if (document.getElementById('salesCategoryChart')) {
      Highcharts.chart('salesCategoryChart', {
        chart: { type: 'pie', backgroundColor: 'transparent', style: { fontFamily: 'inherit' } },
        title: { text: '' },
        credits: { enabled: false },
        plotOptions: { pie: { innerSize: '75%', borderPadding: 0, borderWidth: 0, dataLabels: { enabled: false } } },
        series: [{
          name: 'Sales',
          data: [
            { name: 'Electronics', y: 45, color: '#2D4495' },
            { name: 'Apparel', y: 25, color: '#10b981' },
            { name: 'Home Goods', y: 20, color: '#f59e0b' },
            { name: 'Other', y: 10, color: '#e2e8f0' }
          ]
        }]
      } as any);
    }
  }

  initPurchaseCharts() {
    if (document.getElementById('purchaseTrendChart')) {
      Highcharts.chart('purchaseTrendChart', {
        chart: { type: 'column', backgroundColor: 'transparent', style: { fontFamily: 'inherit' } },
        title: { text: '' },
        xAxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], lineWidth: 0, tickWidth: 0 },
        yAxis: { title: { text: '' }, gridLineColor: '#f1f5f9' },
        credits: { enabled: false },
        plotOptions: { column: { borderRadius: 4, pointPadding: 0.2 } },
        series: [{
          name: 'Purchase Value (₹)',
          data: [320000, 280000, 410000, 390000, 510000, 460000],
          color: '#10b981'
        }]
      } as any);
    }

    if (document.getElementById('purchaseVendorChart')) {
      Highcharts.chart('purchaseVendorChart', {
        chart: { type: 'pie', backgroundColor: 'transparent', style: { fontFamily: 'inherit' } },
        title: { text: '' },
        credits: { enabled: false },
        plotOptions: { pie: { innerSize: '60%', borderWidth: 2, borderColor: '#ffffff', dataLabels: { enabled: false } } },
        series: [{
          name: 'Share',
          data: [
            { name: 'Vendor A', y: 40, color: '#10b981' },
            { name: 'Vendor B', y: 35, color: '#3b82f6' },
            { name: 'Vendor C', y: 15, color: '#8b5cf6' },
            { name: 'Others', y: 10, color: '#e2e8f0' }
          ]
        }]
      } as any);
    }
  }

  initStockCharts() {
    if (document.getElementById('stockChart')) {
      Highcharts.chart('stockChart', {
        chart: { type: 'areaspline', backgroundColor: 'transparent', style: { fontFamily: 'inherit' } },
        title: { text: '' },
        xAxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], lineWidth: 0, tickWidth: 0 },
        yAxis: { title: { text: '' }, gridLineColor: '#f1f5f9' },
        credits: { enabled: false },
        plotOptions: { areaspline: { fillOpacity: 0.1, marker: { enabled: false } } },
        series: [{
          name: 'Inventory Level',
          data: [1200, 1350, 1100, 1500, 1400, 1600],
          color: '#2D4495',
          lineWidth: 3
        }, {
          name: 'Sales Demand',
          data: [800, 950, 1200, 1100, 1300, 1500],
          color: '#10b981',
          lineWidth: 3
        }]
      } as any);
    }

    if (document.getElementById('categoryChart')) {
      Highcharts.chart('categoryChart', {
        chart: { type: 'pie', backgroundColor: 'transparent', style: { fontFamily: 'inherit' } },
        title: { text: '' },
        credits: { enabled: false },
        plotOptions: { pie: { innerSize: '70%', borderPadding: 0, borderWidth: 0, dataLabels: { enabled: false } } },
        series: [{
          name: 'Value',
          data: [
            { name: 'Finished Goods', y: 50, color: '#2D4495' },
            { name: 'Raw Materials', y: 30, color: '#10b981' },
            { name: 'Packing', y: 20, color: '#f59e0b' }
          ]
        }]
      } as any);
    }
  }

  // Report Links Data
  salesReportLinks = [
    { title: 'Sales Orders', description: 'Overview of all sales orders', link: '/sales/orders', type: 'sales_orders' },
    { title: 'Invoices', description: 'Generated tax invoices', link: '/sales/invoices', type: 'invoices' },
    { title: 'Delivery Notes', description: 'Dispatched goods records', link: '/sales/delivery', type: 'delivery_notes' },
    { title: 'Payment Received', description: 'Recorded customer payments', link: '/sales/payments', type: 'payments' },
    { title: 'Sales Returns', description: 'Returned items and credit notes', link: '/sales/returns', type: 'sales_returns' },
  ];

  purchaseReportLinks = [
    { title: 'Purchase Orders', description: 'All issued purchase orders', link: '/purchases/orders', type: 'purchase_orders' },
    { title: 'Vendor Bills', description: 'Registered supplier bills', link: '/purchases/bills', type: 'bills' },
    { title: 'Goods Receipt', description: 'Received inventory records (GRN)', link: '/purchases/grn', type: 'grn' },
    { title: 'Vendor Payments', description: 'Payments issued to vendors', link: '/purchases/payments', type: 'vendor_payments' },
    { title: 'Purchase Returns', description: 'Goods returned to suppliers', link: '/purchases/returns', type: 'purchase_returns' },
  ];

  stockReportLinks = [
    { title: 'Stock Ledger', description: 'Detailed inventory transactions', link: '/inventory/ledger', type: 'stock_ledger' },
    { title: 'Stock Adjustments', description: 'Manual stock corrections', link: '/inventory/adjustments', type: 'adjustments' },
    { title: 'Low Stock Alerts', description: 'Items requiring reorder', link: '/inventory/low-stock', type: 'low_stock' },
    { title: 'Valuation Report', description: 'Current stock financial value', link: '/inventory/valuation', type: 'valuation' },
  ];

  dummyEmployees = [
    { name: 'Rahul Sharma', role: 'Sales Manager', dept: 'Sales', status: 'Active', email: 'rahul.s@ezcorp.com', avatar: 'RS' },
    { name: 'Priya Patel', role: 'Inventory Specialist', dept: 'Warehouse', status: 'Active', email: 'priya.p@ezcorp.com', avatar: 'PP' },
    { name: 'Amit Kumar', role: 'Accountant', dept: 'Finance', status: 'On Leave', email: 'amit.k@ezcorp.com', avatar: 'AK' },
    { name: 'Neha Gupta', role: 'Purchase Executive', dept: 'Procurement', status: 'Active', email: 'neha.g@ezcorp.com', avatar: 'NG' },
    { name: 'Vikram Singh', role: 'Warehouse Executive', dept: 'Warehouse', status: 'Active', email: 'vikram.s@ezcorp.com', avatar: 'VS' },
  ];

  dummyCustomers = [
    { name: 'Acme Corp', contact: 'John Doe', totalSpend: '₹12,45,000', lastOrder: '2026-03-12', status: 'Active' },
    { name: 'Global Industries', contact: 'Sarah Smith', totalSpend: '₹8,90,000', lastOrder: '2026-03-10', status: 'Active' },
    { name: 'Zenith Retails', contact: 'Mike Johnson', totalSpend: '₹4,20,000', lastOrder: '2026-03-09', status: 'At Risk' },
    { name: 'TechFlow Inc', contact: 'Emily Brown', totalSpend: '₹1,50,000', lastOrder: '2026-03-11', status: 'Active' },
    { name: 'Nexus Solutions', contact: 'David Lee', totalSpend: '₹5,80,000', lastOrder: '2026-01-15', status: 'Churned' },
  ];
}