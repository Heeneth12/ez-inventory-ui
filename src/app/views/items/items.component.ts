import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
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
import { CloudUpload, List, LucideAngularModule } from 'lucide-angular';
import { DrawerService } from '../../layouts/components/drawer/drawerService';
import { FilterOption } from '../../layouts/UI/filter-dropdown/filter-dropdown.component';
import { AuthService } from '../../layouts/guards/auth.service';
import { debounceTime, Subject } from 'rxjs';
import { BatchDetailModel, ItemStockSearchModel } from '../stock/models/stock.model';
import { StockService } from '../stock/stock.service';

@Component({
  selector: 'app-items',
  standalone: true,
  imports: [CommonModule, StandardTableComponent, LucideAngularModule],
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.css']
})
export class ItemsComponent implements OnInit {

  private tableState$ = new Subject<void>();
  @ViewChild('stockItemDetail') stockItemDetail!: TemplateRef<any>;

  selectedItemDetail: ItemStockSearchModel | null = null;
  selectedMasterItem: ItemModel | null = null;
  stockFilter: any = {};

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
      variant: 'secondary',
      key: 'bulk_process',
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


  itemActions: TableActionConfig[] = [
    {
      key: 'view_item_details',
      label: '',
      icon: List,
      color: 'primary',
      condition: (row) => true
    }
  ];

  constructor(
    private itemService: ItemService,
    private router: Router,
    private toastService: ToastService,
    private loaderSvc: LoaderService,
    private drawerSvc: DrawerService,
    private modalService: ModalService,
    private authService: AuthService,
    private stockService: StockService,
  ) {
    this.itemFilter.active = true;
  }

  ngOnInit(): void {
    this.setupTablePipeline();
    this.tableState$.next();
  }

  private setupTablePipeline() {
    this.tableState$.pipe(
      debounceTime(300),
    ).subscribe(() => {
      this.getAllItems();
    });
  }

  getAllItems() {
    this.isLoading = true;
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
        this.isLoading = false;
      },
      (error: any) => {
        this.isLoading = false;
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

  onSearchChange(searchQuery: string) {
    this.itemFilter.searchQuery = searchQuery;
    this.pagination.currentPage = 1;
    this.tableState$.next();
  }

  createItem() {
    this.router.navigate(['/items/add']);
  }

  updateItem(itemId: string | number) {
    this.drawerSvc.close();
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

  handleTableAction(event: TableAction) {
    if (event.type === 'custom' && event.key === 'view_item_details') {
      this.viewItemDetails(event.row as ItemModel);
    }
  }


  viewItemDetails(item: ItemModel) {
    this.selectedMasterItem = item;
    this.selectedItemDetail = null;
    this.loaderSvc.show();

    this.stockFilter.itemId = item.id;
    this.stockFilter.warehouseId = 1;
    this.stockService.searchItems(this.stockFilter, (response: any) => {
      this.loaderSvc.hide();
      const data = response?.data || [];
      if (data.length > 0) {
        this.selectedItemDetail = data[0];
      }
      console.log("Selected Item Detail", this.selectedItemDetail);
      this.drawerSvc.openTemplate(this.stockItemDetail, "Full Item Inventory", 'lg');
    }, (error: any) => {
      this.loaderSvc.hide();
      this.toastService.show('Error loading stock', 'error');
    });
  }

  calculateTotalStock(batches: BatchDetailModel[]): number {
    return batches ? batches.reduce((acc, b) => acc + b.remainingQty, 0) : 0;
  }

  getDaysRemainingText(timestamp: number): string {
    const diff = timestamp - Date.now();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} days left` : 'Expired';
  }

  getExpiryStatusColor(timestamp: number, type: 'text' | 'bg'): string {
    const diff = timestamp - Date.now();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return type === 'text' ? 'text-red-600' : 'bg-red-100';
    if (days < 30) return type === 'text' ? 'text-amber-600' : 'bg-amber-100';
    return type === 'text' ? 'text-emerald-600' : 'bg-emerald-100';
  }

  closeItemDetails() {
    this.drawerSvc.close();
  }

  onFilterUpdate($event: Record<string, any>) {
    this.itemFilter.itemTypes = $event['type'] || null;
    this.tableState$.next();
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
    this.tableState$.next();
  }

  onLoadMore() {
  }
}