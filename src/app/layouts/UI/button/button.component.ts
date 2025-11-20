import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-btn',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      [class]="classes"
      class="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
      <span *ngIf="icon" class="mr-2 -ml-1">
         <ng-content select="[icon]"></ng-content>
      </span>
      <ng-content></ng-content>
    </button>
  `
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'outline' | 'danger' = 'primary';
  @Input() icon = false;

  get classes(): string {
    const base = {
      primary: 'bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-900',
      secondary: 'bg-white text-slate-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-200',
      outline: 'bg-transparent text-slate-600 border border-transparent hover:bg-gray-100',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
    };
    return base[this.variant];
  }
}