import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export type SearchCategory = 'all' | 'products' | 'orders' | 'customers' | 'pages';

export interface SearchResult {
  id: string | number;
  title: string;
  subtitle?: string;     // e.g. "SKU-123" or "john@example.com"
  category: string;      // Visual grouping header: "Pages", "Products"
  type: SearchCategory;  // Logic grouping for icons/filtering
  route: string | any[];
  
  // Rich UI Props
  image?: string;        
  status?: 'success' | 'warning' | 'danger' | 'neutral'; 
  statusLabel?: string;  
  meta?: string;         // e.g. "$1,200.00" or "Qty: 50"
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private isOpenSubject = new BehaviorSubject<boolean>(false);
  public isOpen$ = this.isOpenSubject.asObservable();
  private recentSearchesKey = 'ezh_recent_searches';

  // --- MOCK DATA: Rich Inventory Examples ---
  private mockData: SearchResult[] = [
    // 1. Pages
    { 
      id: 'p1', title: 'Dashboard', subtitle: 'Analytics & Overview', 
      category: 'Pages', type: 'pages', route: '/dashboard' 
    },
    { 
      id: 'p2', title: 'Inventory List', subtitle: 'Manage stock', 
      category: 'Pages', type: 'pages', route: '/inventory' 
    },
    { 
      id: 'p3', title: 'Settings', subtitle: 'System configuration', 
      category: 'Pages', type: 'pages', route: '/settings' 
    },

    // 2. Products (With Images & Stock Status)
    { 
      id: 'prod1', title: 'MacBook Pro 16"', subtitle: 'SKU: APP-MBP-16', 
      category: 'Products', type: 'products', route: '/inventory/products/1',
      status: 'success', statusLabel: 'In Stock', meta: 'Qty: 124',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?auto=format&fit=crop&w=100&q=80'
    },
    { 
      id: 'prod2', title: 'Wireless Mouse M1', subtitle: 'SKU: LOGI-M1', 
      category: 'Products', type: 'products', route: '/inventory/products/2',
      status: 'warning', statusLabel: 'Low Stock', meta: 'Qty: 5',
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=100&q=80'
    },
    { 
      id: 'prod3', title: 'Office Chair Ergonomic', subtitle: 'SKU: FURN-001', 
      category: 'Products', type: 'products', route: '/inventory/products/3',
      status: 'danger', statusLabel: 'Out of Stock', meta: 'Qty: 0'
    },

    // 3. Orders (With Status Colors & Value)
    { 
      id: 'ord1', title: 'Order #10234', subtitle: 'Acme Corp', 
      category: 'Orders', type: 'orders', route: '/orders/10234',
      status: 'success', statusLabel: 'Paid', meta: '$5,200.00'
    },
    { 
      id: 'ord2', title: 'Order #10235', subtitle: 'Global Logistics Inc', 
      category: 'Orders', type: 'orders', route: '/orders/10235',
      status: 'warning', statusLabel: 'Pending', meta: '$1,450.00'
    },

    // 4. Customers (With Avatars)
    { 
      id: 'u1', title: 'Sarah Connor', subtitle: 'sarah@skynet.com', 
      category: 'Customers', type: 'customers', route: '/customers/1',
      image: 'https://ui-avatars.com/api/?name=Sarah+Connor&background=0D8ABC&color=fff'
    },
    { 
      id: 'u2', title: 'John Wick', subtitle: 'babayaga@gmail.com', 
      category: 'Customers', type: 'customers', route: '/customers/2',
      image: 'https://ui-avatars.com/api/?name=John+Wick&background=333&color=fff'
    },
  ];

  constructor() {}

  // --- Visibility Control ---
  toggle() { this.isOpenSubject.next(!this.isOpenSubject.value); }
  open()   { this.isOpenSubject.next(true); }
  close()  { this.isOpenSubject.next(false); }

  // --- Search Logic ---
  search(query: string, filter: SearchCategory = 'all'): Observable<SearchResult[]> {
    const term = query.toLowerCase().trim();
    
    // 1. Filter by Text (Title or Subtitle)
    let results = this.mockData.filter(item => 
      item.title.toLowerCase().includes(term) || 
      (item.subtitle && item.subtitle.toLowerCase().includes(term))
    );

    // 2. Filter by Category Tab (if not 'all')
    if (filter !== 'all') {
      results = results.filter(item => item.type === filter);
    }

    // Return with slight delay to simulate API
    return of(results).pipe(delay(150));
  }

  // --- Recent Searches Persistence ---
  getRecentSearches(): SearchResult[] {
    const stored = localStorage.getItem(this.recentSearchesKey);
    return stored ? JSON.parse(stored) : [];
  }

  addRecentSearch(item: SearchResult) {
    let recent = this.getRecentSearches();
    // Remove if exists (to move to top)
    recent = recent.filter(r => r.id !== item.id);
    // Add to start
    recent.unshift(item);
    // Keep max 5
    recent = recent.slice(0, 5);
    localStorage.setItem(this.recentSearchesKey, JSON.stringify(recent));
  }
}