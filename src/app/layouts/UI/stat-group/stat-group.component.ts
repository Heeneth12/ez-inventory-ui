import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, TrendingDown, TrendingUp, Minus } from 'lucide-angular';

// Expanded color palette type
export type StatColor = 'blue' | 'indigo' | 'purple' | 'pink' | 'rose' | 'orange' | 'amber' | 'emerald' | 'teal' | 'cyan' | 'sky' | 'slate' | 'gray';

export interface StatCardConfig {
  key: string;
  label: string;
  value: string | number;
  icon?: any;
  trend?: {
    value: string | number;
    isUp: boolean;
    isNeutral?: boolean; // Added optional neutral state
  };
  color?: StatColor | string; // Allow specific string literals or general string
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

  getIconTheme(color: string = 'indigo') {
    const themes: Record<string, string> = {
      blue:    'bg-blue-50 text-blue-600 ring-1 ring-blue-500/10',
      indigo:  'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/10',
      purple:  'bg-purple-50 text-purple-600 ring-1 ring-purple-500/10',
      pink:    'bg-pink-50 text-pink-600 ring-1 ring-pink-500/10',
      rose:    'bg-rose-50 text-rose-600 ring-1 ring-rose-500/10',
      orange:  'bg-orange-50 text-orange-600 ring-1 ring-orange-500/10',
      amber:   'bg-amber-50 text-amber-600 ring-1 ring-amber-500/10',
      emerald: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/10',
      teal:    'bg-teal-50 text-teal-600 ring-1 ring-teal-500/10',
      cyan:    'bg-cyan-50 text-cyan-600 ring-1 ring-cyan-500/10',
      sky:     'bg-sky-50 text-sky-600 ring-1 ring-sky-500/10',
      slate:   'bg-slate-100 text-slate-600 ring-1 ring-slate-500/10',
      gray:    'bg-gray-100 text-gray-600 ring-1 ring-gray-500/10',
    };

    return themes[color] || themes['indigo'];
  }
}