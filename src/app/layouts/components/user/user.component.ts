import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../guards/auth.service';
import { UserInitResponse } from '../../models/Init-response.model';
import { Settings, ShieldCheck, Zap, LucideAngularModule, UserPlusIcon, FolderOpen, ChevronRight } from 'lucide-angular';
import { RouterModule, Router } from '@angular/router';
import { DrawerService } from '../drawer/drawerService';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css' // Ensure you have tailwind directives here
})
export class UserComponent implements OnInit {

  userData$: Observable<UserInitResponse | null>;
  status: 'online' | 'away' | 'dnd' = 'online';
  isDND = false;

  // Icons
  readonly ShieldCheck = ShieldCheck;
  readonly Settings = Settings;
  readonly Zap = Zap;
  readonly UserPlusIcon = UserPlusIcon;
  readonly FolderOpen = FolderOpen;
  readonly ChevronRight = ChevronRight;

  readonly navItems = [
    {
      label: 'Admin Portal',
      sublabel: 'Manage users & permissions',
      link: '/admin',
      icon: this.ShieldCheck,
      colorClass: 'group-hover:text-indigo-600',
      borderClass: 'group-hover:border-indigo-200'
    },
    {
      label: 'Settings',
      sublabel: 'System preferences',
      link: '/settings',
      icon: this.Settings,
      colorClass: 'group-hover:text-slate-900',
      borderClass: 'group-hover:border-slate-300'
    },
    {
      label: 'Documents',
      sublabel: 'System preferences',
      link: '/documents',
      icon: this.FolderOpen,
      colorClass: 'group-hover:text-amber-600',
      borderClass: 'group-hover:border-amber-200'
    }
  ];

  constructor(private authSvs: AuthService, private drawerService: DrawerService, private router: Router) {
    this.userData$ = this.authSvs.currentUser$;
  }

  navigateTo(link: string) {
    this.drawerService.close();
    this.router.navigate([link]);
  }

  ngOnInit(): void {
    // No manual subscribe needed, the AsyncPipe handles it
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  toggleDND() {
    this.isDND = !this.isDND;
    this.status = this.isDND ? 'dnd' : 'online';
  }

  onLogout() {
    this.authSvs.logout();
  }
}