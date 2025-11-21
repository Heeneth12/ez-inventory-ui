import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule, ɵEmptyOutletComponent } from "@angular/router";
import { DrawerComponent } from "../drawer/drawer.component";
import { ToastComponent } from "../toast/toast.component";
import { ModalComponent } from "../modal/modal.component";

@Component({
  selector: 'app-inventory-layout',
  standalone: true,
  imports: [CommonModule, ɵEmptyOutletComponent, RouterModule, DrawerComponent, ToastComponent, ModalComponent],
  templateUrl: './inventory-layout.component.html',
  styleUrl: './inventory-layout.component.css'
})
export class InventoryLayoutComponent {
  isMobileMenuOpen = false;

  user: UserProfile = {
    name: 'Adam Driver',
    role: 'Fleet Manager',
    initials: 'AD'
  };

  navItems: NavItem[] = [
    {
      label: 'Dashboard',
      link: '/dashboard',
      iconPath: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z'
    },
    {
      label: 'Products',
      link: '/products',
      iconPath: 'M20 13V7a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 004 7v6a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4a2 2 0 001-1.73zM12 3.27L18.74 7 12 10.73 5.26 7 12 3.27zM5 9.55l6.76 3.89v6.22L5 15.77v-6.22zm13 6.22l-6.76 3.89v-6.22L18 9.55v6.22z'
      
    },
    {
      label: 'Inventory',
      iconPath: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      subItems: [
        { label: 'Warehouse', link: '/inventory/warehouse' },
        { label: 'Purchase Orders', link: '/inventory/purchase-orders' },
        { label: 'Receive Order', link: '/inventory/receive' }
      ]
    },
    {
      label: 'Reports',
      link: '/reports',
      iconPath: 'M9 17v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0-10V5a2 2 0 00-2-2H5a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2zm10 10v-4a2 2 0 00-2-2h-2a2 2 0 00-2 2v4a2 2 0 002 2h2a2 2 0 002-2zm0-6V5a2 2 0 00-2-2h-2a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z'
    },
    {
      label: 'Documents',
      link: '/documents',
      iconPath: 'M7 7h10M7 11h4m1 8h5a2 2 0 002-2V5a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2h5l3 3z'
    }
  ];

  toggleMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMenu() {
    this.isMobileMenuOpen = false;
  }
}

export interface SubMenuItem {
  label: string;
  link: string;
}

export interface NavItem {
  label: string;
  iconPath: string; // We will store the SVG 'd' path here
  link?: string;    // Optional, main items might not have a link if they have sub-menus
  subItems?: SubMenuItem[];
  isOpen?: boolean; // To toggle dropdowns if needed (optional logic)
}

export interface UserProfile {
  name: string;
  role: string;
  initials: string;
}