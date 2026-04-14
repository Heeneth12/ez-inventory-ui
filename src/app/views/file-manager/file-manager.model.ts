export type FileReferenceType =
  | 'ITEM'
  | 'PURCHASE_REQUEST'
  | 'PURCHASE_ORDER'
  | 'GOODS_RECEIPT_NOTE'
  | 'PURCHASE_RETURN'
  | 'SALES_ORDER'
  | 'INVOICE'
  | 'DELIVERY'
  | 'PAYMENT'
  | 'SALES_RETURN'
  | 'STOCK_ADJUSTMENT'
  | 'EMPLOYEE'
  | 'CONTACT'
  | 'TENANT'
  | 'GENERAL';

export type FileType =
  | 'ITEM_IMAGE'
  | 'ITEM_DOCUMENT'
  | 'PURCHASE_REQUEST_PDF'
  | 'PURCHASE_ORDER_PDF'
  | 'PURCHASE_ORDER_DOCUMENT'
  | 'GOODS_RECEIPT_PDF'
  | 'GOODS_RECEIPT_DOCUMENT'
  | 'PURCHASE_RETURN_PDF'
  | 'PURCHASE_RETURN_DOCUMENT'
  | 'SALES_ORDER_PDF'
  | 'SALES_ORDER_DOCUMENT'
  | 'INVOICE_PDF'
  | 'INVOICE_DOCUMENT'
  | 'DELIVERY_NOTE_PDF'
  | 'DELIVERY_DOCUMENT'
  | 'PAYMENT_RECEIPT_PDF'
  | 'PAYMENT_DOCUMENT'
  | 'SALES_RETURN_PDF'
  | 'SALES_RETURN_DOCUMENT'
  | 'STOCK_ADJUSTMENT_DOCUMENT'
  | 'EMPLOYEE_PHOTO'
  | 'EMPLOYEE_DOCUMENT'
  | 'CONTACT_DOCUMENT'
  | 'CONTACT_LOGO'
  | 'EXCEL_EXPORT'
  | 'PDF_REPORT'
  | 'GENERAL_DOCUMENT';

export interface FileRecordModel {
  id: number;
  uuid: string;
  tenantId: string;
  referenceId: string;
  referenceType: FileReferenceType;
  fileType: FileType;
  originalFileName: string;
  storedFileName: string;
  s3Key: string;
  s3Bucket: string;
  s3VersionId: string | null;
  mimeType: string;
  fileSizeBytes: number;
  checksum: string;
  isPublic: boolean;
  description: string | null;
  tags: string | null;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
  preSignedUrl: string | null;
}

export interface FileUploadPayload {
  referenceId: string;
  referenceType: FileReferenceType;
  fileType: FileType;
  tenantId: string;
  description?: string;
  tags?: string;
  isPublic?: boolean;
}

export interface PreSignedUrlModel {
  fileUuid: string;
  originalFileName: string;
  url: string;
  expiresAt: string;
  expirationMinutes: number;
}

export const FILE_REFERENCE_TYPES: FileReferenceType[] = [
  'ITEM', 'PURCHASE_REQUEST', 'PURCHASE_ORDER', 'GOODS_RECEIPT_NOTE',
  'PURCHASE_RETURN', 'SALES_ORDER', 'INVOICE', 'DELIVERY', 'PAYMENT',
  'SALES_RETURN', 'STOCK_ADJUSTMENT', 'EMPLOYEE', 'CONTACT', 'TENANT', 'GENERAL'
];

export const FILE_TYPES: FileType[] = [
  'ITEM_IMAGE', 'ITEM_DOCUMENT', 'PURCHASE_REQUEST_PDF', 'PURCHASE_ORDER_PDF',
  'PURCHASE_ORDER_DOCUMENT', 'GOODS_RECEIPT_PDF', 'GOODS_RECEIPT_DOCUMENT',
  'PURCHASE_RETURN_PDF', 'PURCHASE_RETURN_DOCUMENT', 'SALES_ORDER_PDF',
  'SALES_ORDER_DOCUMENT', 'INVOICE_PDF', 'INVOICE_DOCUMENT', 'DELIVERY_NOTE_PDF',
  'DELIVERY_DOCUMENT', 'PAYMENT_RECEIPT_PDF', 'PAYMENT_DOCUMENT',
  'SALES_RETURN_PDF', 'SALES_RETURN_DOCUMENT', 'STOCK_ADJUSTMENT_DOCUMENT',
  'EMPLOYEE_PHOTO', 'EMPLOYEE_DOCUMENT', 'CONTACT_DOCUMENT', 'CONTACT_LOGO',
  'EXCEL_EXPORT', 'PDF_REPORT', 'GENERAL_DOCUMENT'
];
