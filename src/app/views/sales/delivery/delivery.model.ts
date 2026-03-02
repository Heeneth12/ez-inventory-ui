import { CommonFilterModel } from "../../../layouts/models/common-filter.model";
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

export class DeliveryFilterModel extends CommonFilterModel {
    deliveryId!: number;
    customerId!: number;
    deliveryNumber!: string;
    shipmentTypes!: Type[] | null;
    shipmentStatuses!: ShipmentStatus[] | null;

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