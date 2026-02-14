import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterModule, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { LucideAngularModule, UsersRound, FileText, PlusCircle, Pencil, FileType, FilePen } from 'lucide-angular';
import { TabCardComponent, TabItem } from "../../../layouts/UI/tab-card/tab-card.component";


@Component({
    selector: 'app-purchase-order-adapter',
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
export class PurchaseOrderAdapterComponent {

    activeTab = signal<string>('list');
    isLoading = signal<boolean>(false);

    navigationTabs: TabItem[] = [
        { id: 'list', label: 'Purchase Orders', icon: FileText },
        { id: 'create', label: 'Create PO', icon: FilePen },
        { id: 'edit', label: 'Edit PO', icon: Pencil }
    ];

    constructor(
        private router: Router,
        private route: ActivatedRoute
    ) {
        // Auto-detect active tab based on URL
        this.router.events.subscribe((event) => {
            if (!(event instanceof NavigationEnd)) return;
            const url = this.router.url;

            if (url.includes('/purchases/prq/create')) {
                this.activeTab.set('create');
            } else if (url.includes('/purchases/prq/edit')) {
                this.activeTab.set('edit');
            } else {
                this.activeTab.set('list');
            }
        });
    }

    onTabChange(newTabId: string) {
        this.isLoading.set(true);

        if (newTabId === 'list') {
            this.router.navigate(['./'], { relativeTo: this.route });
        } else if (newTabId === 'create') {
            this.router.navigate(['create'], { relativeTo: this.route });
        } else if (newTabId === 'edit') {
            // Default: no id → open empty edit page message or stay
            this.router.navigate(['edit', 0], { relativeTo: this.route });
        }

        setTimeout(() => this.isLoading.set(false), 200);
    }
}
