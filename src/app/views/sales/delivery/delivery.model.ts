export interface DeliveryModel {
    id: number;
    tenantId: number;  
    deliveryNumber: string;  // DEV-2025-001
    invoiceId: number;
    customerId: number;
    customerName: string;
    type: 'PICKUP' | 'COURIER' | 'OWN_FLEET';   // ShipmentType
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
    type?: 'PICKUP' | 'COURIER' | 'OWN_FLEET';   // ShipmentType
    status?: 'PENDING' | 'SCHEDULED' | 'SHIPPED' | 'DELIVERED'
    scheduledDateFrom?: Date;
    scheduledDateTo?: Date;
    shippedDateFrom?: Date;
    shippedDateTo?: Date;
    deliveredDateFrom?: Date;
    deliveredDateTo?: Date;
}