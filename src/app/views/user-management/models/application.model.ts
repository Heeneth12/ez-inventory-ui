export class ApplicationModel {
    id!: number;
    appName!: string;
    appKey!: string;
    description!: string;
    isActive!: boolean;
}

export class ModuleModel {
    id!: number;
    moduleName!: string;   // "Dashboard", "Billing"
    moduleKey!: string;     // "DASHBOARD", "BILLING"
    description!: string;
    isActive!: boolean;
    privileges?: PrivilegeModel[];
    // Helper: UI state for accordion
    isExpanded?: boolean;
}

export class PrivilegeModel {
    id!: number;
    privilegeName!: string;  // "View", "Edit"
    privilegeKey!: string;    // "VIEW", "EDIT"
    description!: string;
}

export class RoleModel {
    id!: number;
    roleName!: string;
    roleKey!: string;
    description!: string;
}