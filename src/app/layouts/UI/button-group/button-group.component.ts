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
  hidden?: boolean;
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
    const base = 'inline-flex items-center justify-center transition-colors duration-200 rounded disabled:opacity-50 disabled:cursor-not-allowed';

    const sizes = {
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-5 py-2 text-sm gap-2',
      lg: 'px-6 py-3 text-base gap-3'
    };

    const colors = {
      gray: 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50',
      indigo: 'bg-[#C7D2FE] text-[#4338CA] hover:bg-[#b5c2f8] font-semibold border border-[#C7D2FE]',
      orange: 'bg-[#D97706] text-white hover:bg-orange-700 font-semibold border border-[#D97706]',
      blue: 'bg-blue-600 text-white hover:bg-blue-700 font-semibold border border-blue-600',
      red: 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 font-semibold'
    };

    return `${base} ${sizes[btn.size]} ${colors[btn.color]}`;
  }

  getIconSize(size: string): number {
    return size === 'sm' ? 14 : size === 'md' ? 16 : 20;
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