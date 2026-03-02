import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Bell, Calendar, ChevronDown, Coins, Download, Eye, LucideAngularModule, MoreVertical, MousePointerClick, Notebook, PackageCheck, Plus, Send, ShoppingBag, ShoppingCart, Star, TrendingDown, TrendingUp, Users } from "lucide-angular";

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './todo.component.html',
  styleUrl: './todo.component.css'
})
export class TodoComponent {

  // Dummy data for the Purchase Queue (Incoming Stock)
  purchaseQueue: PurchaseItem[] = [
    {
      id: 'PUR-2026-001',
      vendor: 'Global Tech Supplies',
      itemsCount: 45,
      totalAmount: 1250.50,
      status: 'Pending',
      receivedDate: '2026-02-25 10:30 AM'
    },
    {
      id: 'PUR-2026-002',
      vendor: 'Nexus Logistics',
      itemsCount: 12,
      totalAmount: 450.00,
      status: 'Pending',
      receivedDate: '2026-02-25 01:15 PM'
    },
    {
      id: 'PUR-2026-003',
      vendor: 'Prime Wholesale',
      itemsCount: 150,
      totalAmount: 3200.75,
      status: 'Pending',
      receivedDate: '2026-02-25 03:45 PM'
    },
    {
      id: 'PUR-2026-004',
      vendor: 'Office Depot Inc',
      itemsCount: 5,
      totalAmount: 89.99,
      status: 'Pending',
      receivedDate: '2026-02-25 04:20 PM'
    }
  ];

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

  // Method to calculate total physical cash
  get totalPhysicalCash(): number {
    return this.notes.reduce((acc, note) => acc + (note.value * note.qty), 0);
  }

  // Icons (mock for lucide-icon)
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
    purchaseQueue : Send,
    shoppingCart: ShoppingBag,
    salesData : ShoppingCart,
    coins : Coins,
    notes:Notebook,
  };
}


interface PurchaseItem {
  id: string;
  vendor: string;
  itemsCount: number;
  totalAmount: number;
  status: 'Pending' | 'Verified' | 'Discrepancy';
  receivedDate: string;
}