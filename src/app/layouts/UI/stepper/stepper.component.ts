import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideAngularModule } from "lucide-angular";

export interface StepConfig {
  key: string;// Unique ID for the step
  label: string;
  description?: string;
  icon: any;
  state: 'pending' | 'active' | 'completed';
  disabled?: boolean;
}

@Component({
  selector: 'app-stepper',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.css'
})
export class StepperComponent {

  @Input() steps: StepConfig[] = [];
  @Input() activeColor: string = 'bg-indigo-600';
  @Output() stepClick = new EventEmitter<StepConfig>();

  onStepClick(step: StepConfig) {
    if (!step.disabled) {
      this.stepClick.emit(step);
    }
  }

  getStepClasses(step: StepConfig, index: number): string {
    const isLast = index === this.steps.length - 1;
    let classes = 'relative flex items-center group ';
    if (!isLast) classes += 'flex-1 ';
    return classes;
  }

}


// Example usage:

// In the template:
//<app-stepper [steps]="steps" (stepClick)="handleStepChange($event)"></app-stepper>


// In the component class:
// currentStep = 0;
// steps: StepConfig[] = [
//   { key: 'info', label: 'Basic Info', icon: User, state: 'active' },
//   { key: 'contact', label: 'Contact', icon: Phone, state: 'pending', disabled: true },
//   { key: 'review', label: 'Review', icon: Eye, state: 'pending', disabled: true }
// ];

// handleStepChange(step: StepConfig) {
//   // Logic to switch form views
//   console.log('Switching to:', step.key);
// }

//Example: Moving to next step after form submit
// goToNext() {
//   this.steps[this.currentStep].state = 'completed';
//   this.currentStep++;
//   this.steps[this.currentStep].state = 'active';
//   this.steps[this.currentStep].disabled = false;
// }
