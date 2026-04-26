import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, TrendingDown, TrendingUp, Minus } from 'lucide-angular';

export interface StatCardConfig {
  key: string;
  label: string;
  value: string | number;
  icon?: any;
  color?: string;
  trend?: {
    value: string | number;
    isUp: boolean;
    isNeutral?: boolean;
  };
}

@Component({
  selector: 'app-stat-group',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './stat-group.component.html'
})
export class StatGroupComponent {
  @Input() stats: StatCardConfig[] = [];

  readonly trendingUpIcon = TrendingUp;
  readonly trendingDownIcon = TrendingDown;
  readonly neutralIcon = Minus;

  // Calculates grid columns dynamically based on items
  get gridClass(): string {
    const count = this.stats.length;
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-1 md:grid-cols-2';
    if (count === 3) return 'grid-cols-1 md:grid-cols-3';
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
  }
}