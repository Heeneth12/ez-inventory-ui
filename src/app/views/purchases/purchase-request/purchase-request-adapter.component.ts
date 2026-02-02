import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { FilePen, FileText, LucideAngularModule, Pencil } from 'lucide-angular';
import { TabCardComponent, TabItem } from '../../../layouts/UI/tab-card/tab-card.component';

@Component({
  selector: 'app-purchase-request-adapter',
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
export class PurchaseRequestAdapterComponent {

  activeTab = signal<string>('prq');
  isLoading = signal<boolean>(false);

  navigationTabs: TabItem[] = [
    { id: 'prq', label: 'Purchase Request', icon: FileText },
    { id: 'create', label: 'Create PRQ', icon: FilePen },
    { id: 'edit', label: 'Edit PRQ', icon: Pencil }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Auto-detect active tab based on URL
    this.router.events.subscribe((event) => {
      if (!(event instanceof NavigationEnd)) return;
      const url = this.router.url;

      if (url.includes('/purchases/order/create')) {
        this.activeTab.set('create');
      } else if (url.includes('/purchases/order/edit')) {
        this.activeTab.set('edit');
      } else {
        this.activeTab.set('prq');
      }
    });
  }

  onTabChange(newTabId: string) {
    this.isLoading.set(true);

    if (newTabId === 'prq') {
      this.router.navigate(['./'], { relativeTo: this.route });
    } else if (newTabId === 'create') {
      this.router.navigate(['create'], { relativeTo: this.route });
    } else if (newTabId === 'edit') {
      this.router.navigate(['edit', 0], { relativeTo: this.route });
    }

    setTimeout(() => this.isLoading.set(false), 200);
  }

}
