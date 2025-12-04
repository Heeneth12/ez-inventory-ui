import { ApplicationModel, RoleModel } from "./application.model";

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
}

export interface PrivilegeAssignRequest {
    applicationId: number;
    moduleId: number;
    privilegeIds: number[];
}