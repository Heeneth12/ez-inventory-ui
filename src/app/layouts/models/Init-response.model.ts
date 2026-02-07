export interface UserModulePrivilegeDto {
    moduleKey: string;
    privilegeKey: string[]; // Set<String> maps to string array
}

export interface UserApplicationDto {
    id: number;
    appName: string;
    appKey: string;
    modulePrivileges: UserModulePrivilegeDto[];
    isActive: boolean;
    assignedAt: string; // LocalDateTime comes as ISO string
}

export interface UserInitResponse {
    id: number;
    userUuid: string;
    fullName: string;
    email: string;
    phone: string;
    userType: string;
    isActive: boolean;
    tenantId: number;
    tenantName: string;
    userApplications: UserApplicationDto[];
    userRoles: string[];
}