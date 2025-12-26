import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

export interface ButtonConfig {
  label: string;
  icon?: any; // Uses Lucide icon names
  color: 'blue' | 'gray' | 'orange' | 'red' | 'indigo';
  size: 'sm' | 'md' | 'lg';
  action: () => void;
  disabled?: boolean;
}

@Component({
  selector: 'app-button-group',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './button-group.component.html'
})
export class ButtonGroupComponent {
  
  @Input() buttons: ButtonConfig[] = [];

  getButtonClasses(btn: ButtonConfig): string {
    const base = 'inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-lg active:scale-95 disabled:opacity-50 disabled:pointer-events-none';

    const sizes = {
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-5 py-2.5 text-sm gap-2',
      lg: 'px-8 py-3.5 text-base gap-3'
    };

    const colors = {
      blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100 ring-1 ring-inset ring-blue-700/10',
      gray: 'bg-white text-slate-700 hover:bg-slate-50 ring-1 ring-inset ring-slate-300 shadow-sm',
      orange: 'bg-orange-50 text-orange-700 hover:bg-orange-100 ring-1 ring-inset ring-orange-700/10',
      red: 'bg-red-50 text-red-700 hover:bg-red-100 ring-1 ring-inset ring-red-700/10',
      indigo: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200'
    };

    return `${base} ${sizes[btn.size]} ${colors[btn.color]}`;
  }

  getIconSize(size: string): number {
    return size === 'sm' ? 14 : size === 'md' ? 18 : 22;
  }
}

//Example usage in another component:

// In the component TS file:
// buttons: ButtonConfig[] = [
//   {
//     label: 'Cancel',
//     icon: X, 
//     color: 'red',
//     size: 'md',
//     action: () => console.log('Close modal'),
//     disabled: false
//   },
//   {
//     label: 'Save Changes',
//     icon: ClipboardList,
//     color: 'blue',
//     size: 'md',
//     action: () => console.log('Save changes')
//   }
// ];

// In template:
// <app-button-group [buttons]="buttons"></app-button-group>