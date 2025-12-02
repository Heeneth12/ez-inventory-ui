import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { 
  LucideAngularModule, 
  TrendingUp, TrendingDown, DollarSign, Package, AlertTriangle, 
  Activity, ArrowRight, MoreVertical, Calendar, Download, 
  Filter, Plus, ScanBarcode, FileText, ChevronDown, Search
} from 'lucide-angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  
  activeTab: 'low-stock' | 'recent-sales' = 'low-stock';

  readonly icons = {
    trendingUp: TrendingUp, trendingDown: TrendingDown, dollar: DollarSign,
    package: Package, alert: AlertTriangle, activity: Activity,
    arrowRight: ArrowRight, more: MoreVertical, calendar: Calendar,
    download: Download, filter: Filter, plus: Plus, scan: ScanBarcode,
    file: FileText, chevronDown: ChevronDown, search: Search
  };

  // Quick Action Buttons
  quickActions = [
    { label: 'Add Item', icon: Plus, color: 'bg-blue-600', text: 'text-white' },
    { label: 'Scan Stock', icon: ScanBarcode, color: 'bg-indigo-600', text: 'text-white' },
    { label: 'Create Order', icon: FileText, color: 'bg-slate-800', text: 'text-white' },
  ];

  // Top Cards
  stats = [
    { label: 'Total Revenue', value: '$128,430', trend: '+12.5%', isPositive: true, icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Items', value: '2,453', trend: '+4.2%', isPositive: true, icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Low Stock', value: '12', trend: '+2 new', isPositive: false, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Pending Orders', value: '18', trend: '-5%', isPositive: true, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' }
  ];

  // Visual Chart Data (CSS Chart)
  categoryDistribution = [
    { name: 'Electronics', percentage: 75, color: 'bg-blue-500', value: '$45k' },
    { name: 'Furniture', percentage: 45, color: 'bg-purple-500', value: '$22k' },
    { name: 'Accessories', percentage: 60, color: 'bg-emerald-500', value: '$34k' },
    { name: 'Stationery', percentage: 30, color: 'bg-amber-500', value: '$12k' },
  ];

  lowStockItems = [
    { name: 'MacBook Pro M2', sku: 'LAP-002', stock: 4, min: 10, status: 'Critical' },
    { name: 'Ergo Chair Ultra', sku: 'FUR-992', stock: 12, min: 20, status: 'Low' },
    { name: 'USB-C Hub', sku: 'ACC-201', stock: 8, min: 15, status: 'Low' },
    { name: 'Monitor 4K', sku: 'DIS-101', stock: 2, min: 5, status: 'Critical' },
    { name: 'Wireless Mouse', sku: 'ACC-505', stock: 15, min: 25, status: 'Low' },
  ];

  recentActivity = [
    { title: 'Stock Adjustment', desc: 'iPhone 15 Pro Max (x5)', time: '10 min ago', user: 'AD' },
    { title: 'New Order #2291', desc: ' dispatched to New York', time: '2 hours ago', user: 'JS' },
    { title: 'Low Stock Alert', desc: 'MacBook Pro reached reorder point', time: '5 hours ago', user: 'SYS' },
  ];

  setActiveTab(tab: 'low-stock' | 'recent-sales') {
    this.activeTab = tab;
  }
}