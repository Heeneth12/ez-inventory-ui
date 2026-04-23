import { CommonFilterModel } from "../../../layouts/models/common-filter.model";
import { UserMiniModel } from "../../user-management/models/user.model";
import { InvoiceModal } from "../invoices/invoice.modal";

export interface DeliveryModel {
    id: number;
    tenantId: number;
    deliveryNumber: string;  // DEV-2025-001
    invoiceId: number;
    invoice: InvoiceModal;
    contactMini: UserMiniModel;
    customerId: number;
    customerName: string;
    type: 'CUSTOMER_PICKUP' | 'THIRD_PARTY_COURIER' | 'IN_HOUSE_DELIVERY';   // ShipmentType
    status: 'PENDING' | 'SCHEDULED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'; // ShipmentStatus
    deliveryPersonId: number;
    scheduledDate: Date;
    shippedDate: Date;
    deliveredDate: Date;
    deliveryAddress: string;
    contactPerson: string;
    contactPhone: string;
    remarks: string;
    attachmentUuid: string;
}

export class DeliveryFilterModel extends CommonFilterModel {
    deliveryId!: number;
    customerId!: number;
    deliveryNumber!: string;
    shipmentTypes!: Type[] | null;
    shipmentStatuses!: ShipmentStatus[] | null;
    invoiceIds!: number[] | null;

}

export class DeliveryStatusUpdateRequest {
    status!: ShipmentStatus;
    reason!: string | null;
    scheduledDate!: Date | null;
}


export enum ShipmentStatus {
    PENDING = 'PENDING',
    SCHEDULED = 'SCHEDULED',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED'
}

export enum Type {
    CUSTOMER_PICKUP = 'CUSTOMER_PICKUP',
    THIRD_PARTY_COURIER = 'THIRD_PARTY_COURIER',
    IN_HOUSE_DELIVERY = 'IN_HOUSE_DELIVERY'
}

export interface RouteModel {
    id: number;
    routeNumber: string;
    areaName: string;
    driverId: number;
    driverName: string;
    vehicleNumber: string;
    status: 'CREATED' | 'IN_TRANSIT' | 'COMPLETED';
    startDate: Date;
    deliveries: DeliveryModel[]; // The batch of deliveries inside this route
}

export interface RouteCreateRequest {
    areaName?: string;
    driverId: number;
    vehicleNumber?: string;
    deliveryIds: number[];
}