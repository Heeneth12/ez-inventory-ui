import { Component } from '@angular/core';
import { StandardTableComponent } from "../../layouts/components/standard-table/standard-table.component";
import { Router } from '@angular/router';
import { PaginationConfig, TableColumn } from '../../layouts/components/standard-table/standard-table.model';
import { ToastService } from '../../layouts/components/toast/toastService';
import { ItemService } from '../items/item.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [StandardTableComponent],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css'
})
export class InventoryComponent {

  
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
  ) { }

}
