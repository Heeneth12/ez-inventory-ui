import { Component, Input, Output, EventEmitter, signal, computed, OnChanges, SimpleChanges, ElementRef, HostListener } from '@angular/core';
import { CommonModule, DecimalPipe, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableColumn, TableRow, LoadMode, PaginationConfig, TableAction, Density, TableActionConfig } from './standard-table.model';
import { LucideAngularModule, Filter, Calendar, Download, Edit, Trash2, EyeIcon, MoreVertical, ArrowRight } from 'lucide-angular';

@Component({
  selector: 'app-standard-table',
  standalone: true,
  imports: [CommonModule, DecimalPipe, CurrencyPipe, FormsModule, LucideAngularModule, DatePipe],
  templateUrl: './standard-table.component.html',
  styleUrls: ['./standard-table.component.css'],
})
export class StandardTableComponent implements OnChanges {
  @Input() title: string = '';
  @Input() columns: TableColumn[] = [];
  @Input() data: TableRow[] = [];
  @Input() loadMode: LoadMode = 'pagination';
  @Input() pagination: PaginationConfig = { pageSize: 10, currentPage: 1, totalItems: 0 };
  @Input() isLoading: boolean = false;
  @Input() enableSelection: boolean = true; // New: Toggle selection column
  @Input() isServerSide: boolean = false;

  // NEW: Input for your custom buttons
  @Input() customActions: TableActionConfig[] = [];

  @Output() pageChange = new EventEmitter<number>();
  @Output() loadMore = new EventEmitter<void>();
  @Output() action = new EventEmitter<TableAction>();
  @Output() selectionChange = new EventEmitter<(string | number)[]>(); // New: Emit selected IDs

  // Icons
  readonly Filter = Filter;
  readonly Calendar = Calendar;
  readonly Download = Download;
  readonly Edit = Edit;
  readonly View = EyeIcon;
  readonly Delete = Trash2;
  readonly MoreVertical = MoreVertical;
  readonly ArrowRight = ArrowRight;

  // State Signals
  searchQuery = signal('');
  showSettings = signal(false);
  density = signal<Density>('normal');
  sortKey = signal<string | null>(null);
  sortDirection = signal<'asc' | 'desc'>('asc');

  // Reactivity Fixes
  private _localData = signal<TableRow[]>([]);
  // We need a signal for the page to trigger 'displayedRows' recalculation
  currentPageSignal = signal(1);

  // Selection State
  selectedIds = signal<Set<string | number>>(new Set());

  // Settings
  stripedRows: boolean = true;

  activeMenuRowId = signal<string | number | null>(null);

  constructor(private eRef: ElementRef) { }

  ngOnChanges(changes: SimpleChanges) {
    // Sync local data
    if (changes['data']) {
      this._localData.set([...this.data]);
    }
    // Sync pagination input to signal (Fixes the "Not working" issue)
    if (changes['pagination'] && this.pagination) {
      this.currentPageSignal.set(this.pagination.currentPage);
    }
  }

  // --- Computed ---
  visibleColumns = computed(() => this.columns.filter(c => c.visible !== false));

  displayedRows = computed(() => {
    let rows = [...this._localData()];
    const query = this.searchQuery().toLowerCase();

    // 1. Client-side Search
    if (query) {
      rows = rows.filter(row =>
        Object.keys(row).some(key =>
          String(row[key]).toLowerCase().includes(query)
        )
      );
    }

    // 2. Client-side Sorting
    const key = this.sortKey();
    if (key) {
      const dir = this.sortDirection() === 'asc' ? 1 : -1;
      rows.sort((a, b) => {
        const valA = a[key];
        const valB = b[key];
        if (typeof valA === 'string' && typeof valB === 'string') {
          return valA.localeCompare(valB) * dir;
        }
        return ((valA || 0) - (valB || 0)) * dir;
      });
    }

    // 3. Pagination Logic (Using Signals now)
    if (this.loadMode === 'pagination' && !this.isServerSide) {
      const page = this.currentPageSignal(); // Dependency on Signal
      const size = this.pagination.pageSize;
      const start = (page - 1) * size;
      // Safety check for client-side pagination
      return rows.slice(start, start + size);
    }

    return rows;
  });

  // Check if all CURRENTLY displayed rows are selected
  isAllSelected = computed(() => {
    const rows = this.displayedRows();
    if (rows.length === 0) return false;
    const selected = this.selectedIds();
    return rows.every(row => selected.has(row.id));
  });

  // Check if some but not all are selected
  isIndeterminate = computed(() => {
    const rows = this.displayedRows();
    if (rows.length === 0) return false;
    const selected = this.selectedIds();
    const count = rows.filter(row => selected.has(row.id)).length;
    return count > 0 && count < rows.length;
  });

