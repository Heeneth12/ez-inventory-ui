import { Component, ElementRef, HostListener, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { SearchResult, SearchService, SearchCategory } from './search-modal.service';
import { ModalService } from '../modal/modalService';
import { LucideAngularModule, Search, Loader2, Package, ShoppingCart, Users, Folder, ChevronRight, FileText } from 'lucide-angular';

@Component({
  selector: 'app-search-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './search-modal.component.html',
})
export class SearchModalComponent implements OnInit, AfterViewInit {
  @ViewChild('searchInput') searchInput!: ElementRef;

  // Icons
  readonly SearchIcon = Search;
  readonly LoaderIcon = Loader2;
  readonly ProductIcon = Package;
  readonly OrderIcon = ShoppingCart;
  readonly UserIcon = Users;
  readonly FolderIcon = Folder;
  readonly ChevronRightIcon = ChevronRight;
  readonly InvoiceIcon = FileText;

  searchQuery = '';
  isLoading = false;

  // Filtering Logic
  activeFilter: SearchCategory = 'all';
  filters: { id: SearchCategory; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'products', label: 'Products' },
    { id: 'orders', label: 'Orders' },
    { id: 'customers', label: 'Customers' },
    { id: 'invoices', label: 'Invoices' },
  ];

  recentSearches: SearchResult[] = [];
  flatResults: SearchResult[] = [];
  groupedResults: { category: string, items: SearchResult[] }[] = [];

  selectedIndex = 0;
  private searchSubject = new Subject<string>();

  constructor(
    public searchService: SearchService,
    private modalService: ModalService,
    private router: Router
  ) { }

  ngOnInit() {
    this.recentSearches = this.searchService.getRecentSearches();

    this.searchSubject.pipe(
      debounceTime(250), // Snappier response
      distinctUntilChanged(),
      switchMap(query => {
        this.isLoading = true;
        // Pass the active filter to the service
        return this.searchService.search(query, this.activeFilter);
      })
    ).subscribe(results => {
      this.isLoading = false;
      this.processResults(results);
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.searchInput?.nativeElement.focus();
    }, 100);
  }

  // Set filter via click or maybe tab key later
  setFilter(filter: SearchCategory) {
    this.activeFilter = filter;
    // Re-trigger search if query exists
    if (this.searchQuery) {
      this.onSearchInput(this.searchQuery);
    }
    // Focus back on input
    this.searchInput?.nativeElement.focus();
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {

    // Only process nav if modal is visually open (simplified check)
    // Add logic here to prevent processing if closed

    if (event.key === 'Escape') {
      this.close();
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.navigate(1);
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.navigate(-1);
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      this.selectCurrent();
    }

    // Allow Tab to cycle filters?
    if (event.key === 'Tab') {
      // Optional: Advanced logic to cycle filters
    }
  }

  onSearchInput(query: string) {
    if (!query) {
      this.isLoading = false;
      this.groupedResults = [];
      // Show recent searches only if filter is 'all' or matches
      this.flatResults = this.recentSearches;
    } else {
      this.searchSubject.next(query);
    }
  }

  close() {
    this.modalService.close();
  }

  processResults(results: SearchResult[]) {
    this.flatResults = results;
    this.selectedIndex = 0;

    const groups: Record<string, SearchResult[]> = {};
    results.forEach(r => {
      if (!groups[r.category]) groups[r.category] = [];
      groups[r.category].push(r);
    });

    // Ensure specific order of categories if desired
    this.groupedResults = Object.keys(groups).map(key => ({
      category: key,
      items: groups[key]
    }));
  }

  navigate(dir: number) {
    const list = this.searchQuery ? this.flatResults : this.recentSearches;
    if (list.length === 0) return;

    this.selectedIndex += dir;
    if (this.selectedIndex < 0) this.selectedIndex = list.length - 1;
    if (this.selectedIndex >= list.length) this.selectedIndex = 0;

    const item = list[this.selectedIndex];
    if (item) {
      const el = document.getElementById('result-' + item.id);
      el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  selectCurrent() {
    const list = this.searchQuery ? this.flatResults : this.recentSearches;
    if (list[this.selectedIndex]) {
      this.selectResult(list[this.selectedIndex]);
    }
  }

  selectResult(item: SearchResult) {
    this.searchService.addRecentSearch(item);
    this.close();
    this.router.navigate(Array.isArray(item.route) ? item.route : [item.route]);
  }

  isActive(item: SearchResult): boolean {
    const list = this.searchQuery ? this.flatResults : this.recentSearches;
    return list[this.selectedIndex]?.id === item.id;
  }

  // Improved Highlighter that handles contrast
  highlightText(text: string, query: string, isActive: boolean): string {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const highlightClass = 'text-indigo-600 font-semibold bg-indigo-50/50 px-0.5 rounded-sm';
    return text.replace(regex, `<span class="${highlightClass}">$1</span>`);
  }
}