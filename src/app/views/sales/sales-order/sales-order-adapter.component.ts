import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { LucideAngularModule, UsersRound, UserPlus, UserPen } from 'lucide-angular';
import { TabCardComponent, TabItem } from '../../../layouts/UI/tab-card/tab-card.component';


@Component({
    selector: 'app-sales-order-adapter',
    standalone: true,
    imports: [CommonModule, TabCardComponent, RouterModule, LucideAngularModule],
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
export class SalesOrderAdapterComponent {

    activeTab = signal<string>('salesOrder');
    isLoading = signal<boolean>(false);

    navigationTabs: TabItem[] = [
        { id: 'salesOrder', label: 'All Sales order', icon: UsersRound },
        { id: 'create', label: 'Create Sales order', icon: UserPlus },
        { id: 'edit', label: 'Edit Sales order', icon: UserPen }
    ];

    constructor(
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.router.events.subscribe(() => {
            const currentUrl = this.router.url;
            if (currentUrl.includes('/order/edit')) {
                this.activeTab.set('edit');
            } else if (currentUrl.includes('/order/create')) {
                this.activeTab.set('create');
            } else {
                this.activeTab.set('salesOrder');
            }
        });
    }

    onTabChange(newTabId: string) {
        // Simulate API network delay for better UX feel
        this.isLoading.set(true);
        if (newTabId === 'salesOrder') {
            this.router.navigate(['./'], { relativeTo: this.route });
        } else if (newTabId === 'create') {
            this.router.navigate(['create'], { relativeTo: this.route });
        } else if (newTabId === 'edit') {
            this.router.navigate(['edit'], { relativeTo: this.route });
        }
    }
}
