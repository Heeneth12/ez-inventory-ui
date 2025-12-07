import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoaderService } from '../../../layouts/components/loader/loaderService';
import { ModalService } from '../../../layouts/components/modal/modalService';
import { PaginationConfig, TableAction, TableColumn } from '../../../layouts/components/standard-table/standard-table.model';
import { ToastService } from '../../../layouts/components/toast/toastService';
import { PurchaseService } from '../purchase.service';
import { PurchaseReturnModel } from '../models/purchase-return.model';
import { StandardTableComponent } from "../../../layouts/components/standard-table/standard-table.component";

@Component({
  selector: 'app-purchase-returns',
  standalone: true,
  imports: [CommonModule, StandardTableComponent],
  templateUrl: './purchase-returns.component.html',
  styleUrl: './purchase-returns.component.css'
})
export class PurchaseReturnsComponent {

  purchaseReturnList: PurchaseReturnModel[] = [];

  pagination: PaginationConfig = { pageSize: 15, currentPage: 1, totalItems: 0 };
  isLoading = false;
  selectedItemIds: (string | number)[] = [];

  columns: TableColumn[] = [
    { key: 'orderNumber', label: 'Order number', width: '100px', type: 'link' },
    { key: 'supplierName', label: 'Supplier', width: '110px', type: 'text' },
    { key: 'status', label: 'status', width: '100px', type: 'badge' },
    { key: 'totalAmount', label: 'TotalAmount', width: '110px', type: 'currency' },
    { key: 'id', label: 'Grn', width: '150px', type: 'link' },
    { key: 'actions', label: 'Actions', align: 'center', width: '120px', type: 'action', sortable: false }
  ];
  purchaseOrderList: any;

  constructor(
    private purchaseService: PurchaseService,
    private router: Router,
    private modalService: ModalService,
    private toastService: ToastService,
    private loaderSvc: LoaderService
  ) {
  }

  


  onSelectionChange(selectedIds: (string | number)[]) {
    this.selectedItemIds = selectedIds;
    console.log("Current Selection:", this.selectedItemIds);
  }

  onTableAction(event: TableAction) {
    const { type, row, key } = event;

    switch (type) {
      case 'view':
        console.log("View:", row.id);
        break;
      case 'edit':
        console.log("sdsd")
        break;
      case 'delete':
        console.log("Delete:", row.id);
        break;
      case 'toggle':
        break;
    }
  }

  onPageChange(newPage: number) {
    this.pagination = { ...this.pagination, currentPage: newPage };
  }

  onLoadMore() {
  }

}
