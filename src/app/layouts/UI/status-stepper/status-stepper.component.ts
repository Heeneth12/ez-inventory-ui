import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Package, Receipt, Truck, CreditCard } from 'lucide-angular';

@Component({
  selector: 'app-status-stepper',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './status-stepper.component.html',
})
export class StatusStepperComponent {
  
  @Input() completedStepCount: number = 2;

  steps = [
    { label: 'Ordered', icon: Package },
    { label: 'Billed', icon: Receipt },
    { label: 'Delivered', icon: Truck },
    { label: 'Paid', icon: CreditCard },
  ];
}