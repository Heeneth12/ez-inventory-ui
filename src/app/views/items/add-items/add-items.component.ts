import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-items',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-items.component.html',
  styleUrl: './add-items.component.css'
})
export class AddItemsComponent {


  itemForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.itemForm = this.fb.group({
      type: ['goods'],
      name: ['', Validators.required],
      sku: [''],
      unit: ['', Validators.required],
      returnable: [true],
      salesEnabled: [true],
      purchaseEnabled: [true],
      trackInventory: [true]
    });
  }

  ngOnInit(): void { }

  onSubmit() {
    if (this.itemForm.valid) {
      console.log('Form Submitted:', this.itemForm.value);
    } else {
      console.log('Form Invalid');
    }
  }

}
