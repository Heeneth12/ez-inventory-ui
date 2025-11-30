import { Component } from '@angular/core';
import { EmployeeService } from '../employee.service';
import { EmployeeModel, EmployeeRole } from '../employee.model';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../layouts/components/toast/toastService';
import { AddressType } from '../../contacts/contacts.model';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.css'
})
export class EmployeeFormComponent {
 employeeForm!: FormGroup;
  isEditMode = false;
  employeeId: number | null = null;
  isLoading = false;

  // Convert Enum to array for dropdown
  roles = Object.values(EmployeeRole);

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    // Check route params to determine if we are in Create or Update mode
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.employeeId = +id;
        this.loadEmployee(this.employeeId);
      }
    });
  }

  private initForm(): void {
    this.employeeForm = this.fb.group({
      id: [null], // Hidden ID field
      employeeCode: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      gender: ['', Validators.required],
      role: ['', Validators.required],
      officialEmail: ['', [Validators.required, Validators.email]],
      personalEmail: ['', Validators.email],
      contactNumber: ['', Validators.required],
      active: [true],
      // Nested Address Group
      address: this.fb.group({
        addressLine1: [''],
        addressLine2: [''],
        city: [''],
        state: [''],
        country: [''],
        pinCode: [''],
        type: [AddressType.HOME]
      })
    });
  }

  loadEmployee(id: number): void {
    this.isLoading = true;
    this.employeeService.getEmployeeById(
      id,
      (response: any) => {
        this.isLoading = false;
        // Patch the form with data from the API
        this.employeeForm.patchValue(response.data);
      },
      (error: any) => {
        this.isLoading = false;
        console.error('Error fetching employee', error);
        alert('Failed to load employee details.');
        this.onCancel();
      }
    );
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const employeeData = this.employeeForm.value;

    if (this.isEditMode && this.employeeId) {
      this.updateEmployee(this.employeeId, employeeData);
    } else {
      this.createEmployee(employeeData);
    }
  }

  createEmployee(data: EmployeeModel): void {
    this.employeeService.createEmployee(
      data,
      (res: any) => {
        this.isLoading = false;
        alert('Employee created successfully! (Simulated)');
        this.toastService.show('Employee created successfully!', 'success');
        this.employeeForm.reset();
        this.initForm(); // Reset form state
      },
      (err: any) => {
        this.isLoading = false;
        console.error('Error creating employee', err);
        this.toastService.show('Failed to create employee.', 'error');
      }
    );
  }

  updateEmployee(id: number, data: EmployeeModel): void {
    this.employeeService.updateEmployee(
      id,
      data,
      (response: any) => {
        this.isLoading = false;
        this.toastService.show('Employee updated successfully!', 'success');
      },
      (err: any) => {
        this.isLoading = false;
        console.error('Error updating employee', err);
        this.toastService.show('Failed to update employee.', 'error');
      }
    );
  }

  onCancel(): void {
    // Navigate back to the previous page
    // this.router.navigate(['..'], { relativeTo: this.route });
    alert('Cancelled action (Simulated navigation)');
  }

  // Helper for template validation feedback
  isFieldInvalid(fieldName: string): boolean {
    const field = this.employeeForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  // Helper to format enum values for display
  formatRole(role: string): string {
    return role.replace(/_/g, ' ');
  }
}