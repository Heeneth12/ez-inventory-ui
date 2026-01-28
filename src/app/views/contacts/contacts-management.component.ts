import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { TabCardComponent, TabItem } from '../../layouts/UI/tab-card/tab-card.component';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from "@angular/router";
import { LucideAngularModule, UsersRound, UserPlus, UserPen, UserRoundSearch } from 'lucide-angular';
import { filter } from 'rxjs';

@Component({
  selector: 'app-contacts-management',
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
export class ContactsManagementComponent {

  activeTab = signal<string>('contacts');
  isLoading = signal<boolean>(false);

  navigationTabs: TabItem[] = [
    { id: 'contacts', label: 'All Contacts', icon: UsersRound },
    { id: 'create', label: 'Create Contacts', icon: UserPlus },
    { id: 'network', label: 'Network', icon: UserRoundSearch }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.syncTabWithRoute();
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.syncTabWithRoute();
      });
  }

  private syncTabWithRoute() {
    const url = this.router.url;
    if (url.includes('/contacts/create')) {
      this.activeTab.set('create');
    } else if (url.includes('/contacts/network')) {
      this.activeTab.set('network');
    } else {
      this.activeTab.set('contacts');
    }
  }


  onTabChange(newTabId: string) {
    this.isLoading.set(true);
    if (newTabId === 'contacts') {
      this.router.navigate(['./'], { relativeTo: this.route });
    } else if (newTabId === 'create') {
      this.router.navigate(['create'], { relativeTo: this.route });
    } else if (newTabId === 'network') {
      this.router.navigate(['network'], { relativeTo: this.route });
    }
  }
}
