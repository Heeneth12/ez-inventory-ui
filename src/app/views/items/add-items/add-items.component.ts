import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemService } from '../item.service';
import { ItemModel } from '../models/Item.model';

@Component({
  selector: 'app-add-items',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-items.component.html',
  styleUrl: './add-items.component.css'
})
export class AddItemsComponent implements OnInit {

  itemForm: FormGroup;
  isEditMode = false;
  itemId: string | null = null;
  categories = ['Electronics', 'Furniture', 'Stationery', 'Raw Material'];
  units = ['pcs', 'kg', 'ltr', 'box', 'm'];
  constructor(
    private fb: FormBuilder,
    private itemService: ItemService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.itemForm = this.fb.group({
      // -- General Info --
      id: [],
      name: ['', Validators.required],
      itemCode: ['', Validators.required], // Mandatory
      itemType: ['PRODUCT', Validators.required], // Note casing matches model
      isActive: [true],
      description: [''],
      imageUrl: [''],
      sku: [''],
      barcode: [''],
      hsnSacCode: [''],
      category: ['', Validators.required], // Mandatory
      unitOfMeasure: ['', Validators.required], // Mandatory
      brand: [''],
      manufacturer: [''],
      purchasePrice: [0, [Validators.required, Validators.min(0)]],
      sellingPrice: [0, [Validators.required, Validators.min(0)]],
      mrp: [null, [Validators.min(0)]], 
      taxPercentage: [0, [Validators.min(0), Validators.max(100)]],
      discountPercentage: [0, [Validators.min(0), Validators.max(100)]]
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.itemId = params.get('id');
      if (this.itemId) {
        this.isEditMode = true;
        this.loadItemData(this.itemId);
      } else {
        // Generate a random Item Code for new items for UX convenience
        this.itemForm.patchValue({ itemCode: 'ITM-' + Math.floor(1000 + Math.random() * 9000) });
      }
    });
  }

  loadItemData(id: string) {
    this.itemService.getItemById(id,
      (res: any) => {
        if (res.data) {
          // Patch specifically to ensure type safety if backend returns extra fields
          const data = res.data;
          this.itemForm.patchValue({
            id: data.id,
            name: data.name,
            itemCode: data.itemCode,
            itemType: data.itemType,
            isActive: data.isActive,
            description: data.description,
            imageUrl: data.imageUrl,
            sku: data.sku,
            barcode: data.barcode,
            hsnSacCode: data.hsnSacCode,
            category: data.category,
            unitOfMeasure: data.unitOfMeasure,
            brand: data.brand,
            manufacturer: data.manufacturer,
            purchasePrice: data.purchasePrice,
            sellingPrice: data.sellingPrice,
            mrp: data.mrp,
            taxPercentage: data.taxPercentage,
            discountPercentage: data.discountPercentage
          });
        }
      },
      (err: any) => console.error('Error loading item:', err)
    );
  }

  onSubmit() {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    const itemModel: ItemModel = this.itemForm.value;

    if (this.isEditMode && this.itemId) {
      this.itemService.updateItem(this.itemId, itemModel,
        () => this.router.navigate(['/items']),
        (err: any) => console.error('Error updating:', err)
      );
    } else {
      this.itemService.createItem(itemModel,
        () => this.router.navigate(['/items']),
        (err: any) => console.error('Error creating:', err)
      );
    }
  }

  onCancel() {
    this.router.navigate(['/items']);
  }
}
