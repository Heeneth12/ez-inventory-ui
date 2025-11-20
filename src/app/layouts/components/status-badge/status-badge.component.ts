import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'neutral' | 'pending';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium capitalize"
      [ngClass]="colorClasses">
      <span *ngIf="showDot" class="w-1.5 h-1.5 mr-1.5 rounded-full" [ngClass]="dotColor"></span>
      {{ label }}
    </span>
  `
})
export class StatusBadgeComponent {
  @Input() label = '';
  @Input() variant: BadgeVariant = 'neutral';
  @Input() showDot = false;

  get colorClasses(): string {
    const variants: Record<BadgeVariant, string> = {
      success: 'bg-green-50 text-green-700 border border-green-200', // Received
      error: 'bg-red-50 text-red-700 border border-red-200',       // Rejected
      warning: 'bg-amber-50 text-amber-700 border border-amber-200',
      info: 'bg-blue-50 text-blue-700 border border-blue-200',
      pending: 'bg-slate-100 text-slate-600 border border-gray-200', // Pending
      neutral: 'bg-gray-50 text-gray-600 border border-gray-200'
    };
    return variants[this.variant] || variants['neutral'];
  }

  get dotColor(): string {
    const dots: Record<BadgeVariant, string> = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-amber-500',
      info: 'bg-blue-500',
      pending: 'bg-slate-500',
      neutral: 'bg-gray-500'
    };
    return dots[this.variant];
  }
}