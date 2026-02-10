export interface ApprovalRequestModel {
  id: number;
  approvalType: ApprovalType;
  referenceId: number;
  referenceCode?: string;
  status: ApprovalStatus;
  requestedBy: number;
  description?: string;
  valueAmount?: number;
  actionedBy?: number;
  actionRemarks?: string;
  approvedDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApprovalConfigModel {
  id?: number;
  approvalType: ApprovalType;
  isEnabled: boolean;
  thresholdAmount?: number;
  thresholdPercentage?: number;
  approverRole?: string;
}

export enum ApprovalResultStatus {
  AUTO_APPROVED = 'AUTO_APPROVED',
  APPROVAL_REQUIRED = 'APPROVAL_REQUIRED',
  REJECTED = 'REJECTED'
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum ApprovalType {
  // Value Based Checks
  HIGH_VALUE_INVOICE = 'HIGH_VALUE_INVOICE',
  PO_APPROVAL = 'PO_APPROVAL',
  STOCK_ADJUSTMENT = 'STOCK_ADJUSTMENT',

  // Percentage Based Checks
  SALES_ORDER_DISCOUNT = 'SALES_ORDER_DISCOUNT',
  INVOICE_DISCOUNT = 'INVOICE_DISCOUNT',
  TAX_VARIANCE = 'TAX_VARIANCE',

  // Absolute Checks
  SALES_REFUND = 'SALES_REFUND',
  ADVANCE_REFUND = 'ADVANCE_REFUND'
}
export class ApprovalFilterModel {
  id?: number;
  searchQuery?: string;
  status?: string; // General purpose status
  warehouseId?: number;
  fromDate?: string | null;
  toDate?: string | null;
  approvalStatuses?: ApprovalStatus[];
  approvalTypes?: ApprovalType[];
  referenceCode?: string;
}

export class ApprovalStatsModel {
  totalCount?: number;
  approvedCount?: number;
  pendingCount?: number;
  rejectedCount?: number;
}
