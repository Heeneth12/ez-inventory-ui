import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from "@angular/router";
import { filter } from 'rxjs/operators';
import {
  LucideAngularModule,
  LayoutDashboard,
  PackagePlus,
  Warehouse,
  ShoppingCart,
  Truck,
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
  Headset,
  Package,
  ClipboardList,
  Receipt,
  UserPlus,
  BadgePlus,
  UsersRound,
  ShieldCheck,
  LogOut,
  FolderOpen,
  ChevronsLeft,
  Sun,
  Moon,
  MessageSquarePlus,
  CheckIcon,
  Clock,
  PanelLeftClose,
  PanelRightOpen,
  HandbagIcon,
  Undo2,
} from 'lucide-angular';
import { AuthService } from '../../guards/auth.service';
import { TutorialService } from '../../service/common/tutorial.service';
import { PromoModalComponent } from "../promo-modal/promo-modal.component";
import { ModalService } from '../modal/modalService';
import { NotificationsComponent } from '../notifications/notifications.component';
import { DropdownMenuItem, CustomDropdownComponent } from '../../UI/custom-dropdown/custom-dropdown.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DrawerService } from '../drawer/drawerService';
import { SearchModalComponent } from '../search-modal/search-modal.component';

@Component({
  selector: 'app-inventory-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, NotificationsComponent, CustomDropdownComponent],
  templateUrl: './inventory-layout.component.html',
  styleUrl: './inventory-layout.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class InventoryLayoutComponent implements OnInit {

  isMobileMenuOpen = false;
  isSidebarCollapsed = false;
  openDropdownLabel: string | null = null;
  @ViewChild('app-sidebar') sidebar!: any;
  currentDate = new Date();
  private readonly STORAGE_KEY = 'catalyst_tour_completed';
  showPlanAds: boolean = true;

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
  readonly BadgePlus = BadgePlus;
  readonly PlusIcon = Plus;
  readonly ChevronsLeft = ChevronsLeft;
  readonly Sun = Sun;
  readonly Moon = Moon;
  readonly Clock = Clock;
  readonly CheckIcon = CheckIcon;
  readonly PanelLeftClose = PanelLeftClose;
  readonly PanelRightOpen = PanelRightOpen;

  proFeatures = ['Unlimited storage', 'Priority support', 'Advanced analytics'];

  quickCreateItems: DropdownMenuItem[] = [
    {
      label: 'New Item',
      subLabel: 'Add a new product or service',
      icon: Package,
      iconBgClass: 'bg-gray-50 border border-gray-200',
      colorClass: 'text-gray-700',
      action: () => this.router.navigate(['items/create'])
    },
    {
      label: 'Purchase Request',
      subLabel: 'Create a new internal PRQ',
      icon: ClipboardList,
      iconBgClass: 'bg-gray-50 border border-gray-200',
      colorClass: 'text-gray-700',
      action: () => this.router.navigate(['purchases/prq/create'])
    },
    {
      label: 'Sales Order',
      subLabel: 'Create a new customer order',
      icon: ShoppingCart,
      iconBgClass: 'bg-gray-50 border border-gray-200',
      colorClass: 'text-gray-700',
      action: () => this.router.navigate(['sales/order/create'])
    },
    {
      label: 'New Invoice',
      subLabel: 'Generate customer billing',
      icon: Receipt,
      iconBgClass: 'bg-gray-50 border border-gray-200',
      colorClass: 'text-gray-700',
      action: () => this.router.navigate(['sales/invoice/create'])
    },
    {
      label: 'Add User',
      subLabel: 'Register a new system user',
      icon: UserPlus,
      iconBgClass: 'bg-gray-50 border border-gray-200',
      colorClass: 'text-gray-700',
      action: () => this.router.navigate(['admin/users/form'])
    }
  ];

  userMenuItems: DropdownMenuItem[] = [
    {
      label: 'Admin Portal',
      subLabel: 'Manage users & permissions',
      icon: ShieldCheck,
      iconBgClass: 'bg-slate-50',
      colorClass: 'text-slate-600',
      action: () => this.router.navigate(['/admin'])
    },
    {
      label: 'Settings',
      subLabel: 'System preferences',
      icon: SettingsIcon,
      iconBgClass: 'bg-slate-50',
      colorClass: 'text-slate-600',
      action: () => this.router.navigate(['/settings'])
    },
    {
      label: 'Documents',
      subLabel: 'Manage your documents',
      icon: FolderOpen,
      iconBgClass: 'bg-slate-50',
      colorClass: 'text-slate-600',
      action: () => this.router.navigate(['/documents'])
    },
    {
      label: 'Sign Out',
      icon: LogOut,
      iconBgClass: 'bg-rose-50',
      colorClass: 'text-rose-600',
      action: () => this.authService.logout()
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
      action: () => { }
    },
    {
      label: 'Page Tours',
      subLabel: 'Module guide acts as a roadmap',
      icon: Headset,
      iconBgClass: 'bg-slate-50',
      colorClass: 'text-slate-600',
      action: () => {
        if (this.router.url.includes('/items')) {
          this.tutorialService.startTour('items');
        } else {
          this.tutorialService.startTour('general');
        }
      }
    },
    {
      label: 'Feedback',
      subLabel: 'Share your feedback with us',
      icon: MessageSquarePlus,
      iconBgClass: 'bg-slate-50',
      colorClass: 'text-slate-600',
      action: () => { }
    }
  ];

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
      icon: HandbagIcon,
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
      icon: ShoppingCart,
      moduleKey: 'EZH_INV_SALES',
      subItems: [
        { icon: ShoppingCart, label: 'Sales Order', link: '/sales/order' },
        { icon: Receipt, label: 'Invoices', link: '/sales/invoice' },
        { icon: Truck, label: 'Delivery', link: '/sales/delivery' },
        { icon: CreditCard, label: 'Payments', link: '/sales/payments' },
        { icon: Undo2, label: 'Sales Return', link: '/sales/return' },
      ]
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
      label: 'Documents',
      link: '/documents',
      icon: Folder,
      moduleKey: 'EZH_INV_DOCUMENTS'
    },
    {
      label: 'Users',
      link: '/admin/users',
      icon: UsersRound,
      moduleKey: 'EZH_INV_USER_MGMT',
      section: 'Settings'
    },
    {
      label: 'AI Chat',
      link: '/ai-chat',
      icon: MessageSquareText,
      moduleKey: 'EZH_INV_REPORTS',
      badge: 'Pro',
      badgeVariant: 'pro',
      isDisabled: false,
      section: 'Settings'
    },
    {
      label: 'Settings',
      link: '/settings',
      icon: Settings,
      moduleKey: 'EZH_INV_SETTINGS',
      section: 'Settings'
    },
  ];

  user: UserProfile = {
    name: 'Adam Driver',
    role: 'Fleet Manager',
    initials: 'AD',
    email: ''
  };

  constructor(
    private drawerService: DrawerService,
    private modalService: ModalService,
    private authService: AuthService,
    public router: Router,
    private tutorialService: TutorialService,
  ) { }

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkActiveDropdown();
    });

    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.filterNavItems(user);

        this.user = {
          name: user.fullName,
          role: user.userRoles[0] || 'User',
          initials: this.getInitials(user.fullName),
          email: user.email
        };

        this.checkActiveDropdown();
      }
    });
    const hasSeenTour = localStorage.getItem(this.STORAGE_KEY);
    this.openCatalystWelcomeModal(hasSeenTour);
  }

  checkActiveDropdown() {
    if (this.isSidebarCollapsed) return;

    // Check against visible nav items to find which one should be open
    this.visibleNavItems.forEach((item) => {
      if (item.subItems && this.isItemActive(item)) {
        this.openDropdownLabel = item.label;
      }
    });
  }

  isItemActive(item: NavItem): boolean {
    if (!this.router || !this.router.url) return false;
    if (item.link && this.router.url === item.link) {
      return true;
    }
    if (item.link && this.router.url.startsWith(item.link) && item.link !== '/') {
      return true;
    }
    if (item.subItems) {
      return item.subItems.some(sub => this.router.url.startsWith(sub.link));
    }
    return false;
  }

  filterNavItems(user: any) {
    const visible = this.allNavItems.filter(item => {
      // If item has no moduleKey, it's public/always visible
      if (!item.moduleKey) return true;

      // Check against the user's applications
      return user.userApplications?.some((app: any) =>
        app.modulePrivileges && item.moduleKey && app.modulePrivileges[item.moduleKey]
      );
    });

    const businessItems = visible.filter(item => item.section !== 'Settings');
    const settingsItems = visible.filter(item => item.section === 'Settings');

    this.visibleNavItems = [];

    if (businessItems.length > 0) {
      this.visibleNavItems.push({ label: 'Business', isHeader: true, icon: null });
      this.visibleNavItems.push(...businessItems);
    }

    if (settingsItems.length > 0) {
      this.visibleNavItems.push({ label: 'Settings', isHeader: true, icon: null });
      this.visibleNavItems.push(...settingsItems);
    }
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }


  toggleMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    if (this.isMobileMenuOpen && this.isSidebarCollapsed) {
      this.isSidebarCollapsed = false;
      this.checkActiveDropdown();
    }
  }

  closeMenu() {
    this.isMobileMenuOpen = false;
  }

  toggleDropdown(label: string) {
    if (this.openDropdownLabel === label) {
      this.openDropdownLabel = null;
    } else {
      this.openDropdownLabel = label;
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

  isDropdownOpen(label: string): boolean {
    return this.openDropdownLabel === label;
  }

  openSmartSearch() {
    this.modalService.openComponent(
      SearchModalComponent,
      {},
      'md'
    )
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && (event.key === 'k' || event.key === 'K')) {
      event.preventDefault();
      this.openSmartSearch();
    }
  }

  toggleSidebarCollapse() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    // If collapsing, close any open dropdowns to avoid UI bugs
    if (this.isSidebarCollapsed) {
      this.openDropdownLabel = null;
    } else {
      this.checkActiveDropdown();
    }
  }

  openUserCalendar() {
    this.router.navigate(['/admin/user/calendar']);
  }

  openCatalystWelcomeModal(hasSeenTour: string | null) {
    if (hasSeenTour !== 'true') {
      this.modalService.openComponent(
        PromoModalComponent,
        {},
        'md'
      )
    }
  }

  openUpgradeModal() {

  }
}

export interface SubMenuItem {
  label: string;
  link: string;
  icon?: any;
}

export interface NavItem {
  label: string;
  icon?: any;
  badge?: string | number;
  badgeVariant?: 'default' | 'pro' | 'warning';
  link?: string;
  moduleKey?: string;
  subItems?: SubMenuItem[];
  isDisabled?: boolean;
  section?: string;
  isHeader?: boolean;
}

export interface UserProfile {
  name: string;
  role: string;
  initials: string;
  email: string;
}