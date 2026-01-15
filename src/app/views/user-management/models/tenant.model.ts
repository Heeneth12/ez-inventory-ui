import { employeeManagementRoutes } from "../../employee/employee-management.routes";
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
    addressType: string;
}