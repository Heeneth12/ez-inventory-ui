import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemModel, ItemSearchFilter } from './models/Item.model';
import { ItemService } from './item.service';
import { Router } from '@angular/router';
import { ToastService } from '../../layouts/components/toast/toastService';
import { StandardTableComponent } from "../../layouts/components/standard-table/standard-table.component";
import { HeaderAction, PaginationConfig, TableAction, TableActionConfig, TableColumn } from '../../layouts/components/standard-table/standard-table.model';
import { LoaderService } from '../../layouts/components/loader/loaderService';
import { ModalService } from '../../layouts/components/modal/modalService';
import { BulkUploadComponent } from '../../layouts/components/bulk-upload/bulk-upload.component';
import { ITEMS_COLUMNS } from '../../layouts/config/tableConfig';
import { CloudUpload } from 'lucide-angular';
import { DrawerService } from '../../layouts/components/drawer/drawerService';
import { FilterOption } from '../../layouts/UI/filter-dropdown/filter-dropdown.component';
import { AuthService } from '../../layouts/guards/auth.service';

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

  //tabel config
  columns: TableColumn[] = ITEMS_COLUMNS;
  headerActions: HeaderAction[] = [
    {
      label: 'Bulk Process',
      icon: CloudUpload,
      variant: 'primary',
      key: 'create_route',
      action: () => this.bulkUploadItems(),
      hidden: !this.authService.hasPermission('EZH_INV_ITEMS_EXPORT')
    }
  ];

  filterConfig: FilterOption[] = [
    {
      id: 'type',
      label: 'Type',
      type: 'checkbox',
      searchable: true,
      options: [
        { label: 'PRODUCT', value: 'PRODUCT' },
        { label: 'SERVICE', value: 'SERVICE' },
        { label: 'OTHER', value: 'OTHER' }
      ]
    }
  ];

  constructor(
    private itemService: ItemService,
    private router: Router,
    private toastService: ToastService,
    private loaderSvc: LoaderService,
    private drawerSvc: DrawerService,
    private modalService: ModalService,
    private authService: AuthService
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
    this.drawerSvc.openComponent(BulkUploadComponent,
      {},
      "Bulk Data Management",
      'lg'
    )
  }

  onFilterUpdate($event: Record<string, any>) {
    console.log("Received filter update:", $event);
    this.itemFilter.itemTypes = $event['type'] || null;
    this.getAllItems();
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

  handleHeaderAction(event: HeaderAction) {
    if (event.key === 'create_route') {
    }
  }


  onPageChange(newPage: number) {
    this.pagination = { ...this.pagination, currentPage: newPage };
    this.getAllItems();
  }

  onLoadMore() {
  }
}