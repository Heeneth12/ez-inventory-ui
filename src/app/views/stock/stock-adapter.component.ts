import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterModule, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LucideAngularModule, Package2, ScrollText, ClipboardPen } from 'lucide-angular';
import { TabCardComponent, TabItem } from "../../layouts/UI/tab-card/tab-card.component";

@Component({
  selector: 'app-stock-adapter',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, TabCardComponent],
  template: `
    <div class="text-slate-800">
      <app-tab-card
        [tabs]="navigationTabs"
        [(activeTabId)]="activeTab"
        (activeTabIdChange)="onTabChange($event)">
        <router-outlet></router-outlet>
      </app-tab-card>
    </div>
  `
})
export class StockAdapterComponent {

  activeTab = signal<string>('current');
  isLoading = signal<boolean>(false);

  navigationTabs: TabItem[] = [
    { id: 'current', label: 'Current Stock', icon: Package2 },
    { id: 'ledger', label: 'Stock Ledger', icon: ScrollText },
    { id: 'adjustment', label: 'Stock Adjustment', icon: ClipboardPen }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Subscribe to router events to keep the Tab UI in sync with the URL
    // (e.g. if user types url directly or hits back button)
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateActiveTabFromUrl();
    });

    // Initial check
    this.updateActiveTabFromUrl();
  }

  private updateActiveTabFromUrl() {
    const currentUrl = this.router.url;
    
    if (currentUrl.includes('/ledger')) {
      this.activeTab.set('ledger');
    } else if (currentUrl.includes('/adjustment')) {
      this.activeTab.set('adjustment');
    } else {
      // Default to 'current' for the base path (e.g. /stock)
      this.activeTab.set('current');
    }
  }

  onTabChange(newTabId: string) {
    this.isLoading.set(true);
    
    // Routing Logic based on relative paths
    if (newTabId === 'current') {
      this.router.navigate(['./'], { relativeTo: this.route });
    } else if (newTabId === 'ledger') {
      this.router.navigate(['ledger'], { relativeTo: this.route });
    } else if (newTabId === 'adjustment') {
      this.router.navigate(['adjustment'], { relativeTo: this.route });
    }
    
    // Optional: Reset loading state after short delay or via router event
    setTimeout(() => this.isLoading.set(false), 300);
  }
}