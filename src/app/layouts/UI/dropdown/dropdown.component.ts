import { Component, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-block text-left w-full">
      <label *ngIf="label" class="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">{{ label }}</label>
      
      <button type="button" 
        (click)="toggle()"
        class="w-full flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm hover:border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-slate-700">
        <span class="truncate block mr-2">{{ selectedValue || placeholder }}</span>
        <svg class="w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200" [class.rotate-180]="isOpen" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>

      <div *ngIf="isOpen" class="absolute z-50 mt-1 w-full min-w-[200px] bg-white rounded-lg shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-100 origin-top-left">
        <div *ngIf="searchable" class="p-2 border-b border-gray-50">
           <input type="text" placeholder="Search..." class="w-full text-sm border-gray-200 rounded-md bg-gray-50 focus:bg-white focus:ring-blue-500">
        </div>

        <div class="max-h-60 overflow-y-auto py-1">
          <button *ngFor="let option of options" 
            (click)="select(option)"
            class="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-gray-50 hover:text-blue-600 flex items-center justify-between group">
            {{ option.label }}
            <svg *ngIf="option.value === selectedValue" class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          </button>
        </div>
      </div>
    </div>
  `
})
export class DropdownComponent {
  @Input() label = '';
  @Input() placeholder = 'Select option';
  @Input() options: { label: string, value: any }[] = [];
  @Input() selectedValue: any;
  @Input() searchable = false;
  @Output() selectionChange = new EventEmitter<any>();

  isOpen = false;

  constructor(private eRef: ElementRef) {}

  toggle() { this.isOpen = !this.isOpen; }

  select(option: any) {
    this.selectedValue = option.value;
    this.selectionChange.emit(option.value);
    this.isOpen = false;
  }

  // Close on click outside
  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if(!this.eRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }
}