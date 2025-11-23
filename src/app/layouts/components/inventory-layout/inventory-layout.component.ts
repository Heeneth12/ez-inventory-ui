import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { RouterModule, ɵEmptyOutletComponent } from "@angular/router";
import { DrawerComponent } from "../drawer/drawer.component";
import { ToastComponent } from "../toast/toast.component";
import { ModalComponent } from "../modal/modal.component";
import { DrawerService } from '../drawer/drawerService';
import { UserComponent } from '../user/user.component';

@Component({
  selector: 'app-inventory-layout',
  standalone: true,
  imports: [CommonModule, ɵEmptyOutletComponent, RouterModule, DrawerComponent, ToastComponent, ModalComponent, UserComponent],
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
      iconPath: 'chart-bar.svg'
    },
    {
      label: 'Items',
      link: '/items',
      iconPath: 'squares-plus.svg',
      subItems: [
        { label: 'Items', link: '/items' },
        { label: 'Add Item', link: '/items/add' }
      ]
    },
    {
      label: 'Inventory',
      link: '/inventory',
      iconPath: 'home-modern.svg'


    },
    {
      label: 'Purchases',
      link: '/purchases',
      iconPath: 'shopping-cart.svg'
    },
    {
      label: 'Sales',
      link: '/sales',
      iconPath: 'truck.svg'
    },
    {
      label: 'Reports',
      link: '/reports',
      iconPath: 'document-chart-bar.svg'
    },
    {
      label: 'Documents',
      link: '/documents',
      iconPath: 'folder.svg'
    }
  ];


  constructor(private drawerService: DrawerService) {

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
}

export interface SubMenuItem {
  label: string;
  link: string;
}

export interface NavItem {
  label: string;
  iconPath: string;
  link?: string;
  subItems?: SubMenuItem[];
}

export interface UserProfile {
  name: string;
  role: string;
  initials: string;
}