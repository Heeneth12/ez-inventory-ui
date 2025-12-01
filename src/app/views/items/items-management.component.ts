import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { TabCardComponent, TabItem } from '../../layouts/UI/tab-card/tab-card.component';
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { LucideAngularModule, UsersRound, UserPlus, UserPen, PackagePlus, Package2, PackageOpen} from 'lucide-angular';

@Component({
  selector: 'app-items-management',
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
export class ItemsManagementComponent {

  activeTab = signal<string>('item');
  isLoading = signal<boolean>(false);

  navigationTabs: TabItem[] = [
    { id: 'item', label: 'All Items', icon:  Package2},
    { id: 'create', label: 'Create Item', icon: PackagePlus },
    { id: 'edit', label: 'Edit Item', icon: PackageOpen }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.router.events.subscribe(() => {
      const currentUrl = this.router.url;
      if (currentUrl.includes('/item/edit')) {
        this.activeTab.set('edit');
      } else if (currentUrl.includes('/item/create')) {
        this.activeTab.set('create');
      } else {
        this.activeTab.set('item');
      }
    });
  }

  onTabChange(newTabId: string) {
    // Simulate API network delay for better UX feel
    this.isLoading.set(true);
    if (newTabId === 'item') {
      this.router.navigate(['./'], { relativeTo: this.route });
    } else if (newTabId === 'create') {
      this.router.navigate(['create'], { relativeTo: this.route });
    } else if (newTabId === 'edit') {
      this.router.navigate(['edit'], { relativeTo: this.route });
    }
  }
}
