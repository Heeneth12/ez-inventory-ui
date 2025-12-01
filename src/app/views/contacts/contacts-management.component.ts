import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { TabCardComponent, TabItem } from '../../layouts/UI/tab-card/tab-card.component';
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { LucideAngularModule, UsersRound, UserPlus, UserPen } from 'lucide-angular';

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
    { id: 'edit', label: 'Edit Contacts', icon: UserPen }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.router.events.subscribe(() => {
      const currentUrl = this.router.url;
      if (currentUrl.includes('/contacts/edit')) {
        this.activeTab.set('edit');
      } else if (currentUrl.includes('/contacts/create')) {
        this.activeTab.set('create');
      } else {
        this.activeTab.set('contacts');
      }
    });
  }

  onTabChange(newTabId: string) {
    // Simulate API network delay for better UX feel
    this.isLoading.set(true);
    if (newTabId === 'contacts') {
      this.router.navigate(['./'], { relativeTo: this.route });
    } else if (newTabId === 'create') {
      this.router.navigate(['create'], { relativeTo: this.route });
    } else if (newTabId === 'edit') {
      this.router.navigate(['edit'], { relativeTo: this.route });
    }
  }
}
