import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { LucideAngularModule, UsersRound, UserPlus, UserPen, Receipt, FilePlus, FilePen } from 'lucide-angular';
import { TabCardComponent, TabItem } from '../../../layouts/UI/tab-card/tab-card.component';


@Component({
    selector: 'app-delivery-adapter',
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
export class DeliveryAdapterComponent {

    activeTab = signal<string>('delivery');
    isLoading = signal<boolean>(false);

    navigationTabs: TabItem[] = [
        { id: 'delivery', label: 'All Deliveries', icon: Receipt },
        { id: 'todo', label: 'toDay Delivery', icon: FilePlus },
    ];

    constructor(
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.router.events.subscribe(() => {
            const currentUrl = this.router.url;
            if (currentUrl.includes('/delivery/edit')) {
                this.activeTab.set('edit');
            } else if (currentUrl.includes('/delivery/todo')) {
                this.activeTab.set('todo');
            } else {
                this.activeTab.set('invoice');
            }
        });
    }

    onTabChange(newTabId: string) {
        // Simulate API network delay for better UX feel
        this.isLoading.set(true);
        if (newTabId === 'invoice') {
            this.router.navigate(['./'], { relativeTo: this.route });
        } else if (newTabId === 'create') {
            this.router.navigate(['create'], { relativeTo: this.route });
        } else if (newTabId === 'edit') {
            this.router.navigate(['edit'], { relativeTo: this.route });
        }
    }
}
