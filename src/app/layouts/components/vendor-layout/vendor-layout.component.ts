import { CommonModule } from '@angular/common';
import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from "@angular/router";
import { filter } from 'rxjs/operators';
import {
  LucideAngularModule,
  LayoutDashboard,
  Settings,
  Calendar,
  ChevronDown,
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
  MessageSquareText,
  X,
  Newspaper,
  Undo2,
  ReceiptText,
  ChevronsLeft,
  Sun,
  Moon,
  HelpCircle,
  BookOpen,
  MessageSquare,
  Headset,
  LogOut,
  ShieldCheck,
  FolderOpen,
  Users
} from 'lucide-angular';
import { AuthService } from '../../guards/auth.service';
import { TutorialService } from '../../service/common/tutorial.service';
import { PromoModalComponent } from "../promo-modal/promo-modal.component";
import { ModalService } from '../modal/modalService';
import { NotificationsComponent } from '../notifications/notifications.component';
import { DrawerService } from '../drawer/drawerService';
import { SearchModalComponent } from '../search-modal/search-modal.component';
import { DropdownMenuItem } from '../../UI/custom-dropdown/custom-dropdown.component';

@Component({
  selector: 'app-vendor-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, NotificationsComponent],
  templateUrl: './vendor-layout.component.html',
  styleUrl: './vendor-layout.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class VendorLayoutComponent implements OnInit {

  isMobileMenuOpen = false;
  isSidebarCollapsed = false;
  openDropdownLabel: string | null = null;
  currentDate = new Date();
  private readonly STORAGE_KEY = 'catalyst_tour_completed';

  //icons
  readonly Calendar = Calendar
  readonly ChevronDown = ChevronDown
  readonly Zap = Zap;
  readonly FileText = FileText;
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
  readonly PlusIcon = Plus;
  readonly helpIcon = HelpCircle;
  readonly ChevronsLeft = ChevronsLeft;
  readonly Sun = Sun;
  readonly Moon = Moon;

  quickCreateItems: DropdownMenuItem[] = [
    {
      label: 'New Dispatch',
      subLabel: 'Create a new shipment',
      icon: Newspaper,
      iconBgClass: 'bg-gray-50 border border-gray-200',
      colorClass: 'text-gray-700',
      action: () => this.router.navigate(['/vendor/asn/create'])
    },
    {
      label: 'Add User',
      subLabel: 'Register a new team member',
      icon: Users,
      iconBgClass: 'bg-gray-50 border border-gray-200',
      colorClass: 'text-gray-700',
      action: () => this.router.navigate(['/vendor/settings'])
    }
  ];

  userMenuItems: DropdownMenuItem[] = [
    {
      label: 'Company Profile',
      subLabel: 'Manage business details',
      icon: ShieldCheck,
      iconBgClass: 'bg-slate-50',
      colorClass: 'text-slate-600',
      action: () => this.router.navigate(['/vendor/settings'])
    },
    {
      label: 'Documents',
      subLabel: 'Manage catalog & certs',
      icon: FolderOpen,
      iconBgClass: 'bg-slate-50',
      colorClass: 'text-slate-600',
      action: () => this.router.navigate(['/vendor/asn'])
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
      subLabel: 'Vendor portal guides',
      icon: BookOpen,
      iconBgClass: 'bg-slate-50',
      colorClass: 'text-slate-600',
      action: () => window.open('https://docs.ezh.com', '_blank')
    },
    {
      label: 'Contact Support',
      subLabel: 'Talk to procurement',
      icon: MessageSquare,
      iconBgClass: 'bg-slate-50',
      colorClass: 'text-slate-600',
      action: () => { }
    },
    {
      label: 'Page Tours',
      subLabel: 'Navigational roadmap',
      icon: Headset,
      iconBgClass: 'bg-slate-50',
      colorClass: 'text-slate-600',
      action: () => {
        this.tutorialService.startTour("general");
      }
    }
  ];

  user: UserProfile = {
    name: 'Vendor User',
    role: 'Partner',
    initials: 'VU',
    email: ''
  };

  visibleNavItems: NavItem[] = [];

  allNavItems: NavItem[] = [
    {
      label: 'Dashboard',
      link: '/vendor/dashboard',
      icon: LayoutDashboard,
      moduleKey: 'EZH_INV_VENDOR'
    },
    {
      label: 'New Orders',
      link: '/vendor/new-orders',
      icon: Newspaper,
      moduleKey: 'EZH_INV_VENDOR'
    },
    {
      label: 'ASN Management',
      link: '/vendor/asn',
      icon: ReceiptText,
      moduleKey: 'EZH_INV_VENDOR'
    },
    {
      label: 'Purchase Returns',
      link: '/vendor/sales-returns',
      icon: Undo2,
      moduleKey: 'EZH_INV_VENDOR'
    },
    {
      label: 'Settings',
      link: '/vendor/settings',
      icon: Settings,
      moduleKey: 'EZH_INV_VENDOR',
      section: 'Settings'
    }
  ];

  constructor(
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
          role: user.userRoles[0] || 'Vendor',
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
      if (!item.moduleKey) return true;
      return user.userApplications?.some((app: any) =>
        app.modulePrivileges && item.moduleKey && app.modulePrivileges[item.moduleKey]
      );
    });

    const mainItems = visible.filter(item => item.section !== 'Settings');
    const settingsItems = visible.filter(item => item.section === 'Settings');

    this.visibleNavItems = [];

    if (mainItems.length > 0) {
      this.visibleNavItems.push({ label: 'Vendor Portal', isHeader: true, icon: null });
      this.visibleNavItems.push(...mainItems);
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

  toggleSidebarCollapse() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    if (this.isSidebarCollapsed) {
      this.openDropdownLabel = null;
    } else {
      this.checkActiveDropdown();
    }
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

  openUserCalendar() {
    this.router.navigate(['/vendor/calendar']);
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
