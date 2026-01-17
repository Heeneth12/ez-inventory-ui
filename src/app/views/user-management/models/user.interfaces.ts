import { ApplicationModel, RoleModel } from "./application.model";
import { AddressType } from "./user.model";

export interface UserListResponse {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    isActive: boolean;
    userRoles: { role: RoleModel }[];
    userApplications: { application: ApplicationModel }[];
}

// The exact structure required for Creating a User
export interface CreateUserRequest {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    tenantId: number;
    isActive: boolean;
    roleIds: number[];
    applicationIds: number[];
    privilegeMapping: PrivilegeAssignRequest[];
    address: UserAddressModel[];
}

export interface PrivilegeAssignRequest {
    applicationId: number;
    moduleId: number;
    privilegeIds: number[];
}
export interface UserAddressModel {
  id?: number;
  userId?: number;
  addressLine1: string;
  addressLine2?: string;
  route?: string;
  area?: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
  type: AddressType;
}