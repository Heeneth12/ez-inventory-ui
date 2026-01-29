import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { SearchResult, SearchService, SearchCategory } from './search-modal.service';

@Component({
  selector: 'app-search-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <ng-container *ngIf="searchService.isOpen$ | async">
      <div 
        class="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
        (click)="close()">
      </div>

      <div class="fixed inset-0 z-[101] flex items-start justify-center pt-16 sm:pt-28 pointer-events-none px-4">
        
        <div 
          class="bg-white w-full max-w-3xl rounded-xl shadow-2xl ring-1 ring-slate-900/5 overflow-hidden pointer-events-auto flex flex-col max-h-[75vh] animate-in fade-in zoom-in-95 duration-200">
          
          <div class="flex flex-col border-b border-gray-100">
            <div class="flex items-center px-4 py-4 relative">
              <svg class="w-6 h-6 text-indigo-500 absolute left-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input 
                #searchInput
                type="text" 
                [(ngModel)]="searchQuery"
                (ngModelChange)="onSearchInput($event)"
                placeholder="Search inventory, orders, customers..." 
                class="w-full pl-12 pr-12 text-xl text-slate-800 placeholder:text-slate-400 border-none focus:ring-0 focus:outline-none bg-transparent h-10 font-medium"
                autocomplete="off">
              
              <div *ngIf="isLoading" class="absolute right-6">
                <svg class="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              
              <div *ngIf="!isLoading" class="hidden sm:flex absolute right-6">
                <kbd class="hidden sm:inline-block border border-gray-200 rounded px-2 py-0.5 text-xs font-medium text-gray-400 bg-gray-50">ESC</kbd>
              </div>
            </div>

            <div class="flex items-center gap-2 px-5 pb-3 overflow-x-auto no-scrollbar">
              <button 
                *ngFor="let filter of filters"
                (click)="setFilter(filter.id)"
                [class.bg-indigo-600]="activeFilter === filter.id"
                [class.text-white]="activeFilter === filter.id"
                [class.bg-slate-100]="activeFilter !== filter.id"
                [class.text-slate-600]="activeFilter !== filter.id"
                class="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap hover:bg-indigo-500 hover:text-white">
                {{ filter.label }}
              </button>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto scroll-smooth bg-slate-50/50">
            
            <div *ngIf="searchQuery && groupedResults.length === 0 && !isLoading" class="py-16 text-center">
              <div class="bg-white p-4 rounded-full shadow-sm w-16 h-16 mx-auto flex items-center justify-center mb-4">
                <svg class="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 class="text-slate-900 font-medium text-lg">No results found</h3>
              <p class="text-slate-500 text-sm mt-1">We couldn't find anything for "{{searchQuery}}".</p>
            </div>

            <div *ngFor="let group of groupedResults" class="pb-2">
              <h3 class="sticky top-0 z-10 bg-slate-50/95 backdrop-blur px-5 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-gray-100/50">
                {{ group.category }}
              </h3>
              
              <ul class="px-3 pt-2">
                <li *ngFor="let item of group.items" class="mb-1">
                  <button 
                    (click)="selectResult(item)"
                    [id]="'result-' + item.id"
                    [class.bg-white]="!isActive(item)"
                    [class.bg-indigo-600]="isActive(item)"
                    [class.shadow-sm]="!isActive(item)"
                    [class.shadow-md]="isActive(item)"
                    class="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group text-left border border-transparent"
                    [ngClass]="isActive(item) ? 'border-indigo-500 scale-[1.01]' : 'border-gray-100 hover:border-gray-200'">
                    
                    <div class="shrink-0 relative">
                       <img *ngIf="item.image" [src]="item.image" class="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-gray-200">
                       
                       <div *ngIf="!item.image" 
                         [class.text-indigo-600]="!isActive(item)"
                         [class.bg-indigo-50]="!isActive(item)"
                         [class.text-white]="isActive(item)"
                         class="w-10 h-10 rounded-lg flex items-center justify-center transition-colors">
                         <ng-container [ngSwitch]="item.type">
                           <svg *ngSwitchCase="'products'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                           <svg *ngSwitchCase="'orders'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                           <svg *ngSwitchCase="'customers'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                           <svg *ngSwitchDefault class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                         </ng-container>
                       </div>
                    </div>

                    <div class="flex-1 min-w-0">
                      <div class="flex items-center justify-between">
                        <span 
                          [class.text-white]="isActive(item)"
                          [class.text-slate-900]="!isActive(item)"
                          class="font-semibold text-base truncate" 
                          [innerHTML]="highlightText(item.title, searchQuery, isActive(item))">
                        </span>
                        
                        <span *ngIf="item.meta" 
                          [class.text-indigo-200]="isActive(item)"
                          [class.text-slate-500]="!isActive(item)"
                          class="text-xs font-mono">
                          {{ item.meta }}
                        </span>
                      </div>
                      
                      <div class="flex items-center gap-2 mt-0.5">
                        <span 
                          [class.text-indigo-100]="isActive(item)"
                          [class.text-slate-500]="!isActive(item)"
                          class="text-sm truncate">
                          {{ item.subtitle }}
                        </span>
                        
                        <span *ngIf="item.statusLabel"
                          [ngClass]="{
                            'bg-green-100 text-green-700': item.status === 'success' && !isActive(item),
                            'bg-yellow-100 text-yellow-800': item.status === 'warning' && !isActive(item),
                            'bg-red-100 text-red-700': item.status === 'danger' && !isActive(item),
                            'bg-gray-100 text-gray-600': item.status === 'neutral' && !isActive(item),
                            'bg-white/20 text-white': isActive(item)
                          }"
                          class="text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wide">
                          {{ item.statusLabel }}
                        </span>
                      </div>
                    </div>

                    <div *ngIf="isActive(item)" class="hidden sm:block">
                      <svg class="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </div>

                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div class="bg-gray-50 border-t border-gray-100 px-5 py-3 flex items-center justify-between text-xs text-gray-500">
            <div class="flex gap-4">
              <span><kbd class="font-sans font-semibold bg-white border border-gray-200 rounded px-1.5 shadow-sm">Enter</kbd> to select</span>
              <span><kbd class="font-sans font-semibold bg-white border border-gray-200 rounded px-1.5 shadow-sm">↑↓</kbd> to navigate</span>
            </div>
            <div>
              <span *ngIf="groupedResults.length > 0" class="text-gray-400">{{ flatResults.length }} results found</span>
            </div>
          </div>

        </div>
      </div>
    </ng-container>
  `
})
export class SearchModalComponent implements OnInit {
  @ViewChild('searchInput') searchInput!: ElementRef;

  searchQuery = '';
  isLoading = false;
  
  // Filtering Logic
  activeFilter: SearchCategory = 'all';
  filters: { id: SearchCategory; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'products', label: 'Products' },
    { id: 'orders', label: 'Orders' },
    { id: 'customers', label: 'Customers' },
    { id: 'pages', label: 'Navigation' },
  ];

  recentSearches: SearchResult[] = [];
  flatResults: SearchResult[] = [];
  groupedResults: { category: string, items: SearchResult[] }[] = [];
  
  selectedIndex = 0;
  private searchSubject = new Subject<string>();

  constructor(
    public searchService: SearchService,
    private router: Router
  ) {}

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

    this.searchService.isOpen$.subscribe((isOpen: any) => {
      if (isOpen) {
        this.recentSearches = this.searchService.getRecentSearches();
        this.searchQuery = '';
        this.activeFilter = 'all'; // Reset filter on open
        this.selectedIndex = 0;
        this.groupedResults = [];
        setTimeout(() => this.searchInput?.nativeElement.focus(), 50);
      }
    });
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
    // Check if modal is open via service logic in real app
    // Assuming we have a flag here or check isOpen$
    
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      this.searchService.toggle();
    }

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
    this.searchService.close();
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
    if(item) {
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
    const highlightClass = isActive 
      ? 'text-indigo-600 bg-white font-bold px-0.5 rounded-sm' // Inverse highlight on active
      : 'text-indigo-600 bg-indigo-50 font-bold px-0.5 rounded-sm';
      
    return text.replace(regex, `<span class="${highlightClass}">$1</span>`);
  }
}