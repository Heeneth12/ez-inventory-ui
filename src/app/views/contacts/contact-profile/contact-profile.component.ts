import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, JsonPipe } from '@angular/common';
import { ContactService } from '../contacts.service';
import { ToastService } from '../../../layouts/components/toast/toastService';
import { ContactModel } from '../contacts.model';
import { LucideAngularModule, Mail, MapPin, Phone, Building, FileText, ShoppingCart, CreditCard, StickyNote, ArrowUpRight, ArrowDownLeft, Clock, Home, Bell, Calendar, ChevronDown, Fingerprint, HelpCircle, Pencil, User, Users, UserSquare, LocateIcon, MapPinCheckIcon, Hash, Plus, Star, ArrowRight, CircleX, FilePlusCorner, ScrollText, ReceiptIndianRupee, FileDown } from 'lucide-angular';
import { SalesOrderFilterModal, SalesOrderModal } from '../../sales/sales-order/sales-order.modal';
import { InvoiceFilterModal, InvoiceModal } from '../../sales/invoices/invoice.modal';
import { PaymentFilterModal, PaymentModal } from '../../sales/payments/payment.modal';
import { StandardTableComponent } from "../../../layouts/components/standard-table/standard-table.component";
import { HeaderAction, PaginationConfig, TableAction, TableActionConfig, TableColumn } from '../../../layouts/components/standard-table/standard-table.model';
import { INVOICE_COLUMNS, PAYMENTS_COLUMNS, SALES_ORDER_COLUMNS } from '../../../layouts/config/tableConfig';
import { PaymentService } from '../../sales/payments/payment.service';
import { LoaderService } from '../../../layouts/components/loader/loaderService';
import { SalesOrderService } from '../../sales/sales-order/sales-order.service';
import { InvoiceService } from '../../sales/invoices/invoice.service';
import { ModalService } from '../../../layouts/components/modal/modalService';
import { PaymentSymmaryComponent } from '../../sales/payments/payment-symmary/payment-symmary.component';
import { DatePickerConfig, DateRangeEmit } from '../../../layouts/UI/date-picker/date-picker.component';
import { StockAdjustmentComponent } from '../../stock/stock-adjustment/stock-adjustment.component';

@Component({
  selector: 'app-contact-profile',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, StandardTableComponent],
  templateUrl: './contact-profile.component.html',
})
export class ContactProfileComponent implements OnInit {

  //contactDetails
  contactId: number = 0;


  //salesOrder
  soColumn: TableColumn[] = SALES_ORDER_COLUMNS;
  salesOrderDetails: SalesOrderModal[] = [];
  salesOrderDetail: SalesOrderModal | null = null;
  salesOrderFilter: SalesOrderFilterModal = new SalesOrderFilterModal();
  soActions: TableActionConfig[] = [
    {
      key: 'move_to_invoice',
      label: 'Move to Invoice',
      icon: ArrowRight,
      color: 'primary',
      condition: (row) => row['status'] === 'CREATED' || row['status'] === 'CONFIRMED'
    },
    {
      key: 'move_to_cancle',
      label: '',
      icon: CircleX,
      color: 'danger',
      condition: (row) => row['status'] === 'CREATED' || row['status'] === 'CONFIRMED'
    }
  ];

  soHeaderActions: HeaderAction[] = [
    {
      label: 'Create',
      icon: FilePlusCorner,
      variant: 'primary',
      action: () => console.log("hello")
    },
  ];

  //Invoice
  invoiceColumn: TableColumn[] = INVOICE_COLUMNS;
  invoiceDetails: InvoiceModal[] = [];
  invoiceDetail: InvoiceModal | null = null;
  invoiceFilter: InvoiceFilterModal = new InvoiceFilterModal();
  paymentDetailsActions: TableActionConfig[] = [
    {
      key: 'payment_details',
      label: 'Payment details',
      icon: ScrollText,
      color: 'success',
      condition: (row) => row['paymentStatus'] === 'PAID'
    },
    {
      key: 'receive_payment',
      label: 'Receive Payment',
      icon: ReceiptIndianRupee,
      color: 'primary',
      condition: (row) => row['paymentStatus'] === 'UNPAID' || row['paymentStatus'] === 'PARTIALLY_PAID'
    },
    {
      key: 'download_invoice',
      label: '',
      icon: FileDown,
      color: 'neutral',
      condition: (row) => true
    }
  ];



