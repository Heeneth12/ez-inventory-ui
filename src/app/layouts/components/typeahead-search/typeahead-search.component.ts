import { Component, Input, Output, EventEmitter, computed, signal, effect, ElementRef, ViewChild, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchConfig } from './typeahead-search.models';


@Component({
  selector: 'app-typeahead-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './typeahead-search.component.html',
  styleUrls: ['./typeahead-search.component.css']
})
export class TypeaheadSearchComponent<T> {
  @Input({ required: true }) items: T[] = [];
  @Input({ required: true }) config!: SearchConfig<T>;
  @Input() placeholder: string = 'Search...';

  @Output() itemSelected = new EventEmitter<T>();

  @ViewChild('searchInput') searchInput!: ElementRef;
  @ViewChild('searchContainer') searchContainer!: ElementRef;

  // Signals
  searchQuery = signal('');

  // Dynamic Filters State: Map<keyof T, value>
  activeFilters = signal<Map<string, any>>(new Map());

  isFocused = signal(false);
  isAdvancedOpen = signal(false);
  activeIndex = signal(-1);

  // Computed
  filteredItems = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const currentFilters = this.activeFilters();

    return this.items.filter(item => {
      // 1. Check Text Search
      // Check if ANY of the searchable keys match the query
      let matchesQuery = !query; // if no query, match is true
      if (query) {
        matchesQuery = this.config.searchableKeys.some(key => {
          const val = String(item[key] || '').toLowerCase();
          return val.includes(query);
        });
      }

      // 2. Check Dynamic Filters
      let matchesFilters = true;
      if (this.config.filters) {
        for (const filter of this.config.filters) {
          const filterValue = currentFilters.get(String(filter.key));
          if (filterValue && item[filter.key] !== filterValue) {
            matchesFilters = false;
            break;
          }
        }
      }

      return matchesQuery && matchesFilters;
    });
  });

  filteredCount = computed(() => this.filteredItems().length);

  constructor() {
    effect(() => {
      this.filteredItems();
      this.activeIndex.set(-1);
    }, { allowSignalWrites: true });
  }

  // --- Logic ---
  onSearchInput(val: string) {
    this.searchQuery.set(val);
  }

  toggleAdvanced() {
    this.isAdvancedOpen.update(v => !v);
    if (this.isAdvancedOpen()) {
      setTimeout(() => this.searchInput.nativeElement.focus(), 50);
    }
  }

  // Generic Filter Handlers
  getFilterValue(key: keyof T): any {
    return this.activeFilters().get(String(key)) || null;
  }

  setFilterValue(key: keyof T, value: any) {
    this.activeFilters.update(map => {
      const newMap = new Map(map);
      if (value === null || value === '') {
        newMap.delete(String(key));
      } else {
        newMap.set(String(key), value);
      }
      return newMap;
    });
  }

  togglePillFilter(key: keyof T, value: any) {
    const current = this.getFilterValue(key);
    this.setFilterValue(key, current === value ? null : value);
  }

  resetFilters() {
    this.activeFilters.set(new Map());
    this.searchInput.nativeElement.focus();
  }

  selectItem(item: T) {
    this.itemSelected.emit(item);
    this.closeDropdown();
  }

  closeDropdown() {
    this.isFocused.set(false);
    this.isAdvancedOpen.set(false);
    this.activeIndex.set(-1);
    this.searchQuery.set('');
  }

  // --- Helpers ---
  getItemValue(item: T, key: keyof T | undefined): any {
    if (!key) return '';
    return item[key];
  }

  getInitials(name: any): string {
    if (!name || typeof name !== 'string') return '??';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  highlightText(text: any): string {
    const str = String(text);
    const query = this.searchQuery();
    if (!query) return str;
    const regex = new RegExp(`(${query})`, 'gi');
    return str.replace(regex, '<span class="bg-yellow-200/80 text-slate-900 rounded-xs px-0.5">$1</span>');
  }

  // This is a bit opinionated (colors), but useful default behavior
  // You could move this to a helper function input if needed strict decoupling
  getStatusBadgeClass(status: any): string {
    const s = String(status).toLowerCase();
    if (s === 'active' || s === 'in stock') return 'bg-emerald-100 text-emerald-700';
    if (s === 'offline' || s === 'archived') return 'bg-slate-100 text-slate-500';
    if (s === 'busy' || s === 'low stock') return 'bg-amber-100 text-amber-700';
    return 'bg-slate-100 text-slate-700';
  }

  // --- Events ---
  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: Event) {
    if (this.searchContainer && !this.searchContainer.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }

  handleKeydown(event: KeyboardEvent) {
    const isOpen = this.isFocused() || this.isAdvancedOpen();
    if (!isOpen) return;

    const results = this.filteredItems();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.activeIndex.update(i => i < results.length - 1 ? i + 1 : 0);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex.update(i => i > 0 ? i - 1 : results.length - 1);
        break;
      case 'Enter':
        event.preventDefault();
        if (this.activeIndex() >= 0 && results[this.activeIndex()]) {
          this.selectItem(results[this.activeIndex()]);
        }
        break;
      case 'Escape':
        this.closeDropdown();
        this.searchInput.nativeElement.blur();
        break;
    }
  }
}
