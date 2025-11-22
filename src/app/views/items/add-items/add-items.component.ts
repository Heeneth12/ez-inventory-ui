import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemService } from '../item.service';

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

  constructor(
    private fb: FormBuilder,
    private itemService: ItemService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.itemForm = this.fb.group({
      name: ['', Validators.required],
      type: ['PRODUCT', Validators.required], // 'PRODUCT' or 'SERVICE'
      sku: [''],
      itemCode: [''], // Added as it is in ItemModel
      unitOfMeasure: ['', Validators.required], // Changed from 'unit' to match model
      category: [''],
      sellingPrice: [0, [Validators.required, Validators.min(0)]],
      purchasePrice: [0, [Validators.required, Validators.min(0)]],
      openingStock: [0],
      description: [''],
      taxPercentage: [0],
      isActive: [true],
      // Helper controls for UI logic (not directly in ItemModel but useful)
      salesEnabled: [true],
      purchaseEnabled: [true],
      trackInventory: [true]
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.itemId = params.get('id');
      if (this.itemId) {
        this.isEditMode = true;
        this.loadItemData(this.itemId);
      }
    });
  }

  loadItemData(id: string) {
    this.itemService.getItemById(id,
      (res: any) => {
        if (res.data) {
          const item = res.data;
          this.itemForm.patchValue({
            name: item.name,
            type: item.type,
            sku: item.sku,
            itemCode: item.itemCode,
            unitOfMeasure: item.unitOfMeasure,
            category: item.category,
            sellingPrice: item.sellingPrice,
            purchasePrice: item.purchasePrice,
            openingStock: item.openingStock,
            description: item.description,
            taxPercentage: item.taxPercentage,
            isActive: item.isActive,
            // Set helper controls based on data presence if needed, or default
            salesEnabled: !!item.sellingPrice,
            purchaseEnabled: !!item.purchasePrice,
            trackInventory: !!item.openingStock
          });
        }
      },
      (err: any) => {
        console.error('Error loading item:', err);
      }
    );
  }

  onSubmit() {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    const itemData = this.itemForm.value;
    // Map UI helper fields back to model if necessary or just clean up
    // For now, we send the form value. Ensure backend ignores unknown fields or we clean them.
    // We might want to explicitly map to ItemModel to be safe.
    const itemModel: any = {
      ...itemData,
      // Ensure type is correct enum string if needed
    };

    if (this.isEditMode && this.itemId) {
      this.itemService.updateItem(this.itemId, itemModel,
        (res: any) => {
          console.log('Item updated:', res);
          this.router.navigate(['/items']);
        },
        (err: any) => {
          console.error('Error updating item:', err);
        }
      );
    } else {
      this.itemService.createItem(itemModel,
        (res: any) => {
          console.log('Item created:', res);
          this.router.navigate(['/items']);
        },
        (err: any) => {
          console.error('Error creating item:', err);
        }
      );
    }
  }

  onCancel() {
    this.router.navigate(['/items']);
  }
}
