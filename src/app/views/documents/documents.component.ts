import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  LucideAngularModule, 
  Search, 
  Upload, 
  FileText, 
  Folder, 
  FileCheck, 
  Clock, 
  MoreVertical, 
  ShieldCheck,
  Package,
  ShoppingCart
} from 'lucide-angular';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './documents.component.html',
})
export class DocumentsComponent {
  // Icons
  readonly Search = Search;
  readonly Upload = Upload;
  readonly FileText = FileText;
  readonly MoreVertical = MoreVertical;

  activeFolder: string = 'all';

  folders = [
    { id: 'all', label: 'All Documents', icon: Folder, count: 124 },
    { id: 'invoices', label: 'Invoices', icon: FileCheck, count: 42 },
    { id: 'orders', label: 'Purchase Orders', icon: ShoppingCart, count: 18 },
    { id: 'stock', label: 'Inventory Sheets', icon: Package, count: 8 },
    { id: 'vouchers', label: 'Tax Vouchers', icon: ShieldCheck, count: 12 },
  ];

  documents = [
    {
      name: 'Invoice_OCT_2023_9920.pdf',
      size: '1.2 MB',
      type: 'PDF',
      ref: 'INV-2023-9920',
      date: 'Oct 24, 2023',
      status: 'Verified',
      statusClass: 'bg-emerald-50 text-emerald-600 border-emerald-100'
    },
    {
      name: 'PO_Vendor_Agarwal_Eye.pdf',
      size: '850 KB',
      type: 'PDF',
      ref: 'PO-77281-A',
      date: 'Oct 22, 2023',
      status: 'Pending',
      statusClass: 'bg-amber-50 text-amber-600 border-amber-100'
    },
    {
      name: 'Stock_Audit_Report_Q3.xlsx',
      size: '2.4 MB',
      type: 'XLSX',
      ref: 'AUD-2023-Q3',
      date: 'Oct 15, 2023',
      status: 'Archived',
      statusClass: 'bg-slate-50 text-slate-500 border-slate-100'
    }
  ];
}