import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from "@angular/router";
import { filter } from 'rxjs/operators';
import {
  LucideAngularModule,
  LayoutDashboard,
  Building2,
  UsersRound,
  AppWindow,
  CreditCard,
  Tag,
  Megaphone,
  Settings,
  ChevronDown,
  Plus,
  Bell,
  ChevronLeft,
  ChevronRight,
  Menu,
  Search,
  Settings as SettingsIcon,
  X,
  ShieldCheck,
  LogOut,
  FolderOpen,
  ChevronsLeft,
  Sun,
  Moon,
  Gift,
  MonitorPlay,
  Calendar
} from 'lucide-angular';
import { AuthService } from '../../guards/auth.service';
import { ModalService } from '../modal/modalService';
import { NotificationsComponent } from '../notifications/notifications.component';
import { DropdownMenuItem, CustomDropdownComponent } from '../../UI/custom-dropdown/custom-dropdown.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DrawerService } from '../drawer/drawerService';
import { SearchModalComponent } from '../search-modal/search-modal.component';

@Component({
  selector: 'app-dev-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, NotificationsComponent, CustomDropdownComponent],
  templateUrl: './dev-layout.component.html',
  styleUrl: './dev-layout.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DevLayoutComponent implements OnInit {

  isMobileMenuOpen = false;
  isSidebarCollapsed = false;
  openDropdownLabel: string | null = null;
  @ViewChild('app-sidebar') sidebar!: any;
  currentDate = new Date();

  //icons
  readonly Calendar = Calendar;
  readonly ChevronDown = ChevronDown;
  readonly Plus = Plus;
  readonly Menu = Menu;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  readonly Search = Search;
  readonly Bell = Bell;
  readonly Settings = SettingsIcon;
  readonly XIcon = X;
  readonly PlusIcon = Plus;
  readonly ChevronsLeft = ChevronsLeft;
  readonly Sun = Sun;
  readonly Moon = Moon;

  quickCreateItems: DropdownMenuItem[] = [
    {
      label: 'New Tenant',
      subLabel: 'Register a new tenant company',
      icon: Building2,
      iconBgClass: 'bg-gray-50 border border-gray-200',
      colorClass: 'text-gray-700',
      action: () => this.router.navigate(['dev/tenants/create'])
    },
    {
      label: 'New Plan',
      subLabel: 'Create a new subscription plan',
      icon: CreditCard,
      iconBgClass: 'bg-gray-50 border border-gray-200',
      colorClass: 'text-gray-700',
      action: () => this.router.navigate(['dev/plans/create'])
    },
    {
      label: 'New Offer',
      subLabel: 'Launch a new promotion',
      icon: Tag,
      iconBgClass: 'bg-gray-50 border border-gray-200',
      colorClass: 'text-gray-700',
      action: () => this.router.navigate(['dev/offers/create'])
    }
  ];

  userMenuItems: DropdownMenuItem[] = [
    {
      label: 'Admin Portal',
      subLabel: 'Manage global settings',
      icon: ShieldCheck,
      iconBgClass: 'bg-slate-50',
      colorClass: 'text-slate-600',
      action: () => this.router.navigate(['/dev/settings'])
    },
    {
      label: 'Sign Out',
      icon: LogOut,
      iconBgClass: 'bg-rose-50',
      colorClass: 'text-rose-600',
      action: () => this.authService.logout()
    }
  ];

  visibleNavItems: NavItem[] = [];

  allNavItems: NavItem[] = [
    {
      label: 'Dashboard',
      link: '/dev/dashboard',
      icon: LayoutDashboard
    },
    {
      label: 'Tenants',
      link: '/dev/tenants',
      icon: Building2
    },
    {
      label: 'Global Users',
      link: '/dev/users',
      icon: UsersRound
    },
    {
      label: 'Applications',
      link: '/dev/applications',
      icon: AppWindow
    },
    {
      label: 'Subscriptions & Plans',
      link: '/dev/subscriptions',
      icon: CreditCard,
      subItems: [
        { label: 'All Subscriptions', link: '/dev/subscriptions/all' },
        { label: 'Manage Plans', link: '/dev/subscriptions/plans' },
      ]
    },
    {
      label: 'Offers',
      link: '/dev/offers',
      icon: Gift
    },
    {
      label: 'Ads Control',
      link: '/dev/ads',
      icon: MonitorPlay
    },
    {
      label: 'Settings',
      link: '/dev/settings',
      icon: Settings,
      section: 'Settings'
    },
  ];

  user: UserProfile = {
    name: 'Developer Admin',
    role: 'System Administrator',
    initials: 'DA',
    email: 'admin@ezh.com'
  };

  constructor(
    private drawerService: DrawerService,
    private modalService: ModalService,
    private authService: AuthService,
    public router: Router
  ) { }

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkActiveDropdown();
    });

    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.user = {
          name: user.fullName || 'Developer Admin',
          role: 'System Administrator',
          initials: this.getInitials(user.fullName || 'Developer Admin'),
          email: user.email
        };
      }
    });

    this.filterNavItems();
    this.checkActiveDropdown();
  }

  checkActiveDropdown() {
    if (this.isSidebarCollapsed) return;
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

  filterNavItems() {
    const businessItems = this.allNavItems.filter(item => item.section !== 'Settings');
    const settingsItems = this.allNavItems.filter(item => item.section === 'Settings');

    this.visibleNavItems = [];

    if (businessItems.length > 0) {
      this.visibleNavItems.push({ label: 'Platform', isHeader: true, icon: null });
      this.visibleNavItems.push(...businessItems);
    }

    if (settingsItems.length > 0) {
      this.visibleNavItems.push({ label: 'Preferences', isHeader: true, icon: null });
      this.visibleNavItems.push(...settingsItems);
    }
  }

  getInitials(name: string): string {
    if (!name) return 'DA';
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
    if (this.isSidebarCollapsed) {
      this.openDropdownLabel = null;
    } else {
      this.checkActiveDropdown();
    }
  }
}

export interface SubMenuItem {
  label: string;
  link: string;
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
