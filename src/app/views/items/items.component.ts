import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../layouts/UI/card/card.component';
import { TableComponent } from '../../layouts/UI/table/table.component';
import { ButtonComponent } from '../../layouts/UI/button/button.component';
import { LucideAngularModule, Plus, Edit, Trash2, Search, Filter } from 'lucide-angular';

@Component({
  selector: 'app-items',
  standalone: true,
  imports: [CommonModule, CardComponent, TableComponent, ButtonComponent, LucideAngularModule],
  templateUrl: './items.component.html',
  styleUrl: './items.component.css'
})
export class ItemsComponent {

  readonly Plus = Plus;
  readonly Edit = Edit;
  readonly Trash2 = Trash2;
  readonly Search = Search;
  readonly Filter = Filter;
  columns = ['Name', 'SKU', 'Type', 'Category', 'Price', 'Stock/Duration', 'Status', 'Actions'];
  items = [
    {
      id: 1,
      name: 'Premium Widget A',
      sku: 'WDG-001',
      type: 'Item',
      category: 'Electronics',
      price: 199.99,
      stock: 45,
      unit: 'pcs',
      status: 'In Stock',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=100&q=80'
    },
    {
      id: 2,
      name: 'Basic Service Plan',
      sku: 'SVC-BSC',
      type: 'Service',
      category: 'Consulting',
      price: 99.00,
      stock: null,
      duration: '1 Hour',
      status: 'Active',
      image: null
    },
    {
      id: 3,
      name: 'Office Chair Ergonomic',
      sku: 'FUR-CHR-002',
      type: 'Item',
      category: 'Furniture',
      price: 249.50,
      stock: 12,
      unit: 'pcs',
      status: 'Low Stock',
      image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=100&q=80'
    },
    {
      id: 4,
      name: 'Installation Service',
      sku: 'SVC-INST',
      type: 'Service',
      category: 'Support',
      price: 150.00,
      stock: null,
      duration: 'Per Job',
      status: 'Active',
      image: null
    },
    {
      id: 5,
      name: 'Wireless Mouse',
      sku: 'ACC-MSE-003',
      type: 'Item',
      category: 'Accessories',
      price: 29.99,
      stock: 0,
      unit: 'pcs',
      status: 'Out of Stock',
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=100&q=80'
    },
    {
      id: 6,
      name: 'Maintenance Package',
      sku: 'SVC-MNT-001',
      type: 'Service',
      category: 'Maintenance',
      price: 500.00,
      stock: null,
      duration: 'Monthly',
      status: 'Active',
      image: null
    }
  ];

  getStatusClass(status: string): string {
    switch (status) {
      case 'In Stock':
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Low Stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'Out of Stock':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}
