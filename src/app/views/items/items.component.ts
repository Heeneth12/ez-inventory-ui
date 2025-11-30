import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemModel, ItemSearchFilter } from './models/Item.model';
import { ItemService } from './item.service';
import { Router } from '@angular/router';
import { ToastService } from '../../layouts/components/toast/toastService';
import { StandardTableComponent } from "../../layouts/components/standard-table/standard-table.component";
import { PaginationConfig, TableAction, TableColumn } from '../../layouts/components/standard-table/standard-table.model';

@Component({
  selector: 'app-items',
  standalone: true,
  imports: [CommonModule, StandardTableComponent],
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.css']
})
export class ItemsComponent implements OnInit {

  itemList: ItemModel[] = [];
  itemFilter:ItemSearchFilter = new ItemSearchFilter();
  

  pagination: PaginationConfig = { pageSize: 20, currentPage: 1, totalItems: 0 };

  columns: TableColumn[] = [
    { key: 'id', label: 'ID', width: '60px', align: 'center', type: 'text' },
    { key: 'name', label: 'Item Name', width: '230px', type: 'text' },
    { key: 'itemCode', label: 'Code', width: '110px', type: 'text' },
    { key: 'sku', label: 'SKU', width: '110px', type: 'text' },
    { key: 'itemType', label: 'Type', width: '100px', type: 'badge' },
    { key: 'unitOfMeasure', label: 'Unit', width: '90px', type: 'text' },
    { key: 'sellingPrice', label: 'Price', align: 'right', width: '110px', type: 'currency' },
    { key: 'hsnSacCode', label: 'HSN/SAC', width: '110px', type: 'text' },
    { key: 'isActive', label: 'Active', align: 'center', width: '80px', type: 'toggle' },
    { key: 'actions', label: 'Actions', align: 'center', width: '120px', type: 'action', sortable: false }
  ];

  page: number = 1;
  size: number = 10;
  tabs: any;

  constructor(
    private itemService: ItemService,
    private router: Router,
    private toastService: ToastService
  ) { 
    this.itemFilter.active = true;
  }

  ngOnInit(): void {
    this.getAllItems();
  }

  getAllItems() {
    this.itemService.getAllItems
      (this.page - 1, this.size, this.itemFilter, (response: any) => {
        this.itemList = response.data.content;
      }, (error: any) => {
        this.toastService.show('Failed to load Items', 'error');
        console.error('Error fetching items:', error);
      }
      );
  }

  toggleActiveStatus(item: ItemModel) {
    const updatedStatus = item.isActive;
    this.itemService.toggleItemActiveStatus(item.id, updatedStatus,
      (response: any) => {
        item.isActive = updatedStatus;
        this.toastService.show(`Item ${updatedStatus ? 'enabled' : 'disabled'} successfully`, 'success');
      },
      (error: any) => {
        this.toastService.show('Failed to update item status', 'error');
        console.error('Error updating item status:', error);
      }
    );
  }

  createItem() {
    this.router.navigate(['/items/add']);
  }

  updateItem(itemId: string | number) {
    this.router.navigate(['/items/edit', itemId]);
  }

  onTableAction(event: TableAction) {
    console.log("Table action event:", event);
    const { type, row, key } = event;

    switch (type) {

      case 'view':
        console.log("View action for item:", row.id);
        break;

      case 'edit':
        console.log("Edit action for item:", row.id);
        this.updateItem(row.id);
        break;

      case 'delete':
        console.log("Delete action for item:", row.id);
        break;

      case 'toggle': // enable/disable item
          console.log("Toggle active status for item:", row.id, "New status:");
          this.toggleActiveStatus(row as ItemModel);
        
        break;

      default:
        console.warn("Unhandled table action:", event);
    }
  }


  onPageChange($event: number) {
    throw new Error('Method not implemented.');
  }
  onLoadMore() {
    throw new Error('Method not implemented.');
  }


}
