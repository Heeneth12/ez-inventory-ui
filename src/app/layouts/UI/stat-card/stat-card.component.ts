import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div 
      (click)="onCardClick()"
      class="
        group relative cursor-pointer
        bg-white rounded-lg border border-gray-200 
        p-4 
        hover:border-blue-400 hover:shadow-md hover:-translate-y-0.5
        transition-all duration-200 ease-out
      ">
      
      <div class="flex justify-between items-start mb-2">
        <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {{ data.title }}
        </h3>

        <div [class]="'p-1.5 rounded-md transition-colors ' + data.iconColorClass">
          <lucide-icon 
            [img]="data.icon" 
            class="w-4 h-4 opacity-80 group-hover:opacity-100">
          </lucide-icon>
        </div>
      </div>

      <div class="text-2xl font-bold text-gray-800 tracking-tight mb-2">
        {{ data.value }}
      </div>

      <div class="flex items-center text-xs">
        <span 
          class="font-medium mr-1.5"
          [ngClass]="data.trendDirection === 'up' ? 'text-green-600' : 'text-red-600'">
          {{ data.trendDirection === 'up' ? '↑' : '↓' }} 
        </span>
        <span class="text-gray-400">
          {{ data.trendText }}
        </span>
      </div>

    </div>
  `
})
export class StatCardComponent {
  @Input({ required: true }) data!: StatCardData;
  @Output() cardClick = new EventEmitter<StatCardData>();

  onCardClick() {
    this.cardClick.emit(this.data);
  }
}
export interface StatCardData {
  id: string | number; // Unique ID for click tracking
  title: string;
  value: string;
  trendText: string;
  trendDirection: 'up' | 'down';
  icon: any; // Holds the Lucide Icon object (e.g., Truck, Package)
  iconColorClass: string; // Background/Text styling for the icon container
}
