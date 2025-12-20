import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { LucideAngularModule, Split, Truck } from 'lucide-angular';
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
        { id: 'delivery', label: 'All Deliveries', icon: Truck },
        { id: 'routes', label: 'Route Manifests', icon: Split },
    ];;

    constructor(
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.router.events.subscribe(() => {
            const currentUrl = this.router.url;
            if (currentUrl.includes('/delivery/routes')) {
                this.activeTab.set('routes');
            } else {
                this.activeTab.set('delivery');
            }
        });
    }

    onTabChange(newTabId: string) {
        this.isLoading.set(true);
        if (newTabId === 'delivery') {
            this.router.navigate(['./'], { relativeTo: this.route });
        } else if (newTabId === 'routes') {
            this.router.navigate(['routes'], { relativeTo: this.route });
        }
    }
}
