import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, X, Package, Layers, Info, CheckCircle2, AlertCircle } from 'lucide-angular';
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

  constructor(
    private itemService: ItemService,
    private stockService: StockService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.searchSubject.pipe(
      debounceTime(200), // Slightly faster debounce
      distinctUntilChanged()
    ).subscribe(query => {
      this.performSearch(query);
    });
  }

  ngAfterViewInit() {
    if (this.autoFocus) {
      // Small delay to ensure modal transition is finishing
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
      this.stockService.searchItems({ searchQuery: query }, (res: any) => {
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

  selectItem(item: any) {
    this.selected.emit(item);
  }

  @HostListener('keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.selectedIndex = (this.selectedIndex + 1) % this.results.length;
      this.scrollToSelected();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.selectedIndex = (this.selectedIndex - 1 + this.results.length) % this.results.length;
      this.scrollToSelected();
    } else if (event.key === 'Enter') {
      if (this.results[this.selectedIndex]) {
        this.selectItem(this.results[this.selectedIndex]);
      }
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