  //payment
  paymentColumn: TableColumn[] = PAYMENTS_COLUMNS;
  paymentDetails: PaymentModal[] = [];
  paymentDetail: PaymentModal | null = null;
  paymentFilter: PaymentFilterModal = new PaymentFilterModal();


  financialSummary: any = {
    totalOutstandingAmount: 0,
    walletBalance: 0
  };


  pagination: PaginationConfig = { pageSize: 10, currentPage: 1, totalItems: 0 };
  selectedItemIds: (string | number)[] = [];



  contactDetails: ContactModel | null = null;
  activeTab: string = 'overview';
  isLoading = true;

  // Icons
  readonly Mail = Mail;
  readonly MapPin = MapPin;
  readonly Phone = Phone;
  readonly Building = Building;
  readonly FileText = FileText;
  readonly ShoppingCart = ShoppingCart;
  readonly CreditCard = CreditCard;
  readonly StickyNote = StickyNote;
  readonly ArrowUpRight = ArrowUpRight;
  readonly ArrowDownLeft = ArrowDownLeft;
  readonly Clock = Clock;
  readonly Home = Home;
  readonly Users = Users;
  readonly Location = MapPinCheckIcon
  readonly ChevronDown = ChevronDown;
  readonly UserSquare = UserSquare;
  readonly Pencil = Pencil;
  readonly User = User;
  readonly Fingerprint = Fingerprint;
  readonly Calendar = Calendar;
  readonly Hash = Hash;
  readonly Plus = Plus;
  readonly Star = Star;

  dateConfig: DatePickerConfig = {
    type: 'both',
    placeholder: 'Start - End'
  };

  // Mock Financial Data (Replace with real API data later)
  financialStats = {
    balance: 12450.00,
    overdue: 2100.00,
    creditLimit: 50000.00,
    unusedCredits: 450.00,
    totalSales: 154000.00, // For Customer
    totalPurchases: 89000.00 // For Vendor
  };


  // Add a dummy data method or object for the overview if API isn't ready
  overviewStats = {
    totalSales: 425000,
    avgPaymentDays: 18,
    openInvoices: 4,
    lastActivity: '2 Days ago'
  };

