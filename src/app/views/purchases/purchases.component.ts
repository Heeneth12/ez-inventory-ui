import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormsModule, ReactiveFormsModule } from '@angular/forms';

// Dummy Product DB for "Smart Autocomplete"
const PRODUCT_DB = [
  { name: 'iPhone 13 Pro Max', rate: 1099 },
  { name: 'Netflix Subscription', rate: 15 },
  { name: 'MacBook Pro M1', rate: 2400 },
  { name: 'Figma Professional', rate: 12 },
];

@Component({
  selector: 'app-purchases',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './purchases.component.html',
  styleUrl: './purchases.component.css',
  
})
export class PurchasesComponent {

  invoiceForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.invoiceForm = this.fb.group({
      invoiceNumber: ['MAG 2541420', Validators.required],
      issuedDate: [new Date().toISOString().substring(0, 10)],
      dueDate: [new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)],
      clientName: ['Sajib Rahman', Validators.required],
      clientEmail: ['rahmansajib@uihut.com', [Validators.required, Validators.email]],
      clientAddress: ['3471 Rainy Day Drive, Tulsa, USA'],
      items: this.fb.array([]),
    });

    // Start with 2 empty items for better UX
    this.addItem(); 
  }

  get items(): FormArray {
    return this.invoiceForm.get('items') as FormArray;
  }

  addItem(): void {
    const itemGroup = this.fb.group({
      itemName: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      rate: [0, [Validators.required, Validators.min(0)]],
      discount: [0, [Validators.min(0), Validators.max(100)]],
    });
    this.items.push(itemGroup);
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  // --- Advanced Feature: Smart Select ---
  selectProduct(index: number, product: any) {
    this.items.at(index).patchValue({
      itemName: product.name,
      rate: product.rate
    });
  }
  

  getRowTotal(index: number): number {
    const row = this.items.at(index).value;
    const sub = (row.quantity || 0) * (row.rate || 0);
    const discAmount = sub * ((row.discount || 0) / 100);
    return sub - discAmount;
  }

  get subTotal(): number {
    return this.items.controls.reduce((acc, _, i) => acc + this.getRowTotal(i), 0);
  }

  get taxAmount(): number {
    return this.subTotal * 0.10; 
  }

  get grandTotal(): number {
    return this.subTotal + this.taxAmount;
  }

}
