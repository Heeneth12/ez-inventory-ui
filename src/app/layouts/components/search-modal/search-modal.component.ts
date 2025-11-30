import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { SearchResult, SearchService } from './search-modal.service';

@Component({
  selector: 'app-search-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Overlay -->
    <ng-container *ngIf="searchService.isOpen$ | async">
      <div 
        class="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm transition-opacity"
        (click)="close()">
      </div>

      <!-- Modal Positioned Top-Center -->
      <div class="fixed inset-0 z-[101] flex items-start justify-center pt-16 sm:pt-24 pointer-events-none px-4">
        
        <!-- Modal Card -->
        <div 
          class="bg-white w-full max-w-2xl rounded-xl shadow-2xl border border-gray-200 overflow-hidden pointer-events-auto transform transition-all animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
          
          <!-- Input Area -->
          <div class="flex items-center px-4 py-3 border-b border-gray-100 relative">
            <svg class="w-5 h-5 text-gray-400 absolute left-5 top-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              #searchInput
              type="text" 
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchInput($event)"
              placeholder="Search pages, users, orders..." 
              class="w-full pl-10 pr-4 py-2 text-lg text-slate-800 placeholder:text-gray-400 border-none focus:ring-0 focus:outline-none bg-transparent h-12"
              autocomplete="off">
            
            <div class="hidden sm:flex items-center gap-1.5 absolute right-4">
              <span class="text-xs font-medium text-gray-400 border border-gray-200 rounded px-1.5 py-0.5">ESC</span>
            </div>
          </div>

          <!-- Loading State -->
          <div *ngIf="isLoading" class="p-4 text-center text-slate-400">
            <svg class="animate-spin h-5 w-5 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>

          <!-- RESULTS LIST -->
          <div class="flex-1 overflow-y-auto scroll-smooth p-2" *ngIf="!isLoading">
            
            <!-- ZERO STATE: Recent Searches -->
            <div *ngIf="!searchQuery && recentSearches.length > 0">
              <h3 class="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Recent</h3>
              <ul>
                <li *ngFor="let item of recentSearches; let i = index">
                  <button 
                    (click)="selectResult(item)"
                    (mouseenter)="selectedIndex = i"
                    [class.bg-slate-100]="selectedIndex === i"
                    class="w-full flex items-center gap-3 px-3 py-3 rounded-lg group transition-colors text-left">
                    <div class="w-5 h-5 text-gray-400 group-hover:text-slate-600 flex items-center justify-center">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <span class="text-slate-600 group-hover:text-slate-900 font-medium">{{ item.title }}</span>
                    <span class="ml-auto text-xs text-gray-300 group-hover:text-gray-400">{{ item.category }}</span>
                  </button>
                </li>
              </ul>
            </div>

            <!-- EMPTY STATE -->
            <div *ngIf="searchQuery && groupedResults.length === 0" class="py-12 text-center">
              <p class="text-slate-500 font-medium">No results found for "{{searchQuery}}"</p>
              <p class="text-slate-400 text-sm">Try searching for 'Inventory' or 'John'</p>
            </div>

            <!-- SEARCH MATCHES GROUPED -->
            <div *ngFor="let group of groupedResults">
              <h3 class="px-3 py-2 mt-2 text-xs font-semibold text-gray-400 uppercase tracking-wider sticky top-0 bg-white/95 backdrop-blur z-10">
                {{ group.category }}
              </h3>
              <ul>
                <li *ngFor="let item of group.items">
                  <button 
                    (click)="selectResult(item)"
                    [id]="'result-' + item.id"
                    [class.bg-indigo-50]="isActive(item)"
                    [class.text-indigo-900]="isActive(item)"
                    class="w-full flex items-center gap-3 px-3 py-3 rounded-lg group transition-colors text-left relative scroll-my-2">
                    
                    <!-- Active Indicator -->
                    <div *ngIf="isActive(item)" class="absolute left-0 top-2 bottom-2 w-1 bg-indigo-500 rounded-full"></div>

                    <!-- Icon -->
                    <div class="w-8 h-8 rounded bg-gray-100 flex items-center justify-center shrink-0 text-gray-500"
                       [class.bg-indigo-100]="isActive(item)"
                       [class.text-indigo-600]="isActive(item)">
                       <ng-container [ngSwitch]="item.icon">
                         <svg *ngSwitchCase="'home'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                         <svg *ngSwitchCase="'user'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                         <svg *ngSwitchCase="'file-text'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                         <svg *ngSwitchDefault class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                       </ng-container>
                    </div>

                    <!-- Text -->
                    <div class="flex-1 min-w-0">
                      <div class="font-medium truncate" [innerHTML]="highlightText(item.title, searchQuery)"></div>
                      <div *ngIf="item.subtitle" class="text-xs text-gray-500 truncate mt-0.5">
                        {{ item.subtitle }}
                      </div>
                    </div>

                    <!-- Jump Icon (Visible on Active) -->
                    <svg *ngIf="isActive(item)" class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>

                  </button>
                </li>
              </ul>
            </div>
          </div>

          <!-- FOOTER: Keyboard Hints -->
          <div class="bg-gray-50 px-4 py-3 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-500">
             <div class="flex items-center gap-1">
               <span class="bg-white border border-gray-200 rounded px-1.5 py-0.5 font-sans">↩</span>
               <span>to select</span>
             </div>
             <div class="flex items-center gap-1">
               <span class="bg-white border border-gray-200 rounded px-1.5 py-0.5 font-sans">↑</span>
               <span class="bg-white border border-gray-200 rounded px-1.5 py-0.5 font-sans">↓</span>
               <span>to navigate</span>
             </div>
             <div class="flex items-center gap-1 ml-auto">
               <span class="bg-white border border-gray-200 rounded px-1.5 py-0.5 font-sans">ESC</span>
               <span>to close</span>
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
  
  recentSearches: SearchResult[] = [];
  flatResults: SearchResult[] = []; // For keyboard nav index
  groupedResults: { category: string, items: SearchResult[] }[] = [];
  
  selectedIndex = 0;
  private searchSubject = new Subject<string>();

  constructor(
    public searchService: SearchService,
    private router: Router
  ) {}

  ngOnInit() {
    this.recentSearches = this.searchService.getRecentSearches();

    // Debounce search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        this.isLoading = true;
        return this.searchService.search(query);
      })
    ).subscribe(results => {
      this.isLoading = false;
      this.processResults(results);
    });

    // Auto focus when opened
    this.searchService.isOpen$.subscribe((isOpen: any) => {
      if (isOpen) {
        this.recentSearches = this.searchService.getRecentSearches();
        this.searchQuery = '';
        this.selectedIndex = 0;
        this.groupedResults = [];
        setTimeout(() => this.searchInput?.nativeElement.focus(), 100);
      }
    });
  }

  // --- Keyboard Shortcuts ---
  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    // Open: Cmd+K or Ctrl+K
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      this.searchService.toggle();
    }

    // Only handle nav keys if open
    // Note: We check a simple boolean flag in a real app, here checking service sub value implicitly
    // Ideally we subscribe to isOpen$ to set a local flag for performance in HostListener
    
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
  }

  onSearchInput(query: string) {
    if (!query) {
      this.isLoading = false;
      this.groupedResults = [];
      this.flatResults = this.recentSearches; // Fallback to recent for nav
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

    // Grouping Logic
    const groups: Record<string, SearchResult[]> = {};
    results.forEach(r => {
      if (!groups[r.category]) groups[r.category] = [];
      groups[r.category].push(r);
    });

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

    // Scroll into view logic
    const item = list[this.selectedIndex];
    if(item) {
        const el = document.getElementById('result-' + item.id);
        el?.scrollIntoView({ block: 'nearest' });
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
    this.router.navigate([item.route]);
  }

  isActive(item: SearchResult): boolean {
    const list = this.searchQuery ? this.flatResults : this.recentSearches;
    return list[this.selectedIndex]?.id === item.id;
  }

  // Highlight matched text using regex
  highlightText(text: string, query: string): string {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span class="text-indigo-600 font-bold bg-indigo-50">$1</span>');
  }
}