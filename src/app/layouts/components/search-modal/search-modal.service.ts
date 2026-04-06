import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, forkJoin } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { ItemService } from '../../../views/items/item.service';
import { SalesOrderService } from '../../../views/sales/sales-order/sales-order.service';
import { InvoiceService } from '../../../views/sales/invoices/invoice.service';
import { UserManagementService } from '../../../views/user-management/userManagement.service';

export type SearchCategory = 'all' | 'products' | 'orders' | 'customers' | 'invoices';

export interface SearchResult {
  id: string | number;
  title: string;
  subtitle?: string;
  category: string;
  type: SearchCategory;
  route: string | any[];
  image?: string;        
  status?: 'success' | 'warning' | 'danger' | 'neutral'; 
  statusLabel?: string;  
  meta?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private isOpenSubject = new BehaviorSubject<boolean>(false);
  public isOpen$ = this.isOpenSubject.asObservable();
  private recentSearchesKey = 'ezh_recent_searches';

  private mockPages: SearchResult[] = [
    { id: 'p1', title: 'Dashboard', subtitle: 'Analytics & Overview', category: 'Pages', type: 'all', route: '/dashboard' },
    { id: 'p2', title: 'Inventory List', subtitle: 'Manage stock', category: 'Pages', type: 'all', route: '/inventory' },
    { id: 'p3', title: 'Settings', subtitle: 'System configuration', category: 'Pages', type: 'all', route: '/settings' },
  ];

  constructor(
    private itemService: ItemService,
    private salesOrderService: SalesOrderService,
    private invoiceService: InvoiceService,
    private userService: UserManagementService
  ) {}

  // --- Visibility Control (Legacy, can be kept for compatibility) ---
  toggle() { this.isOpenSubject.next(!this.isOpenSubject.value); }
  open()   { this.isOpenSubject.next(true); }
  close()  { this.isOpenSubject.next(false); }

  private searchItemsApi(term: string): Observable<SearchResult[]> {
    return new Observable(observer => {
      this.itemService.searchItems({ searchQuery: term, name: term }, (res: any) => {
        const data = res?.data || [];
        const results = data.map((d: any) => ({
          id: 'prod_' + d.id,
          title: d.name,
          subtitle: d.sku || d.hsnSacCode || 'Item',
          category: 'Products',
          type: 'products' as SearchCategory,
          route: `/items/view/${d.id}`,
          status: d.active ? 'success' : 'neutral',
          statusLabel: d.active ? 'Active' : 'Inactive',
          meta: '₹' + (d.sellingPrice || 0)
        }));
        observer.next(results);
        observer.complete();
      }, () => {
         observer.next([]);
         observer.complete();
      });
    });
  }

  private searchSalesOrdersApi(term: string): Observable<SearchResult[]> {
    return new Observable(observer => {
      this.salesOrderService.searchSalesOrders({ soNumber: term, searchQuery: term }, (res: any) => {
        const data = res?.data || [];
        const results = data.map((d: any) => ({
          id: 'so_' + d.id,
          title: 'SO: ' + d.soNumber,
          subtitle: 'Orders',
          category: 'Orders',
          type: 'orders' as SearchCategory,
          route: `/sales/order`, // Routing assumes global list or specific view if known
          status: d.status === 'CONFIRMED' ? 'success' : 'warning',
          statusLabel: d.status,
          meta: '₹' + (d.grandTotal || 0)
        }));
        observer.next(results);
        observer.complete();
      }, () => {
         observer.next([]);
         observer.complete();
      });
    });
  }

  private searchInvoicesApi(term: string): Observable<SearchResult[]> {
    return new Observable(observer => {
      this.invoiceService.searchInvoices({ invNumber: term, searchQuery: term }, (res: any) => {
        const data = res?.data || [];
        const results = data.map((d: any) => ({
          id: 'inv_' + d.id,
          title: 'INV: ' + d.invoiceNumber,
          subtitle: 'Invoice',
          category: 'Invoices',
          type: 'invoices' as SearchCategory,
          route: `/sales/invoice`, 
          status: d.status === 'PAID' ? 'success' : 'neutral',
          statusLabel: d.status,
          meta: '₹' + (d.grandTotal || 0)
        }));
        observer.next(results);
        observer.complete();
      }, () => {
         observer.next([]);
         observer.complete();
      });
    });
  }

  private searchUsersApi(term: string): Observable<SearchResult[]> {
    return new Observable(observer => {
      this.userService.searchUsers({ searchQuery: term }, (res: any) => {
        const data = res?.data || [];
        const results = data.map((d: any) => ({
          id: 'user_' + d.id,
          title: d.fullName || d.name || 'User',
          subtitle: d.email || d.phone || 'Customer',
          category: 'Customers',
          type: 'customers' as SearchCategory,
          route: `/admin/users`, 
          image: `https://ui-avatars.com/api/?name=${encodeURIComponent(d.fullName || d.name || 'U')}&background=0D8ABC&color=fff`
        }));
        observer.next(results);
        observer.complete();
      }, () => {
         observer.next([]);
         observer.complete();
      });
    });
  }

  // --- Search Logic ---
  search(query: string, filter: SearchCategory = 'all'): Observable<SearchResult[]> {
    const term = query.toLowerCase().trim();
    if (!term) return of([]);

    const observables: Observable<SearchResult[]>[] = [];

    if (filter === 'all' || filter === 'products') {
      observables.push(this.searchItemsApi(term));
    }
    if (filter === 'all' || filter === 'orders') {
      observables.push(this.searchSalesOrdersApi(term));
    }
    if (filter === 'all' || filter === 'invoices') {
      observables.push(this.searchInvoicesApi(term));
    }
    if (filter === 'all' || filter === 'customers') {
      observables.push(this.searchUsersApi(term));
    }

    if (observables.length === 0) return of([]);

    return forkJoin(observables).pipe(
      map(resultsArray => {
        let combined: SearchResult[] = [];
        resultsArray.forEach(res => combined = combined.concat(res));

        // Add mock pages if matching in 'all' search
        if (filter === 'all') {
           const pagesMatches = this.mockPages.filter(p => p.title.toLowerCase().includes(term));
           combined = combined.concat(pagesMatches);
        }

        return combined;
      })
    );
  }

  // --- Recent Searches Persistence ---
  getRecentSearches(): SearchResult[] {
    const stored = localStorage.getItem(this.recentSearchesKey);
    return stored ? JSON.parse(stored) : [];
  }

  addRecentSearch(item: SearchResult) {
    let recent = this.getRecentSearches();
    recent = recent.filter(r => r.id !== item.id);
    recent.unshift(item);
    recent = recent.slice(0, 5);
    localStorage.setItem(this.recentSearchesKey, JSON.stringify(recent));
  }
}