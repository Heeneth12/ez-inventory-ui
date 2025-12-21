import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

export interface StatCardData {
  id: string | number;
  title: string;
  value: string;
  trendText: string;
  trendDirection: 'up' | 'down';
  icon: any;
  themeColor: 'blue' | 'purple' | 'emerald' | 'orange';
}

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div 
      (click)="onCardClick()"
      [ngClass]="getCardClasses()"
      class="
        group relative flex items-center justify-between
        p-5 rounded-lg cursor-pointer
        border border-gray-300 transition-all duration-200 ease-out
        hover:shadow-lg hover:-translate-y-0.5
      ">
      
      <div class="flex flex-col gap-1">
        <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {{ data.title }}
        </span>
        
        <div class="flex items-end gap-3 mt-1">
          <span class="text-2xl font-bold text-gray-900 leading-none">
            {{ data.value }}
          </span>
          
          <div 
            [ngClass]="data.trendDirection === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'"
            class="flex items-center px-1.5 py-0.5 rounded-md text-[11px] font-bold">
            <span class="mr-1">
                {{ data.trendDirection === 'up' ? '↗' : '↘' }}
            </span>
            {{ data.trendText }}
          </div>
        </div>
      </div>

      <div 
        [class]="getIconContainerClasses()"
        class="
          flex items-center justify-center w-12 h-12 rounded-lg
          transition-colors duration-300
        ">
        <lucide-icon 
          [img]="data.icon" 
          [class]="getIconClasses()"
          class="w-6 h-6 transition-transform duration-300 group-hover:scale-110">
        </lucide-icon>
      </div>
    </div>
  `
})
export class StatCardComponent {
  @Input({ required: true }) data!: StatCardData;
  @Input() isSelected: boolean = false;
  @Output() cardClick = new EventEmitter<StatCardData>();

  onCardClick() {
    this.cardClick.emit(this.data);
  }

  // logic to handle clean styling toggles
  getCardClasses(): string {
    if (this.isSelected) {
      // Selected State: Active Border, Subtle Background
      return 'bg-blue-50/40 border-blue-100 ring-1 ring-blue-200';
    } else {
      // Default State: White, Gray Border
      return 'bg-white border-gray-100 hover:border-gray-200';
    }
  }

  getIconContainerClasses(): string {
    // If selected, we fill the icon background. If not, we keep it light.
    if (this.isSelected) {
      return `bg-blue-500 shadow-md shadow-blue-200`;
    }

    // Map theme colors to Tailwind classes dynamically
    const colors: any = {
      blue: 'bg-blue-50 group-hover:bg-blue-100',
      purple: 'bg-purple-50 group-hover:bg-purple-100',
      emerald: 'bg-emerald-50 group-hover:bg-emerald-100',
      orange: 'bg-orange-50 group-hover:bg-orange-100'
    };
    return colors[this.data.themeColor] || colors.blue;
  }

  getIconClasses(): string {
    if (this.isSelected) return 'text-white';

    const colors: any = {
      blue: 'text-blue-600',
      purple: 'text-purple-600',
      emerald: 'text-emerald-600',
      orange: 'text-orange-600'
    };
    return colors[this.data.themeColor] || colors.blue;
  }
}