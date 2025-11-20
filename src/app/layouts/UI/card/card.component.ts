import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div *ngIf="title" class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
        <h3 class="font-bold text-slate-800 text-lg">{{ title }}</h3>
        <ng-content select="[action]"></ng-content>
      </div>
      
      <div [class]="paddingClass">
        <ng-content></ng-content>
      </div>
      
      <div *ngIf="hasFooter" class="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <ng-content select="[footer]"></ng-content>
      </div>
    </div>
  `
})
export class CardComponent {
  @Input() title = '';
  @Input() noPadding = false;
  @Input() hasFooter = false;

  get paddingClass() {
    return this.noPadding ? '' : 'p-6';
  }
}