import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterModule, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { LucideAngularModule, UsersRound, AppWindow, UserPenIcon } from 'lucide-angular';
import { filter } from 'rxjs/operators';
import { TabCardComponent, TabItem } from "../../layouts/UI/tab-card/tab-card.component";

@Component({
    selector: 'app-user-management-adapter',
    standalone: true,
    imports: [CommonModule, RouterModule, LucideAngularModule, TabCardComponent],
    template: `
    <div class="text-slate-800">
      <app-tab-card
        [tabs]="navigationTabs"
        [activeTabId]="activeTab()"
        (activeTabIdChange)="onTabChange($event)">
        <router-outlet></router-outlet>
      </app-tab-card>
    </div>
  `
})
export class UserManagementAdapterComponent implements OnInit {

    activeTab = signal<string>('users'); // Default to a valid tab ID
    isLoading = signal<boolean>(false);

    navigationTabs: TabItem[] = [
        //{ id: 'tenants', label: 'Tenants', icon: UsersRound },
        { id: 'users', label: 'Users', icon: UsersRound },
        { id: 'userForm', label: 'User Form', icon: UserPenIcon },
        //{ id: 'apps', label: 'Apps', icon: AppWindow },
    ];

    constructor(
        private router: Router,
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
        this.setActiveTabFromUrl();
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe(() => {
            this.setActiveTabFromUrl();
        });
    }

    private setActiveTabFromUrl() {
        const currentUrl = this.router.url;
        const foundTab = this.navigationTabs.find(tab => currentUrl.includes(`/${tab.id}`));

        if (foundTab) {
            this.activeTab.set(foundTab.id);
        } else {
            this.activeTab.set('tenants');
        }
    }

    onTabChange(newTabId: string) {
        this.isLoading.set(true);
        this.activeTab.set(newTabId);
        // Simple navigation relative to the current route
        // Since Tab ID == Route Path, we pass the ID directly
        this.router.navigate([newTabId], { relativeTo: this.route })
            .then(() => this.isLoading.set(false));
    }
}