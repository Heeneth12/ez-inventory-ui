export class ApplicationModel {
    id!: number;
    appName!: string;
    appKey!: string;
    description!: string;
    isActive!: boolean;
    modules!: ModuleModel[];
}

export class ModuleModel {
    id!: number;
    moduleName!: string;   // "Dashboard", "Billing"
    moduleKey!: string;     // "DASHBOARD", "BILLING"
    description!: string;
    isActive!: boolean;
    privileges!: PrivilegeModel[];
}

export class PrivilegeModel {
    id!: number;
    privilegeName!: string;  // "View", "Edit"
    privilegeKey!: string;    // "VIEW", "EDIT"
    description!: string;
}