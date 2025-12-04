import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { LucideAngularModule, UsersRound, UserPlus, UserPen } from 'lucide-angular';
import { TabCardComponent, TabItem } from "../../layouts/UI/tab-card/tab-card.component";


@Component({
    selector: 'app-user-management-adapter',
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
export class UserManagementAdapterComponent {

    activeTab = signal<string>('userManagement');
    isLoading = signal<boolean>(false);

    navigationTabs: TabItem[] = [
        { id: 'userManagement', label: 'User Management', icon: UsersRound },
        { id: 'create', label: 'Create User', icon: UserPlus },
        { id: 'edit', label: 'Edit User', icon: UserPen }
    ];

    constructor(
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.router.events.subscribe(() => {
            const currentUrl = this.router.url;
            if (currentUrl.includes('/user-management/edit')) {
                this.activeTab.set('edit');
            } else if (currentUrl.includes('/user-management/create')) {
                this.activeTab.set('create');
            } else {
                this.activeTab.set('userManagement');
            }
        });
    }

    onTabChange(newTabId: string) {
        // Simulate API network delay for better UX feel
        this.isLoading.set(true);
        if (newTabId === 'userManagement') {
            this.router.navigate(['./'], { relativeTo: this.route });
        } else if (newTabId === 'create') {
            this.router.navigate(['create'], { relativeTo: this.route });
        } else if (newTabId === 'edit') {
            this.router.navigate(['edit'], { relativeTo: this.route });
        }
    }
}
