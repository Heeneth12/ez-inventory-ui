import { Component, Input, OnChanges, SimpleChanges, computed, signal } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

// --- Interfaces ---

export type ColumnType = 'text' | 'currency' | 'date' | 'status' | 'user-profile' | 'index' | 'actions';

export interface TableColumn {
  key: string;
  label: string;
  type: ColumnType;
  sortable?: boolean;
  minWidth?: string;
}

export interface TableAction {
  label: string;
  icon?: string;
  action: (row: any) => void;
}

@Component({
  selector: 'app-smart-table',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: `./smart-table.component.html`,
  styleUrls: ['./smart-table.component.css'],
})
export class SmartTableComponent implements OnChanges {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) columns!: TableColumn[];
  @Input({ required: true }) data: any[] = [];

  // Internal State
  searchQuery = signal('');
  sortKey = signal<string | null>(null);
  sortDirection = signal<'asc' | 'desc'>('asc');

  // Internal Signal to hold data for reactivity
  private _data = signal<any[]>([]);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this._data.set(this.data || []);
    }
  }

  // Computed signal to handle both sorting and filtering efficiently
  processedData = computed(() => {
    let result = [...this._data()];
    const query = this.searchQuery().toLowerCase();
    const sKey = this.sortKey();
    const sDir = this.sortDirection();

    // 1. Filter
    if (query) {
      result = result.filter(row => {
        return Object.values(row).some(val => {
          if (typeof val === 'object' && val !== null && 'name' in val) {
            return (val as any).name.toLowerCase().includes(query);
          }
          return String(val).toLowerCase().includes(query);
        });
      });
    }

    // 2. Sort
    if (sKey) {
      result.sort((a, b) => {
        let valA = a[sKey];
        let valB = b[sKey];

        // Handle nested objects like {name: '...', avatar: '...'} for sorting
        if (typeof valA === 'object' && valA?.name) valA = valA.name;
        if (typeof valB === 'object' && valB?.name) valB = valB.name;

        if (valA < valB) return sDir === 'asc' ? -1 : 1;
        if (valA > valB) return sDir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  });

  handleSort(key: string) {
    if (this.sortKey() === key) {
      // Toggle direction
      this.sortDirection.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      // New sort key
      this.sortKey.set(key);
      this.sortDirection.set('asc');
    }
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  // Styles utility for Status badges
  getStatusStyles(status: string): string {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  }

  getStatusDotStyles(status: string): string {
     switch (status.toLowerCase()) {
      case 'active': return 'bg-emerald-500';
      case 'pending': return 'bg-amber-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  }
}