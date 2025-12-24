import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { AlertCircle, Check, LucideAngularModule, Send } from 'lucide-angular';
import { ButtonGroupComponent, ButtonConfig } from '../button-group/button-group.component';

export interface FormField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'password' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date';
  selectData?: { value: any; display: string }[]; // For select, radio
  placeholder?: string;
  required?: boolean;
  icon?: any;
  initialValue?: any;
  minLength?: number;
  pattern?: string; // Regex string
  disabled?: boolean;
}

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, ButtonGroupComponent],
  templateUrl: './dynamic-form.component.html'
})
export class DynamicFormComponent implements OnInit {
  @Input() fields: FormField[] = [];
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() size: 'sm' | 'md' | 'lg' | 'full' = 'md';
  @Input() submitLabel: string = 'Save Changes';

  @Output() onSubmit = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter<void>();

  readonly alertIcon = AlertCircle;

  form!: FormGroup;
  formButtons: ButtonConfig[] = [];

  ngOnInit() {
    this.buildForm();
    this.buildButtons();
  }

  buildForm() {
    const group: any = {};
    this.fields.forEach(field => {
      const validators = [];

      // Custom handling for checkbox required (must be true)
      if (field.required) {
        field.type === 'checkbox'
          ? validators.push(Validators.requiredTrue)
          : validators.push(Validators.required);
      }

      if (field.minLength) validators.push(Validators.minLength(field.minLength));
      if (field.pattern) validators.push(Validators.pattern(field.pattern));

      // Default value for checkbox is false if not provided
      let val = field.initialValue;
      if (field.type === 'checkbox' && val === undefined) val = false;

      group[field.key] = new FormControl(
        { value: val ?? '', disabled: field.disabled || false },
        validators
      );
    });
    this.form = new FormGroup(group);
  }

  // Size helper for the container
  get containerSize(): string {
    const sizes = {
      sm: 'max-w-md mx-auto my-8 border border-gray-200 rounded-xl shadow-mb',
      md: 'max-w-2xl mx-auto my-8 border border-gray-200 rounded-xl shadow-mb',
      lg: 'max-w-4xl mx-auto my-8 border border-gray-200 rounded-xl shadow-mb',
      full: 'w-full min-h-screen'
    };
    return sizes[this.size];
  }

  buildButtons() {
    this.formButtons = [
      { label: 'Cancel', color: 'gray', size: 'md', action: () => this.onCancel.emit() },
      { label: this.submitLabel, color: 'indigo', size: 'md', icon: Check, action: () => this.submit() }
    ];
  }

  submit() {
    if (this.form.valid) {
      this.onSubmit.emit(this.form.getRawValue()); // getRawValue includes disabled fields
    } else {
      this.form.markAllAsTouched();
    }
  }

  getErrorMessage(field: FormField): string {
    const control = this.form.get(field.key);
    if (control?.hasError('required')) return `${field.label} is required`;
    if (control?.hasError('minlength')) return `Minimum ${field.minLength} characters required`;
    if (control?.hasError('pattern')) return `Invalid format for ${field.label}`;
    return '';
  }
}

// Example usage:

// In the template:
// <div class="max-w-md mx-auto mt-10">
//   <app-dynamic-form
//     [fields]="advancedFields"
//     submitLabel="Create Account"
//     (onSubmit)="handleFormSubmit($event)"
//     (onCancel)="closeModal()">
//   </app-dynamic-form>
// </div>

// In the component class:
// Define Configuration
// advancedFields: FormField[] = [
//   {
//     key: 'username',
//     label: 'Username',
//     type: 'text',
//     icon: User,
//     required: true,
//     minLength: 4
//   },
//   {
//     key: 'email',
//     label: 'Business Email',
//     type: 'email',
//     icon: Mail,
//     required: true,
//     pattern: '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'
//   },
//   {
//     key: 'bio',
//     label: 'Short Bio',
//     type: 'textarea',
//     placeholder: 'Tell us about yourself...'
//   },
//   {
//     key: 'id',
//     label: 'Internal ID',
//     type: 'text',
//     initialValue: 'USER-9901',
//     disabled: true
//   }
// ];

// handleFormSubmit(data: any) {
//   console.log('Advanced Form Data:', data);
// }

// closeModal(){
//   console.log('Modal closed');
// }