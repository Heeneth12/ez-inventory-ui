import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemModel, ItemSearchFilter } from './models/Item.model';
import { ItemService } from './item.service';
import { Router } from '@angular/router';
import { ToastService } from '../../layouts/components/toast/toastService';
import { StandardTableComponent } from "../../layouts/components/standard-table/standard-table.component";
import { PaginationConfig, TableAction, TableActionConfig, TableColumn } from '../../layouts/components/standard-table/standard-table.model';
import { LoaderService } from '../../layouts/components/loader/loaderService';
import { ModalService } from '../../layouts/components/modal/modalService';
import { BulkUploadComponent } from '../../layouts/components/bulk-upload/bulk-upload.component';

@Component({
  selector: 'app-items',
  standalone: true,
  imports: [CommonModule, StandardTableComponent],
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.css']
})
export class ItemsComponent implements OnInit {

  itemList: ItemModel[] = [];
  itemFilter: ItemSearchFilter = new ItemSearchFilter();

  pagination: PaginationConfig = { pageSize: 15, currentPage: 1, totalItems: 0 };
  isLoading = false;
  selectedItemIds: (string | number)[] = [];

  columns: TableColumn[] = [
    { key: 'id', label: 'ID', width: '60px', align: 'center', type: 'text' },
    { key: 'name', label: 'Item Name', width: '230px', type: 'text' },
    { key: 'itemCode', label: 'Code', width: '110px', type: 'text' },
    { key: 'sku', label: 'SKU', width: '110px', type: 'text' },
    { key: 'itemType', label: 'Type', width: '100px', type: 'badge' },
    { key: 'unitOfMeasure', label: 'Unit', width: '90px', type: 'text' },
    { key: 'mrp', label: 'MRP', align: 'right', width: '110px', type: 'currency' },
    { key: 'purchasePrice', label: 'PP', align: 'right', width: '130px', type: 'currency' },
    { key: 'sellingPrice', label: 'SP', align: 'right', width: '110px', type: 'currency' },
    { key: 'hsnSacCode', label: 'HSN/SAC',align:"center",  width: '110px', type: 'text' },
    { key: 'isActive', label: 'Active', align: 'center', width: '80px', type: 'toggle' },
    { key: 'actions', label: 'Actions', align: 'center', width: '120px', type: 'action', sortable: false }
  ];

  constructor(
    private itemService: ItemService,
    private router: Router,
    private toastService: ToastService,
    private loaderSvc: LoaderService,
    private modalService: ModalService
  ) {
    this.itemFilter.active = true;
  }

  ngOnInit(): void {
    this.getAllItems();
  }

  getAllItems() {
    this.loaderSvc.show();
    const apiPage = this.pagination.currentPage > 0 ? this.pagination.currentPage - 1 : 0;
    this.itemService.getAllItems(
      apiPage,
      this.pagination.pageSize,
      this.itemFilter,
      (response: any) => {
        this.itemList = response.data.content;
        this.pagination = {
          currentPage: this.pagination.currentPage,
          totalItems: response.data.totalElements,
          pageSize: response.data.size
        };
        this.loaderSvc.hide();
      },
      (error: any) => {
        this.loaderSvc.hide();
        this.toastService.show('Failed to load Items', 'error');
        console.error('Error fetching items:', error);
      }
    );
  }

  toggleActiveStatus(item: ItemModel) {
    const originalStatus = !item.isActive;
    this.itemService.toggleItemActiveStatus(item.id, item.isActive,
      (response: any) => {
        this.toastService.show(`Item ${item.isActive ? 'enabled' : 'disabled'} successfully`, 'success');
      },
      (error: any) => {
        item.isActive = originalStatus;
        this.toastService.show('Failed to update item status', 'error');
      }
    );
  }

  createItem() {
    this.router.navigate(['/items/add']);
  }

  updateItem(itemId: string | number) {
    this.router.navigate(['/items/edit', itemId]);
  }

  onSelectionChange(selectedIds: (string | number)[]) {
    this.selectedItemIds = selectedIds;
    console.log("Current Selection:", this.selectedItemIds);
  }

  bulkUploadItems() {
    this.modalService.openComponent(BulkUploadComponent, 'full')
  }

  onTableAction(event: TableAction) {
    const { type, row, key } = event;

    switch (type) {
      case 'view':
        console.log("View:", row.id);
        this.bulkUploadItems()
        break;
      case 'edit':
        this.updateItem(row.id);
        break;
      case 'delete':
        console.log("Delete:", row.id);
        break;
      case 'toggle':
        this.toggleActiveStatus(row as ItemModel);
        break;
    }
  }

  onPageChange(newPage: number) {
    this.pagination = { ...this.pagination, currentPage: newPage };
    this.getAllItems();
  }
  
  onLoadMore() {
  }
}