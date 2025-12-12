import { Component, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, ArrowLeft, Save, AlertCircle, CheckCircle2 } from 'lucide-angular';
import { DrawerService } from '../../../../layouts/components/drawer/drawerService';
import { LoaderService } from '../../../../layouts/components/loader/loaderService';
import { ToastService } from '../../../../layouts/components/toast/toastService';
import { InvoiceService } from '../../invoices/invoice.service';
import { SalesReturnService } from '../sales-return.service';
import { SalesReturnRequestModal } from '../sales-return.modal';
import { ContactModel } from '../../../contacts/contacts.model';
import { ContactService } from '../../../contacts/contacts.service';

@Component({
  selector: 'app-sales-returnform',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './sales-returnform.component.html',
  styleUrls: ['./sales-returnform.component.css'] 
})
export class SalesReturnformComponent implements OnInit {
  
  // Icons
  readonly SearchIcon = Search;
  readonly ArrowLeft = ArrowLeft;
  readonly Save = Save;
  readonly AlertCircle = AlertCircle;
  readonly CheckCircle2 = CheckCircle2;

  // State
  searchInvoiceId: string = '';
  invoiceData: any = null; 
  returnReason: string = '';

  // Contact details
  contactDetails: ContactModel | null = null;

  // Items Signal
  uiItems = signal<any[]>([]);

  // FIX 1: Computed signal for item count (Solves HTML error)
  selectedItemCount = computed(() => {
    return this.uiItems().filter(i => i.isSelected && i.returnQty > 0).length;
  });

  // Logic to calculate Estimated Refund
  totalRefundAmount = computed(() => {
    return this.uiItems().reduce((acc, item) => {
      if (item.isSelected && item.returnQty > 0) {
        return acc + (item.unitPrice * item.returnQty);
      }
      return acc;
    }, 0);
  });

  constructor(
    private salesReturnService: SalesReturnService,
    private invoiceService: InvoiceService,
    private contactService: ContactService,
    public drawerService: DrawerService,
    private toastSvc: ToastService,
    private router: Router,
    private loaderSvc: LoaderService
  ) {}

  ngOnInit(): void {}

  // Fetch Invoice Details
  searchInvoice() {
    if (!this.searchInvoiceId) {
      this.toastSvc.show('Please enter an Invoice ID', 'error');
      return;
    }
    
    // Reset state before new search
    this.invoiceData = null;
    this.contactDetails = null;
    this.uiItems.set([]);

    this.loaderSvc.show();
    this.invoiceService.getInvoiceById(
      Number(this.searchInvoiceId),
      (response: any) => {
        this.loaderSvc.hide();
        this.invoiceData = response.data; 

        // FIX 3: Fetch Contact Details immediately after Invoice is found
        // Assuming invoiceData has a 'customerId' or 'customer.id' field
        const customerId = this.invoiceData.customerId || this.invoiceData.customer?.id;
        if (customerId) {
            this.getContactDetails(customerId);
        }

        // Map items
        this.uiItems.set(this.invoiceData.items.map((item: any) => ({
          ...item,
          isSelected: false,
          returnQty: 0,
          maxQty: item.quantity 
        })));
      },
      (error: any) => {
        this.loaderSvc.hide();
        this.invoiceData = null;
        this.toastSvc.show('Invoice not found or error fetching details', 'error');
      }
    );
  }

  getContactDetails(contactId: number) {
    // Optional: Show loader if needed, or run in background
    this.contactService.getContactById(
      contactId,
      (response: any) => {
        this.contactDetails = response.data; 
      },
      (error: any) => {
        this.toastSvc.show('Error fetching contact details', 'error');
      }
    );
  } 

  // Toggle Item Selection
  toggleItem(item: any) {
    // 1. Mutate the item logic
    item.isSelected = !item.isSelected;
    if (item.isSelected && item.returnQty === 0) {
      item.returnQty = 1; 
    } else if (!item.isSelected) {
      item.returnQty = 0;
    }

    // FIX 2: Trigger Signal Update
    // We must spread the array [...v] so Angular knows the reference changed
    // This forces 'totalRefundAmount' and 'selectedItemCount' to re-calculate
    this.uiItems.update(v => [...v]);
  }

  // Validate Input
  validateQty(item: any) {
    if (item.returnQty > item.maxQty) {
      item.returnQty = item.maxQty;
      this.toastSvc.show(`Maximum return quantity is ${item.maxQty}`, 'warning');
    }
    if (item.returnQty < 0) item.returnQty = 0;

    // FIX 2: Trigger Signal Update (Required for Total calculation to update on typing)
    this.uiItems.update(v => [...v]);
  }

  createSalesReturn() {
    const itemsToReturn = this.uiItems()
      .filter(item => item.isSelected && item.returnQty > 0)
      .map(item => ({
        itemId: item.itemId || item.item.id, 
        quantity: item.returnQty
      }));

    if (itemsToReturn.length === 0) {
      this.toastSvc.show('Please select at least one item to return', 'error');
      return;
    }

    if (!this.returnReason) {
      this.toastSvc.show('Please provide a reason for the return', 'error');
      return;
    }

    const payload: SalesReturnRequestModal = {
      invoiceId: this.invoiceData.id,
      reason: this.returnReason,
      items: itemsToReturn
    };

    this.loaderSvc.show();
    this.salesReturnService.createSalesReturn(
      payload,
      (response: any) => {
        this.loaderSvc.hide();
        this.toastSvc.show('Sales Return processed successfully', 'success');
        this.router.navigate(['/sales/sales-returns/', response.id || response.data?.id]);
      },
      (error: any) => {
        this.loaderSvc.hide();
        this.toastSvc.show(error.message || 'Error processing Sales Return', 'error');
      }
    );
  }

  cancel() {
    this.router.navigate(['/sales/sales-returns']);
  }
}