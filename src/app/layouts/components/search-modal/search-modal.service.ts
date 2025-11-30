import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

export interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  category: 'Pages' | 'Users' | 'Orders' | 'Inventory';
  route: string;
  icon?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private isOpenSubject = new BehaviorSubject<boolean>(false);
  public isOpen$ = this.isOpenSubject.asObservable();

  private recentSearchesKey = 'stampede_recent_searches';

  // Mock Data Index
  private mockData: SearchResult[] = [
    // Pages
    { id: 'p1', title: 'Dashboard', category: 'Pages', route: '/dashboard', icon: 'home' },
    { id: 'p2', title: 'Inventory', category: 'Pages', route: '/inventory', icon: 'box' },
    { id: 'p3', title: 'User Management', category: 'Pages', route: '/users', icon: 'users' },
    { id: 'p4', title: 'Settings', category: 'Pages', route: '/settings', icon: 'settings' },
    
    // Users
    { id: 'u1', title: 'John Doe', subtitle: 'Fleet Manager', category: 'Users', route: '/users/7', icon: 'user' },
    { id: 'u2', title: 'Jane Smith', subtitle: 'Administrator', category: 'Users', route: '/users/8', icon: 'user' },
    
    // Orders
    { id: 'o1', title: 'PO-2023-001', subtitle: 'Acme Corp - $5,000', category: 'Orders', route: '/inventory/orders/1', icon: 'file-text' },
    { id: 'o2', title: 'PO-2023-002', subtitle: 'Global Supplies - Pending', category: 'Orders', route: '/inventory/orders/2', icon: 'file-text' },
  ];

  constructor() {}

  toggle() {
    this.isOpenSubject.next(!this.isOpenSubject.value);
  }

  open() {
    this.isOpenSubject.next(true);
  }

  close() {
    this.isOpenSubject.next(false);
  }

  search(query: string): Observable<SearchResult[]> {
    const term = query.toLowerCase();
    
    // Simulate API latency
    return of(this.mockData.filter(item => 
      item.title.toLowerCase().includes(term) || 
      (item.subtitle && item.subtitle.toLowerCase().includes(term))
    )).pipe(delay(200));
  }

  getRecentSearches(): SearchResult[] {
    const stored = localStorage.getItem(this.recentSearchesKey);
    return stored ? JSON.parse(stored) : [];
  }

  addRecentSearch(item: SearchResult) {
    let recent = this.getRecentSearches();
    // Remove duplicates
    recent = recent.filter(r => r.id !== item.id);
    // Add to top
    recent.unshift(item);
    // Limit to 5
    recent = recent.slice(0, 5);
    localStorage.setItem(this.recentSearchesKey, JSON.stringify(recent));
  }
}