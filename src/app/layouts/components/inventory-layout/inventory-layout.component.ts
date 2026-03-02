import { CommonModule } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Route, Router, RouterModule } from "@angular/router";
import { DrawerComponent } from "../drawer/drawer.component";
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
  BookOpen,
  HelpCircle,
  LifeBuoy,
  Headset,
  Package,
  ClipboardList,
  Receipt,
  UserPlus,
  BadgePlus,
  UsersRound,
} from 'lucide-angular';
import { AuthService } from '../../guards/auth.service';
import { LoaderComponent } from "../loader/loader.component";
import { TutorialService } from '../../service/common/tutorial.service';
import { PromoModalComponent } from "../promo-modal/promo-modal.component";
import { ModalService } from '../modal/modalService';
import { NotificationsComponent } from '../notifications/notifications.component';
import { NotificationService } from '../notifications/notification.service';
import { DropdownMenuItem, CustomDropdownComponent } from '../../UI/custom-dropdown/custom-dropdown.component';

@Component({
  selector: 'app-inventory-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, DrawerComponent, ModalComponent, UserComponent, LucideAngularModule, SearchModalComponent, LoaderComponent, NotificationsComponent, CustomDropdownComponent],
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
  readonly plusIcon = Plus;
  readonly helpIcon = HelpCircle;
  readonly BadgePlus = BadgePlus

  isQuickCreateOpen = false;

  quickCreateItems: DropdownMenuItem[] = [
    {
      label: 'New Item',
      subLabel: 'Add a new product or service',
      icon: Package,
      iconBgClass: 'bg-amber-50',
      colorClass: 'text-amber-700',
      action: () => this.router.navigate(['items/create'])
    },
    {
      label: 'Purchase Request',
      subLabel: 'Create a new internal PRQ',
      icon: ClipboardList,
      iconBgClass: 'bg-blue-50',
      colorClass: 'text-blue-700',
      action: () => this.router.navigate(['purchases/prq/create'])
    },
    {
      label: 'Sales Order',
      subLabel: 'Create a new customer order',
      icon: ShoppingCart,
      iconBgClass: 'bg-indigo-50',
      colorClass: 'text-indigo-700',
      action: () => this.router.navigate(['sales/order/create'])
    },
    {
      label: 'New Invoice',
      subLabel: 'Generate customer billing',
      icon: Receipt,
      iconBgClass: 'bg-slate-100',
      colorClass: 'text-slate-700',
      action: () => this.router.navigate(['sales/invoice/create'])
    },
    {
      label: 'Add User',
      subLabel: 'Register a new system user',
      icon: UserPlus,
      iconBgClass: 'bg-violet-50',
      colorClass: 'text-violet-700',
      action: () => this.router.navigate(['admin/users/form'])
    }
  ];


  helpCenterItems: DropdownMenuItem[] = [
    {
      label: 'Knowledge Base',
      subLabel: 'Guides for EZH Inventory',
      icon: BookOpen,
      iconBgClass: 'bg-slate-50',
      colorClass: 'text-slate-600',
      action: () => window.open('https://docs.ezh.com', '_blank')
    },
    {
      label: 'Contact Support',
      subLabel: 'Open a manual ticket',
      icon: MessageSquare,
      iconBgClass: 'bg-slate-50',
      colorClass: 'text-slate-600',
      action: () => console.log("h")
    },
    {
      label: 'Page Tours',
      subLabel: 'Module guide acts as a roadmap',
      icon: Headset,
      iconBgClass: 'bg-slate-50',
      colorClass: 'text-slate-600',
      routerLink: '/system-status'

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
        { label: 'Purchase Request (PRQ)', link: '/purchases/prq' },
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
    // {
    //   label: 'Contacts',
    //   link: '/contacts',
    //   icon: Users,
    //   moduleKey: 'EZH_INV_CONTACTS'
    // },
    // {
    //   label: 'Employees',
    //   link: '/employee',
    //   icon: CircleUser,
    //   moduleKey: 'EZH_INV_EMPLOYEE'
    // },
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
      label: 'User Management',
      link: '/admin/users',
      icon: UsersRound,
      moduleKey: 'EZH_INV_USER_MGMT'
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
    // {
    //   label: 'Admin',
    //   link: '/admin',
    //   icon: UserPlusIcon,
    //   moduleKey: 'EZH_INV_USER_MGMT'
    // },
    // {
    //   label: 'Settings',
    //   link: '/settings',
    //   icon: Settings,
    //   moduleKey: 'EZH_INV_SETTINGS'
    // }
  ];

  constructor(
    private drawerService: DrawerService,
    private searchService: SearchService,
    private modalService: ModalService,
    private authService: AuthService,
    private router: Router,
    private tutorialService: TutorialService,
    private notificationSvc: NotificationService
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

  openUserCalendar() {
    this.router.navigate(['/admin/user/calendar']);
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