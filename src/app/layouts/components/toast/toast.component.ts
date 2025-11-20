import { Component } from '@angular/core';
import { ToastService } from './toastService';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css'
})
export class ToastComponent {
  
  constructor(public toastService: ToastService) { }

  getBorderClass(type: string): string {
    switch (type) {
      case 'success': return 'border-l-4 border-l-green-500';
      case 'error': return 'border-l-4 border-l-red-500';
      case 'warning': return 'border-l-4 border-l-amber-500';
      default: return 'border-l-4 border-l-blue-500';
    }
  }
}
