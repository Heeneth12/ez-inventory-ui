import { ApplicationModel } from "./application.model";
import { UserModel } from "./user.model";

export interface TenantModel {
    id: number;
    tenantUuid: string;
    tenantName: string;
    tenantCode: string;
    isActive: boolean;
    email?: string;
    phone?: string;
    tenantAdmin?: UserModel;
    applications?: ApplicationModel[];
    tenantAddress?: TenantAddressModel[];
    tenantDetails?: TenantDetailsModel;
}
export interface TenantRegistrationModel {
    tenantName: string;
    adminFullName: string;
    adminEmail: string;
    password: string;
    adminPhone?: string;
    isPersonal?: boolean;
    appKey: string;
    address?: TenantAddressModel;
}

export interface TenantAddressModel {
    id: number;
    addressLine1: string;
    addressLine2?: string;
    route?: string;
    area?: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
    type: string;
}

export interface TenantDetailsModel {
    businessType: string;
    legalName: string;
    baseCurrency: string;
    timeZone: string;
    gstNumber: string;
    panNumber: string;
    supportEmail: string;
    contactPhone: string;
    logoUrl: string;
    website: string;
}

export enum BusinessType {
    RETAIL,
    WHOLESALE,
    MANUFACTURING,
    DISTRIBUTION,
    ECOMMERCE,
    SERVICE_PROVIDER
}

export enum KycStatus {
    PENDING,
    VERIFIED,
    REJECTED
}