import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, TrendingDown, TrendingUp } from 'lucide-angular';

export interface StatCardConfig {
  key: string;
  label: string;
  value: string | number;
  icon?: any;
  trend?: {
    value: string | number;
    isUp: boolean;
  };
  color?: 'indigo' | 'emerald' | 'rose' | 'amber' | 'gray';
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

  // This ensures that if you pass 2 cards, they take 50% each. If 4, 25% each.
  get gridClass(): string {
    const count = this.stats.length;
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-1 md:grid-cols-2';
    if (count === 3) return 'grid-cols-1 md:grid-cols-3';
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
  }

  getIconTheme(color?: string) {
    const themes = {
      indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      rose: 'bg-rose-50 text-rose-600 border-rose-100',
      amber: 'bg-amber-50 text-amber-600 border-amber-100',
      gray: 'bg-gray-50 text-gray-600 border-gray-100'
      
    };
    return themes[color as keyof typeof themes] || themes.indigo;
  }
}