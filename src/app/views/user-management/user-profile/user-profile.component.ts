import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Mail, MapPin, Phone, Building, FileText, ShoppingCart, CreditCard, StickyNote, ArrowUpRight, ArrowDownLeft, Clock, Home, Users, MapPinCheckIcon, ChevronDown, UserSquare, Pencil, User, Fingerprint, Calendar, Hash, Plus, Star, LucideAngularModule, Truck, RefreshCw, Package, Folder, Clipboard, Banknote, Undo2 } from 'lucide-angular';
import { LoaderService } from '../../../layouts/components/loader/loaderService';
import { ModalService } from '../../../layouts/components/modal/modalService';
import { ToastService } from '../../../layouts/components/toast/toastService';
import { DatePickerConfig } from '../../../layouts/UI/date-picker/date-picker.component';
import { PaymentSymmaryComponent } from '../../sales/payments/payment-symmary/payment-symmary.component';
import { PaymentService } from '../../sales/payments/payment.service';
import { UserAddressModel, UserModel, UserType } from '../models/user.model';
import { UserManagementService } from '../userManagement.service';
import { PurchaseRequestComponent } from "../../purchases/purchase-request/purchase-request.component";
import { PurchaseOrderComponent } from "../../purchases/purchase-order/purchase-order.component";
import { GoodsReceiptComponent } from "../../purchases/goods-receipt/goods-receipt.component";
import { PurchaseReturnsComponent } from "../../purchases/purchase-returns/purchase-returns.component";
import { SalesOrderComponent } from "../../sales/sales-order/sales-order.component";
import { InvoicesComponent } from "../../sales/invoices/invoices.component";
import { PaymentsComponent } from "../../sales/payments/payments.component";
import { DeliveryComponent } from "../../sales/delivery/delivery.component";
import { SalesReturnsComponent } from "../../sales/sales-returns/sales-returns.component";
import { SalesOrderFormComponent } from '../../sales/sales-order/sales-order-form/sales-order-form.component';
import { DrawerService } from '../../../layouts/components/drawer/drawerService';
import { SkeletonLoaderComponent } from "../../../layouts/UI/skeleton-loader/skeleton-loader.component";

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, PurchaseRequestComponent, PurchaseOrderComponent, GoodsReceiptComponent, PurchaseReturnsComponent, SalesOrderComponent, InvoicesComponent, PaymentsComponent, DeliveryComponent, SalesReturnsComponent, SkeletonLoaderComponent],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit {

  //user
  userId: number = 0;
  public readonly UserType = UserType;
  currentUserType: UserType = UserType.CUSTOMER;
  isDropdownOpen = false;

  financialSummary: any = {
    totalOutstandingAmount: 0,
    walletBalance: 0
  };

  selectedItemIds: (string | number)[] = [];
  userDetails: UserModel | null = null;
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
  readonly Truck = Truck;
  readonly RefreshCw = RefreshCw;
  readonly Clipboard = Clipboard;
  readonly Package = Package;
  readonly Folder = Folder;
  readonly Banknote = Banknote;
  readonly plusIcon = Plus;
  readonly undoIcon = Undo2;

  dateConfig: DatePickerConfig = {
    type: 'both',
    placeholder: 'Start - End'
  };

  financialStats = {
    balance: 12450.00,
    overdue: 2100.00,
    creditLimit: 50000.00,
    unusedCredits: 450.00,
    totalSales: 154000.00,
    totalPurchases: 89000.00
  };

  overviewStats = {
    totalSales: 425000,
    avgPaymentDays: 18,
    openInvoices: 4,
    lastActivity: '2 Days ago'
  };

  constructor(
    private userManagementService: UserManagementService,
    private paymentService: PaymentService,
    private toast: ToastService,
    private router: Router,
    private modalService: ModalService,
    private drawerSvc: DrawerService,
    private loaderSvc: LoaderService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.isLoading = true;
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.userId = Number(id);
      this.getUserDetails(this.userId);
      this.getFinancialSummary(this.userId);
      if (this.activeTab === 'overview') {
        this.onTabChange('overview');
      }
    }
  }

  getUserDetails(id: number) {
    this.isLoading = true;
    this.userManagementService.getUserById(id,
      (response: any) => {
        this.userDetails = response.data;
        this.currentUserType = response.data.userType as UserType;
        this.isLoading = false;
      },
      (error: any) => {
        this.toast.show('Failed to load contact details.', 'error');
        this.isLoading = false;
      }
    );
  }

  getFinancialSummary(id: number) {
    this.isLoading = true;
    this.paymentService.getCustomerSummary(id,
      (res: any) => {
        this.financialSummary = res.data;
        this.isLoading = false;
      },
      (err: any) => console.error("Could not load summary", err)
    );
  }

  onTabChange(tabId: string) {
    this.activeTab = tabId;
    if (tabId === "sales_orders") {
    } else if (tabId === "invoices") {
    } else if (tabId === "payments") {
    }

    // NEW: Logic for Highcharts Overview
    if (tabId === 'overview') {
      // Use setTimeout(0) to wait for Angular to render the @if block
    }
  }


  get theme() {
    switch (this.currentUserType) {
      case UserType.CUSTOMER:
        // Blue/Indigo for Customer (Receivable)
        return {
          bg: 'bg-indigo-600',
          light: 'bg-indigo-50',
          text: 'text-indigo-600',
          border: 'border-indigo-200',
          badge: 'bg-indigo-100 text-indigo-700'
        };

      case UserType.VENDOR:
        // Orange/Amber for Vendor (Payable)
        return {
          bg: 'bg-orange-500',
          light: 'bg-orange-50',
          text: 'text-orange-600',
          border: 'border-orange-200',
          badge: 'bg-orange-100 text-orange-700'
        };

      case UserType.EMPLOYEE:
      default:
        // Teal/Emerald for Employee (Internal)
        return {
          bg: 'bg-teal-600',
          light: 'bg-teal-50',
          text: 'text-teal-600',
          border: 'border-teal-200',
          badge: 'bg-teal-100 text-teal-700'
        };
    }
  }

  get tabs() {
    const overviewTab = { id: 'overview', label: 'Overview', icon: this.FileText };
    switch (this.currentUserType) {
      case UserType.CUSTOMER:
        return [
          overviewTab,
          { id: 'sales_orders', label: 'Sales Orders', icon: this.ShoppingCart },
          { id: 'invoices', label: 'Invoice / Bill', icon: this.FileText },
          { id: 'delivery', label: 'Delivery', icon: this.Truck },
          { id: 'payments', label: 'Payment', icon: this.CreditCard },
          { id: 'sales_return', label: 'Sales Return', icon: this.undoIcon }
        ];

      case UserType.VENDOR:
        return [
          overviewTab,
          { id: 'ppurchase_request', label: 'Purchase Requisition', icon: this.Clipboard },
          { id: 'purchase_orders', label: 'Purchase Orders', icon: this.ShoppingCart },
          { id: 'goods_receipt', label: 'Goods Receipt', icon: this.Package },
          { id: 'purchase_return', label: 'Purchase Return', icon: this.undoIcon }
        ];

      case UserType.EMPLOYEE:
      default:
        return [
          overviewTab,
          { id: 'timesheet', label: 'Timesheet', icon: this.Clock },
          { id: 'leave', label: 'Leave & Attendance', icon: this.Calendar },
          { id: 'expenses', label: 'Expenses', icon: this.CreditCard },
          { id: 'documents', label: 'Documents', icon: this.Folder }
        ];
    }
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

  getUserAddress(userAddress: UserAddressModel | undefined | null): string {

    if (!userAddress) return '';

    const addressParts = [
      userAddress.addressLine1,
      userAddress.addressLine2,
      userAddress.route,
      userAddress.area,
      userAddress.city,
      userAddress.state,
      userAddress.country,
      userAddress.pinCode
    ];

    return addressParts
      .filter(part => part && part.trim() !== '')
      .join(', ');
  }

  openPaymentSummary(customerId: any) {
    this.modalService.openComponent(
      PaymentSymmaryComponent,
      { customerId },
      'lg'
    );
  }

  createSalesOrderForm() {
    this.modalService.openComponent(
      SalesOrderFormComponent,
      { customerId: this.userId },
      'xl'
    );
  }

  createPurchaseOrderForm() {
    this.drawerSvc.openComponent(
      SalesOrderFormComponent,
      { customerId: this.userId },
      'Create Purchase Order',
      '2xl'
    );
  }

  onCreateClick() {
    if (this.activeTab === 'sales_orders') {
      this.createPurchaseOrderForm();
    } else if (this.activeTab === 'purchase_orders') {
      this.createPurchaseOrderForm();
    }

  }
}
