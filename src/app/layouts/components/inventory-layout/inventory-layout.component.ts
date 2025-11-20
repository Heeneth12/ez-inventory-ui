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
      label: 'Fleet',
      link: '/fleet',
      iconPath: 'M3 13l1.664-5.329A3 3 0 017.586 7h8.828a3 3 0 012.922 1.671L21 13M5 13v6a2 2 0 002 2h1a2 2 0 002-2v-6M5 13h14M19 13v6a2 2 0 01-2 2h-1a2 2 0 01-2-2v-6M9 21h6',
      
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