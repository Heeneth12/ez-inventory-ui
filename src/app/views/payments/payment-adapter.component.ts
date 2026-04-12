import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { LucideAngularModule, Receipt, Wallet, FileText } from 'lucide-angular';
import { TabCardComponent, TabItem } from '../../layouts/UI/tab-card/tab-card.component';


@Component({
    selector: 'app-invoice-adapter',
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
export class PaymentAdapterComponent {

    activeTab = signal<string>('payments');
    isLoading = signal<boolean>(false);

    navigationTabs: TabItem[] = [
        { id: 'payments', label: 'All Payments', icon: Receipt },
        { id: 'advance', label: 'Advance', icon: Wallet },
        { id: 'credit-note', label: 'Credit Notes', icon: FileText },
    ];

    constructor(
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.router.events.subscribe(() => {
            const currentUrl = this.router.url;
            if (currentUrl.includes('/payments/advance')) {
                this.activeTab.set('advance');
            } else if (currentUrl.includes('/payments/credit-note')) {
                this.activeTab.set('credit-note');
            } else {
                this.activeTab.set('payments');
            }
        });
    }

    onTabChange(newTabId: string) {
        this.isLoading.set(true);
        if (newTabId === 'payments') {
            this.router.navigate(['./'], { relativeTo: this.route });
        } else if (newTabId === 'advance') {
            this.router.navigate(['advance'], { relativeTo: this.route });
        } else if (newTabId === 'credit-note') {
            this.router.navigate(['credit-note'], { relativeTo: this.route });
        }
    }
}
