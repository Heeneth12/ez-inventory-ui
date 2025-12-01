import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild } from '@angular/core';
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

@Component({
  selector: 'app-inventory-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, DrawerComponent, ToastComponent, ModalComponent, UserComponent, LucideAngularModule, SearchModalComponent],
  templateUrl: './inventory-layout.component.html',
  styleUrl: './inventory-layout.component.css'
})
export class InventoryLayoutComponent {

  isMobileMenuOpen = false;
  openDropdownIndex: number | null = null;
  @ViewChild('userProfileTemplate') userProfileTemplate!: TemplateRef<any>;

  user: UserProfile = {
    name: 'Adam Driver',
    role: 'Fleet Manager',
    initials: 'AD'
  };

  navItems: NavItem[] = [
    {
      label: 'Dashboard',
      link: '/dashboard',
      icon: LayoutDashboard
    },
    {
      label: 'Items',
      link: '/items',
      icon: PackagePlus,
    },
    {
      label: 'Inventory',
      link: '/inventory',
      icon: Warehouse
    },
    {
      label: 'Purchases',
      link: '/purchases',
      icon: ShoppingCart
    },
    {
      label: 'Sales',
      link: '/sales',
      icon: Truck,
      subItems: [
        { label: 'Sales Order', link: '/sales/order' },
        { label: 'Add Sale', link: '/sales/add' }
      ]
    },
    {
      label: 'Contacts',
      link: '/contacts',
      icon: Users
    },
    {
      label: 'Employees',
      link: '/employee',
      icon: CircleUser
    },
    {
      label: 'Reports',
      link: '/reports',
      icon: FileChartColumn
    },
    {
      label: 'Documents',
      link: '/documents',
      icon: Folder
    },
    {
      label: 'Settings',
      link: '/settings',
      icon: Settings
    }
  ];

  constructor(
    private drawerService: DrawerService,
    private searchService: SearchService
  ) { }

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
  subItems?: SubMenuItem[];
}

export interface UserProfile {
  name: string;
  role: string;
  initials: string;
}