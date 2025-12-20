import { ContactMiniModel } from "../../contacts/contacts.model";

export interface DeliveryModel {
    id: number;
    tenantId: number;
    deliveryNumber: string;  // DEV-2025-001
    invoiceId: number;
    contactMini: ContactMiniModel;
    customerId: number;
    customerName: string;
    type: 'CUSTOMER_PICKUP' | 'THIRD_PARTY_COURIER' | 'IN_HOUSE_DELIVERY';   // ShipmentType
    status: 'PENDING' | 'SCHEDULED' | 'SHIPPED' | 'DELIVERED'; // ShipmentStatus
    deliveryPersonId: number;
    scheduledDate: Date;
    shippedDate: Date;
    deliveredDate: Date;
    deliveryAddress: string;
    contactPerson: string;
    contactPhone: string;
}

export class DeliveryFilterModel {
    id?: number
    deliveryNumber?: string;
    invoiceId?: number;
    customerId?: number;
    type?: 'CUSTOMER_PICKUP' | 'THIRD_PARTY_COURIER' | 'IN_HOUSE_DELIVERY';   // ShipmentType
    status?: 'PENDING' | 'SCHEDULED' | 'SHIPPED' | 'DELIVERED'
    scheduledDateFrom?: Date;
    scheduledDateTo?: Date;
    shippedDateFrom?: Date;
    shippedDateTo?: Date;
    deliveredDateFrom?: Date;
    deliveredDateTo?: Date;
}

export enum ShipmentStatus {
    PENDING = 'PENDING',
    SCHEDULED = 'SCHEDULED',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED'
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