  constructor(
    private contactService: ContactService,
    private salesOrderService: SalesOrderService,
    private invoiceService: InvoiceService,
    private paymentService: PaymentService,
    private toast: ToastService,
    private router: Router,
    private modalService: ModalService,
    private loaderSvc: LoaderService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.contactId = Number(id);
      this.getContactDetails(this.contactId);
      this.getFinancialSummary(this.contactId); // Fetch live stats
      if (this.activeTab === 'overview') {
        this.onTabChange('overview');
      }
    }
  }

  getContactDetails(id: number) {
    this.isLoading = true;
    this.contactService.getContactById(id,
      (response: any) => {
        this.contactDetails = response.data;
        this.isLoading = false;
      },
      (error: any) => {
        this.toast.show('Failed to load contact details.', 'error');
        this.isLoading = false;
      }
    );
  }

  getFinancialSummary(id: number) {
    this.paymentService.getCustomerSummary(id,
      (res: any) => {
        this.financialSummary = res.data;
      },
      (err: any) => console.error("Could not load summary", err)
    );
  }

  onTabChange(tabId: string) {
    this.activeTab = tabId;
    if (tabId === "sales_orders") {
      this.getAllSalesOrders();
    } else if (tabId === "invoices") {
      this.getAllInvoices();
    } else if (tabId === "payments") {
      this.getAllPayments();
    }

    // NEW: Logic for Highcharts Overview
    if (tabId === 'overview') {
      // Use setTimeout(0) to wait for Angular to render the @if block
    }
  }

  //salesOrder 
  getAllSalesOrders() {
    this.salesOrderFilter.customerId = this.contactId;
    this.loaderSvc.show();
    const apiPage = this.pagination.currentPage > 0 ? this.pagination.currentPage - 1 : 0;
    this.salesOrderService.getAllSalesOrders(
      apiPage,
      this.pagination.pageSize,
      this.salesOrderFilter,
      (response: any) => {
        this.salesOrderDetails = response.data.content;
        this.pagination = {
          currentPage: this.pagination.currentPage,
          totalItems: response.data.totalElements,
          pageSize: response.data.size
        };
        this.loaderSvc.hide();
      },
      (error: any) => {
        this.loaderSvc.hide();
        this.toast.show('Failed to load Items', 'error');
      }
    );
  }

  //invoice
  getAllInvoices() {
    this.invoiceFilter.customerId = this.contactId;
    this.loaderSvc.show();
    const apiPage = this.pagination.currentPage > 0 ? this.pagination.currentPage - 1 : 0;
    this.invoiceService.getInvoices(
      apiPage,
      this.pagination.pageSize,
      this.invoiceFilter,
      (response: any) => {
        this.invoiceDetails = response.data.content;
        this.pagination = {
          currentPage: this.pagination.currentPage,
          totalItems: response.data.totalElements,
          pageSize: response.data.size
        };
        this.loaderSvc.hide();
      },
      (error: any) => {
        this.loaderSvc.hide();
        this.toast.show('Failed to load Items', 'error');
      }
    );
  }

  //payment
  getAllPayments() {
    this.paymentFilter.customerId = this.contactId;
    this.loaderSvc.show();
    const apiPage = this.pagination.currentPage > 0 ? this.pagination.currentPage - 1 : 0;
    this.paymentService.getAllPayments(
      apiPage,
      this.pagination.pageSize,
      this.paymentFilter,
      (response: any) => {
        this.paymentDetails = response.data.content;
        this.pagination = {
          currentPage: this.pagination.currentPage,
          totalItems: response.data.totalElements,
          pageSize: response.data.size
        };
        this.loaderSvc.hide();
      },
      (error: any) => {
        this.loaderSvc.hide();
        this.toast.show('Failed to load Payments', 'error');
      }
    );
  }

  // Method to handle PDF Receipt download
  downloadReceipt(paymentId: number) {
    this.paymentService.downloadPaymentPdf(paymentId, (res: any) => {
      // Logic to open blob as PDF
      const blob = new Blob([res], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url);
    }, (err: any) => this.toast.show("Error generating PDF", "error"));
  }


  get isCustomer(): boolean {
    return this.contactDetails?.type === 'CUSTOMER';
  }

  get theme() {
    // Blue/Indigo for Customer (Receivable), Orange/Amber for Vendor (Payable)
    return this.isCustomer
      ? {
        bg: 'bg-indigo-600',
        light: 'bg-indigo-50',
        text: 'text-indigo-600',
        border: 'border-indigo-200',
        badge: 'bg-indigo-100 text-indigo-700'
      }
      : {
        bg: 'bg-orange-500',
        light: 'bg-orange-50',
        text: 'text-orange-600',
        border: 'border-orange-200',
        badge: 'bg-orange-100 text-orange-700'
      };
  }

  get tabs() {
    const common = [
      { id: 'overview', label: 'Overview', icon: this.FileText },
      { id: 'payments', label: 'Payments', icon: this.CreditCard },
      { id: 'notes', label: 'Notes', icon: this.StickyNote }
    ];

    if (this.isCustomer) {
      return [
        common[0], // Overview
        { id: 'sales_orders', label: 'Sales Orders', icon: this.ShoppingCart },
        { id: 'invoices', label: 'Invoices', icon: this.FileText },
        ...common.slice(1)
      ];
    } else {
      return [
        common[0], // Overview
        { id: 'purchase_orders', label: 'Purchase Orders', icon: this.ShoppingCart },
        { id: 'bills', label: 'Bills', icon: this.FileText },
        ...common.slice(1)
      ];
    }
  }

  get locationDisplay(): string {
    if (!this.contactDetails?.addresses?.length) return 'Location not set';
    const addr = this.contactDetails.addresses[0];
    return `${addr.city}, ${addr.state}`;
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
  }

  openPaymentSummary(customerId: any) {
    this.modalService.openComponent(
      PaymentSymmaryComponent,
      { customerId },
      'lg'
    );
  }

  onFilterDate(range: DateRangeEmit) {
    console.log('Filter table by:', range.from, range.to);
    this.salesOrderFilter.fromDate = range.from
      ? this.formatDate(range.from)
      : null;

    this.salesOrderFilter.toDate = range.to
      ? this.formatDate(range.to)
      : null;
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  handleTableAction(event: TableAction) {
    if (event.type === 'custom' && event.key === 'move_to_invoice') {
      console.log('Moving PO to Invoice:', event.row.id);
      this.router.navigate(['/sales/invoice/create'], {
        queryParams: { salesOrderId: event.row.id }
      });
    }
    if (event.type === 'edit') {
      // Standard edit logic
    }
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
        break;
    }
  }

  onPageChange(newPage: number) {
    this.pagination = { ...this.pagination, currentPage: newPage };
    this.getAllSalesOrders();
  }

  onLoadMore() {
  }
}