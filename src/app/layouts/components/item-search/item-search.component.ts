import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, X, Package, Layers, Info, CheckCircle2, AlertCircle, Clock, Calendar, AlertTriangle } from 'lucide-angular';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ItemService } from '../../../views/items/item.service';
import { StockService } from '../../../views/stock/stock.service';

@Component({
  selector: 'app-item-search',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './item-search.component.html',
  styleUrl: './item-search.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemSearchComponent implements OnInit {

  @Input() searchType: 'ITEM' | 'STOCK' = 'ITEM';
  @Input() placeholder: string = 'Search items...';
  @Input() autoFocus: boolean = true;

  @Output() selected = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  searchQuery: string = '';
  results: any[] = [];
  selectedIndex: number = 0;
  isLoading: boolean = false;
  hasSearched: boolean = false;

  private searchSubject = new Subject<string>();

  readonly Search = Search;
  readonly X = X;
  readonly Package = Package;
  readonly Layers = Layers;
  readonly Info = Info;
  readonly CheckCircle2 = CheckCircle2;
  readonly Clock = Clock;
  readonly Calendar = Calendar;
  readonly AlertTriangle = AlertTriangle;

  recentItems: any[] = [];
  private readonly RECENT_ITEMS_KEY: string = 'ez_recent_search_items';

  constructor(
    private itemService: ItemService,
    private stockService: StockService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadRecentItems();

    this.searchSubject.pipe(
      debounceTime(200),
      distinctUntilChanged()
    ).subscribe(query => {
      this.performSearch(query);
    });
  }

  ngAfterViewInit() {
    if (this.autoFocus) {
      setTimeout(() => this.searchInput?.nativeElement.focus(), 50);
    }
  }

  onSearchInput(event: any) {
    this.searchSubject.next(this.searchQuery);
  }

  performSearch(query: string) {
    if (!query || query.trim().length === 0) {
      this.results = [];
      this.hasSearched = false;
      return;
    }

    this.isLoading = true;
    this.hasSearched = true;

    if (this.searchType === 'ITEM') {
      this.itemService.searchItems({ searchQuery: query }, (res: any) => {
        this.results = res.data || [];
        this.selectedIndex = 0;
        this.isLoading = false;
        this.cdr.markForCheck();
      }, () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      });
    } else {
      this.stockService.searchItems(
        { searchQuery: query, warehouseId: 1 },
        (res: any) => {
          this.results = res.data || [];
          this.selectedIndex = 0;
          this.isLoading = false;
          this.cdr.markForCheck();
        }, () => {
          this.isLoading = false;
          this.cdr.markForCheck();
        });
    }
  }

  // Flatten stock items by batch — each batch becomes its own selectable row
  get displayResults(): any[] {
    if (this.searchType !== 'STOCK') return this.results;

    const rows: any[] = [];
    for (const item of this.results) {
      if (item.batches && item.batches.length > 0) {
        item.batches.forEach((batch: any, idx: number) => {
          rows.push({
            ...item,
            _batch: batch,
            _isFirstInGroup: idx === 0,
            _batchCount: item.batches.length
          });
        });
      } else {
        rows.push({ ...item, _batch: null, _isFirstInGroup: true, _batchCount: 0 });
      }
    }
    return rows;
  }

  selectItem(item: any) {
    const { _batch, _isFirstInGroup, _batchCount, ...itemData } = item;
    const emitItem = _batch
      ? { ...itemData, batchNumber: _batch.batchNumber }
      : itemData;

    this.saveRecentItem(emitItem);
    this.selected.emit(emitItem);
  }

  // Returns true if expiry is within 90 days
  isNearExpiry(dateStr: string): boolean {
    if (!dateStr) return false;
    const expiry = new Date(dateStr).getTime();
    const now = Date.now();
    const ninetyDays = 90 * 24 * 60 * 60 * 1000;
    return expiry - now < ninetyDays && expiry > now;
  }

  isExpired(dateStr: string): boolean {
    if (!dateStr) return false;
    return new Date(dateStr).getTime() < Date.now();
  }

  loadRecentItems() {
    const stored = localStorage.getItem(this.RECENT_ITEMS_KEY);
    if (stored) {
      try {
        this.recentItems = JSON.parse(stored);
      } catch (e) {
        this.recentItems = [];
      }
    }
  }

  saveRecentItem(item: any) {
    const { _batch, _isFirstInGroup, _batchCount, ...itemToSave } = item;
    this.recentItems = this.recentItems.filter(i => this.trackByItemId(0, i) !== this.trackByItemId(0, itemToSave));
    this.recentItems.unshift(itemToSave);
    if (this.recentItems.length > 5) {
      this.recentItems.pop();
    }
    localStorage.setItem(this.RECENT_ITEMS_KEY, JSON.stringify(this.recentItems));
  }

  @HostListener('keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    const total = this.displayResults.length;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.selectedIndex = (this.selectedIndex + 1) % total;
      this.scrollToSelected();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.selectedIndex = (this.selectedIndex - 1 + total) % total;
      this.scrollToSelected();
    } else if (event.key === 'Enter') {
      const row = this.displayResults[this.selectedIndex];
      if (row) this.selectItem(row);
    } else if (event.key === 'Escape') {
      this.close.emit();
    }
  }

  private scrollToSelected() {
    const element = document.getElementById(`result-item-${this.selectedIndex}`);
    if (element) {
      element.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  clearSearch() {
    this.searchQuery = '';
    this.results = [];
    this.hasSearched = false;
    this.cdr.markForCheck();
    this.searchInput.nativeElement.focus();
  }

  trackByItemId(index: number, item: any): any {
    return item.itemId || item.id || index;
  }
}
