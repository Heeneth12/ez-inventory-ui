import { CommonModule } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { RouterModule, ɵEmptyOutletComponent } from "@angular/router";
import { DrawerComponent } from "../drawer/drawer.component";
import { ToastComponent } from "../toast/toast.component";
import { ModalComponent } from "../modal/modal.component";
import { DrawerService } from '../drawer/drawerService';
import { UserComponent } from '../user/user.component';
import { SearchService } from '../search-modal/search-modal.service';
import { SearchModalComponent } from "../search-modal/search-modal.component";
import {
  LucideAngularModule,
  LayoutDashboard,
  PackagePlus,
  Warehouse,
  ShoppingCart,
  Truck,
  Users,
  CircleUser,
  FileChartColumn,
  Folder,
  Settings
} from 'lucide-angular';
import { AuthService } from '../../guards/auth.service';
import { LoaderComponent } from "../loader/loader.component";

@Component({
  selector: 'app-inventory-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, DrawerComponent, ToastComponent, ModalComponent, UserComponent, LucideAngularModule, SearchModalComponent, LoaderComponent],
  templateUrl: './inventory-layout.component.html',
  styleUrl: './inventory-layout.component.css'
})
export class InventoryLayoutComponent implements OnInit {

  isMobileMenuOpen = false;
  openDropdownIndex: number | null = null;
  @ViewChild('userProfileTemplate') userProfileTemplate!: TemplateRef<any>;

  user: UserProfile = {
    name: 'Adam Driver',
    role: 'Fleet Manager',
    initials: 'AD'
  };

  visibleNavItems: NavItem[] = [];

  allNavItems: NavItem[] = [
    {
      label: 'Dashboard',
      link: '/dashboard',
      icon: LayoutDashboard,
      moduleKey: 'EZH_INV_DASHBOARD'
    },
    {
      label: 'Items',
      link: '/items',
      icon: PackagePlus,
      moduleKey: 'EZH_INV_ITEMS'
    },
    {
      label: 'Stock', // Stock in your routes
      link: '/stock',
      icon: Warehouse,
      moduleKey: 'EZH_INV_STOCK'
    },
    {
      label: 'Purchases',
      link: '/purchases',
      icon: ShoppingCart,
      moduleKey: 'EZH_INV_PURCHASES',
      subItems: [
        { label: 'Purchase Order', link: '/purchases/order' },
        { label: 'Goods Receipt (GRN)', link: '/purchases/grn' },
        { label: 'Purchase Return', link: '/purchases/return' },
      ]
    },
    {
      label: 'Sales',
      link: '/sales',
      icon: Truck,
      moduleKey: 'EZH_INV_SALES',
      subItems: [
        { label: 'Sales Order', link: '/sales/order' },
        { label: 'Invoices', link: '/sales/invoices' },
      ]
    },
    {
      label: 'Contacts',
      link: '/contacts',
      icon: Users,
      moduleKey: 'EZH_INV_CONTACTS'
    },
    {
      label: 'Employees',
      link: '/employee',
      icon: CircleUser,
      moduleKey: 'EZH_INV_EMPLOYEE'
    },
    {
      label: 'Reports',
      link: '/reports',
      icon: FileChartColumn,
      moduleKey: 'EZH_INV_REPORTS'
    },
    {
      label: 'Documents',
      link: '/documents',
      icon: Folder,
      moduleKey: 'EZH_INV_DOCUMENTS'
    },
    {
      label: 'Settings',
      link: '/settings',
      icon: Settings,
      moduleKey: 'EZH_INV_SETTINGS'
    }
  ];

  constructor(
    private drawerService: DrawerService,
    private searchService: SearchService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    // Subscribe to user changes to update menu dynamically
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.filterNavItems(user);

        // Update local user profile data for display
        this.user = {
          name: user.fullName,
          role: user.userRoles[0] || 'User', // Taking first role as display
          initials: this.getInitials(user.fullName)
        };
      }
    });
  }

  filterNavItems(user: any) {
    this.visibleNavItems = this.allNavItems.filter(item => {
      // If item has no moduleKey, it's public/always visible
      if (!item.moduleKey) return true;

      // Check against the user's applications
      return user.userApplications?.some((app: any) =>
        app.modulePrivileges && item.moduleKey && app.modulePrivileges[item.moduleKey]
      );
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  toggleUserMenu() {
    this.drawerService.open(this.userProfileTemplate, "User Profile");
  }

  toggleMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMenu() {
    this.isMobileMenuOpen = false;
  }

  toggleDropdown(index: number) {
    if (this.openDropdownIndex === index) {
      this.openDropdownIndex = null;
    } else {
      this.openDropdownIndex = index;
    }
  }

  isDropdownOpen(index: number): boolean {
    return this.openDropdownIndex === index;
  }

  openSmartSearch() {
    this.searchService.open();
  }
}

export interface SubMenuItem {
  label: string;
  link: string;
}

export interface NavItem {
  label: string;
  icon: any;
  link?: string;
  moduleKey?: string;
  subItems?: SubMenuItem[];
}

export interface UserProfile {
  name: string;
  role: string;
  initials: string;
}