  // --- UI Helpers ---
  getCellPadding(isHeader = false): string {
    const d = this.density();
    switch (d) {
      case 'compact': return isHeader ? 'px-3 py-2 text-xs' : 'px-3 py-1.5';
      case 'comfortable': return isHeader ? 'px-6 py-4 text-sm' : 'px-6 py-4';
      default: return isHeader ? 'px-4 py-3 text-xs' : 'px-4 py-3';
    }
  }

  getBadgeClass(status: any): string {
    if (!status) return 'bg-gray-100 text-gray-800 border-gray-200';
    const s = String(status).toLowerCase().trim();

    // 1. Define your base styles
    const styles = {
      success: 'bg-green-100 text-green-800 border-green-200',
      danger: 'bg-red-100 text-red-800 border-red-200',
      warning: 'bg-amber-100 text-amber-800 border-amber-200',
      info: 'bg-blue-100 text-blue-800 border-blue-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      neutral: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    // SUCCESS
    if (['active', 'in', 'paid', 'success', 'completed', 'approved', 'in stock', 'product', 'fully_invoiced'].includes(s)) {
      return styles.success;
    }

    // DANGER
    if (['inactive', 'out', 'error', 'failed', 'rejected', 'out of stock', 'closed'].includes(s)) {
      return styles.danger;
    }

    // WARNING
    if (['pending', 'processing', 'hold', 'warning', 'partially invoiced', 'issued'].includes(s)) {
      return styles.warning;
    }

    // INFO / ROLES
    if (['manager', 'lead', 'supplier', 'service', 'created'].includes(s)) {
      return styles.info;
    }

    // PURPLE / TECH
    if (['engineer', 'developer', 'dev', 'partially_paid', 'partially_received'].includes(s)) {
      return styles.purple;
    }

    return styles.neutral;
  }

  getStartItem() {
    if (this.pagination.totalItems === 0) return 0;
    return (this.currentPageSignal() - 1) * this.pagination.pageSize + 1;
  }

  getEndItem() {
    return Math.min(this.currentPageSignal() * this.pagination.pageSize, this.pagination.totalItems);
  }

  isMatch(value: any): boolean {
    if (!this.searchQuery()) return false;
    return String(value).toLowerCase().includes(this.searchQuery().toLowerCase());
  }

  // --- Actions ---

  // Select/Deselect a single row
  toggleRowSelection(row: TableRow) {
    const newSet = new Set(this.selectedIds());
    if (newSet.has(row.id)) {
      newSet.delete(row.id);
    } else {
      newSet.add(row.id);
    }
    this.selectedIds.set(newSet);
    this.selectionChange.emit(Array.from(newSet));
  }

  // Select/Deselect all visible rows
  toggleSelectAll() {
    const newSet = new Set(this.selectedIds());
    const rows = this.displayedRows();

    if (this.isAllSelected()) {
      // Deselect current page
      rows.forEach(row => newSet.delete(row.id));
    } else {
      // Select current page
      rows.forEach(row => newSet.add(row.id));
    }
    this.selectedIds.set(newSet);
    this.selectionChange.emit(Array.from(newSet));
  }

  setDensity(value: string) {
    this.density.set(value as Density);
  }

  toggleColumn(col: TableColumn) {
    col.visible = col.visible === undefined ? false : !col.visible;
    this.columns = [...this.columns];
  }

  sort(key: string) {
    if (this.sortKey() === key) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortKey.set(key);
      this.sortDirection.set('asc');
    }
  }

  changePage(delta: number) {
    const newPage = this.currentPageSignal() + delta;
    if (newPage > 0) {
      // Optimistically update signal for immediate UI response
      this.currentPageSignal.set(newPage);
      // Emit event for parent to fetch data if server-side
      this.pageChange.emit(newPage);
    }
  }

  onScroll(event: any) {
    if (this.loadMode !== 'infinite' || this.isLoading) return;
    const el = event.target;
    if (el.scrollHeight - el.scrollTop <= el.clientHeight + 50) {
      this.loadMore.emit();
    }
  }

  // Close menu when clicking outside
  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    // If the click is NOT inside a dropdown trigger or menu, close it
    if (!event.target.closest('.action-menu-container')) {
      this.activeMenuRowId.set(null);
    }
  }

  toggleActionMenu(rowId: string | number, event: Event) {
    event.stopPropagation();
    if (this.activeMenuRowId() === rowId) {
      this.activeMenuRowId.set(null);
    } else {
      this.activeMenuRowId.set(rowId);
    }
  }

  // Handle Custom Action Click
  emitCustomAction(actConfig: TableActionConfig, row: TableRow) {
    this.action.emit({ type: 'custom', row, key: actConfig.key });
  }

  // Handle Standard Action Click (from dropdown)
  emitAction(type: 'view' | 'edit' | 'delete' | 'toggle', row: TableRow, key?: string) {
    if (type === 'toggle' && key) {
      row[key] = !row[key];
    }
    this.action.emit({ type, row, key });
    this.activeMenuRowId.set(null); // Close menu after action
  }
}