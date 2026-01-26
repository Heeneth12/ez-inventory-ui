import { CommonModule } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Route, Router, RouterModule } from "@angular/router";
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
  Settings,
  Calendar,
  ChevronDown,
  ListChecks,
  FileText,
  Zap,
  CreditCard,
  Plus,
  Bell,
  ChevronLeft,
  ChevronRight,
  Menu,
  Search,
  SettingsIcon,
  MessageSquare,
  MessageSquareText,
  X,
  UserPlusIcon
} from 'lucide-angular';
import { AuthService } from '../../guards/auth.service';
import { LoaderComponent } from "../loader/loader.component";
import { McpChatBotComponent } from "../mcp-chat-bot/mcp-chat-bot.component";
import { TutorialService } from '../../service/common/tutorial.service';
import { PromoModalComponent } from "../promo-modal/promo-modal.component";
import { ModalService } from '../modal/modalService';
import { NotificationsComponent } from '../notifications/notifications.component';

@Component({
  selector: 'app-inventory-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, DrawerComponent, ToastComponent, ModalComponent, UserComponent, LucideAngularModule, SearchModalComponent, LoaderComponent, McpChatBotComponent, PromoModalComponent],
  templateUrl: './inventory-layout.component.html',
  styleUrl: './inventory-layout.component.css'
})
export class InventoryLayoutComponent implements OnInit {

  isMobileMenuOpen = false;
  isSidebarCollapsed = false; // New state for collapse
  openDropdownIndex: number | null = null;
  @ViewChild('userProfileTemplate') userProfileTemplate!: TemplateRef<any>;
  private readonly STORAGE_KEY = 'catalyst_tour_completed';

  //icons
  readonly Calendar = Calendar
  readonly ChevronDown = ChevronDown
  readonly Zap = Zap;
  readonly FileText = FileText;
  readonly ShoppingCart = ShoppingCart;
  readonly CreditCard = CreditCard;
  readonly Plus = Plus;
  readonly Menu = Menu;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  readonly Search = Search;
  readonly Bell = Bell;
  readonly Settings = SettingsIcon;
  readonly MessageSquareText = MessageSquareText;
  readonly XIcon = X;

  isQuickCreateOpen = false;
  quickCreateItems = [
    {
      label: 'New Invoice',
      icon: FileText,
      action: () => {
        this.router.navigate(['sales/invoice/create']);
        this.isQuickCreateOpen = false;
      }
    },
    {
      label: 'Sales Order',
      icon: ShoppingCart,
      action: () => this.router.navigate(['sales/ invoice/create'])
    },
    {
      label: 'Record Payment',
      icon: CreditCard,
      action: () => this.router.navigate(['sales/invoice/create'])
    }
  ];

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
        { label: 'Invoices', link: '/sales/invoice' },
        { label: 'Delivery', link: '/sales/delivery' },
        { label: 'Payments', link: '/sales/payments' },
        { label: 'Sales Return', link: '/sales/return' },
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
      label: 'Approval',
      link: '/approval',
      icon: ListChecks,
      moduleKey: 'EZH_INV_EMPLOYEE',
      badge: 2,
    },
    {
      label: 'Reports',
      link: '/reports',
      icon: FileChartColumn,
      moduleKey: 'EZH_INV_REPORTS'
    },
    {
      label: 'AI Chat',
      link: '/ai-chat',
      icon: MessageSquareText,
      moduleKey: 'EZH_INV_REPORTS',
      badge: 'Pro',
      badgeVariant: 'pro',
      isDisabled: true,
    },
    {
      label: 'Documents',
      link: '/documents',
      icon: Folder,
      moduleKey: 'EZH_INV_DOCUMENTS'
    },
    {
      label: 'Admin',
      link: '/admin',
      icon: UserPlusIcon,
      moduleKey: 'EZH_INV_USER_MGMT'
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
    private modalService: ModalService,
    private authService: AuthService,
    private router: Router,
    private tutorialService: TutorialService
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
    const hasSeenTour = localStorage.getItem(this.STORAGE_KEY);
    this.openCatalystWelcomeModal(hasSeenTour);
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
    this.drawerService.openTemplate(
      this.userProfileTemplate,
      'User Profile',
      'md'
    );
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

  openNotification() {
    this.drawerService.openComponent(
      NotificationsComponent,
      {},
      'Notifications',
      'md'
    )
  }

  isDropdownOpen(index: number): boolean {
    return this.openDropdownIndex === index;
  }

  openSmartSearch() {
    this.searchService.open();
  }

  toggleSidebarCollapse() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    // If collapsing, close any open dropdowns to avoid UI bugs
    if (this.isSidebarCollapsed) {
      this.openDropdownIndex = null;
    }
  }

  openCatalystWelcomeModal(hasSeenTour: string | null) {
    if (hasSeenTour !== 'true') {
      console.log("open")
      this.modalService.openComponent(
        PromoModalComponent,
        {},
        'md'
      )
    }
  }
}

export interface SubMenuItem {
  label: string;
  link: string;
}

export interface NavItem {
  label: string;
  icon: any;
  badge?: string | number;
  badgeVariant?: 'default' | 'pro' | 'warning';
  link?: string;
  moduleKey?: string;
  subItems?: SubMenuItem[];
  isDisabled?: boolean;
}

export interface UserProfile {
  name: string;
  role: string;
  initials: string;
}