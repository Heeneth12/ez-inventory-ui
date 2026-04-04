import { Component, Input, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import '@tailwindplus/elements';

export interface DropdownMenuItem {
  label: string;
  subLabel?: string;
  icon: any;
  action?: () => void;
  routerLink?: string;
  colorClass?: string;
  iconBgClass?: string;
}

/**
 * @description
 * This component is a custom dropdown menu component that can be used to display a list of menu items.
 * 
 * @example
 * <app-custom-dropdown 
 *   [triggerIcon]="helpIcon" 
 *   menuTitle="Help & Support" 
 *   [items]="supportMenuItems">
 * </app-custom-dropdown>
 */
@Component({
  selector: 'app-custom-dropdown',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <el-dropdown class="inline-block">
      <button
        [class]="buttonClass">
        {{ menuTitle }}
        <lucide-icon [img]="triggerIcon" [class]="iconClass">
        </lucide-icon>
      </button>

      <el-menu [attr.anchor]="anchor" popover
        class="m-0 w-64 origin-top-right rounded-lg bg-white p-1.5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] ring-1 ring-slate-200 transition [--anchor-gap:8px] [transition-behavior:allow-discrete] data-[closed]:scale-95 data-[closed]:opacity-0">
        
        <div class="px-3 py-2 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
          {{ menuTitle }}
        </div>

        <div class="space-y-0.5">
          @for (item of items; track item.label) {
            <a [routerLink]="item.routerLink" 
               (click)="item.action ? item.action() : null"
               class="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors focus:outline-none hover:bg-slate-50 group cursor-pointer">
              
              <div [class]="'size-8 flex items-center justify-center rounded-lg ' + (item.iconBgClass || 'bg-slate-200')">
                  <lucide-icon [img]="item.icon" [class]="'size-4 ' + (item.colorClass || 'text-slate-600')"></lucide-icon>
              </div>

              <div class="flex flex-col">
                  <span [class]="'text-xs font-medium ' + (item.colorClass || 'text-slate-700')">{{ item.label }}</span>
                  @if (item.subLabel) {
                    <span class="text-[9px] text-slate-400">{{ item.subLabel }}</span>
                  }
              </div>
            </a>
          }
        </div>
      </el-menu>
    </el-dropdown>
  `
})
export class CustomDropdownComponent {
  @Input() triggerIcon!: any;
  @Input() menuTitle?: string;
  @Input() items: DropdownMenuItem[] = [];
  @Input() anchor: string = 'bottom end';
  @Input() buttonClass: string = 'group inline-flex items-center justify-center rounded-full bg-white p-1 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 transition-all duration-200 ';
  @Input() iconClass: string = 'h-4 w-4 shrink-0 text-slate-400 group-hover:text-indigo-500 transition-colors';
}


/**
Demo Example

helpIcon = HelpCircle;
supportMenuItems: DropdownMenuItem[] = [
   { 
     label: 'Account Settings', 
     subLabel: 'Manage your profile', 
     icon: User, 
     routerLink: '/settings' 
   },
   { 
     label: 'Create Ticket', 
     subLabel: 'Report a stock issue', 
     icon: Settings, 
     action: () => this.openTicketForm(),
     iconBgClass: 'bg-indigo-50',
     colorClass: 'text-indigo-600'
   },
   { 
     label: 'Sign Out', 
     icon: LogOut, 
     action: () => this.logout(),
     colorClass: 'text-rose-600',
     iconBgClass: 'bg-rose-50'
   }
];

openTicketForm() { console.log("Form Opened!"); }
logout() { console.log("User Logged Out!"); }

<!-- Default style (no buttonClass needed) -->
<app-custom-dropdown 
  [triggerIcon]="helpIcon" 
  menuTitle="Help & Support" 
  [items]="supportMenuItems">
</app-custom-dropdown>

<!-- Custom button style example -->
<app-custom-dropdown 
  [triggerIcon]="helpIcon" 
  menuTitle="Actions" 
  [items]="supportMenuItems"
  buttonClass="group inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-all duration-200"
  iconClass="h-4 w-4 shrink-0 text-indigo-200 group-hover:text-white transition-colors">
</app-custom-dropdown>
*/