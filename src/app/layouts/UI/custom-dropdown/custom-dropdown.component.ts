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
    <el-dropdown class="inline-block font-sans">
      
      <!-- Trigger -->
      <button [title]="menuTitle" [class]="buttonClass">
        <span *ngIf="menuTitle" class="sm:block hidden">{{ menuTitle }}</span>
        <lucide-icon [img]="triggerIcon" [class]="iconClass"></lucide-icon>
      </button>

      <!-- Dropdown Menu -->
      <el-menu [attr.anchor]="anchor" popover
        class="m-0 w-64 origin-top-right bg-white border border-ez-border p-0 transition-opacity duration-ez [transition-behavior:allow-discrete] data-[closed]:opacity-0 z-50 focus:outline-none shadow-xl rounded">
        
        <!-- Header -->
        <div *ngIf="menuTitle" class="px-4 py-3 bg-ez-ash border-b border-ez-border shrink-0">
          <span class="ez-micro-label text-ez-secondary">{{ menuTitle }}</span>
        </div>

        <!-- Items List -->
        <div class="flex flex-col">
          @for (item of items; track item.label) {
            <a [routerLink]="item.routerLink" 
               (click)="item.action ? item.action() : null"
               class="flex items-center gap-3 px-4 py-3 border-b border-ez-border last:border-0 transition-colors duration-ez hover:bg-ez-ash focus:outline-none group cursor-pointer bg-white">
              
              <!-- Icon Box -->
              <div [class]="'w-8 h-8 flex items-center justify-center shrink-0 border border-ez-border transition-colors duration-ez rounded ' + (item.iconBgClass || 'bg-white group-hover:border-ez-subtle')">
                  <lucide-icon [img]="item.icon" [class]="'w-3.5 h-3.5 ' + (item.colorClass || 'text-ez-heading')"></lucide-icon>
              </div>

              <!-- Text Content -->
              <div class="flex flex-col min-w-0">
                  <span [class]="'text-ez-sm font-medium transition-colors duration-ez ' + (item.colorClass || 'text-ez-heading group-hover:text-ez-primary')">
                    {{ item.label }}
                  </span>
                  @if (item.subLabel) {
                    <span class="text-ez-xs text-ez-micro-text mt-0.5 truncate">{{ item.subLabel }}</span>
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

  // Minimalist default trigger styles
  @Input() buttonClass: string = 'group flex items-center justify-center gap-2 px-3 py-2 min-h-[32px] bg-white border border-ez-border text-ez-sm font-medium text-ez-secondary hover:border-ez-subtle hover:text-ez-heading transition-colors duration-ez outline-none';
  @Input() iconClass: string = 'w-4 h-4 shrink-0 transition-colors duration-ez';
}