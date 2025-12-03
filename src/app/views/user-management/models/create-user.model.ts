export class CreateUserModel {
    fullName: string = "";
    email: string = "";
    phone: string = "";
    password: string = "";
    tenantId: number = 0;

    roleIds: number[] = [];
    applicationIds: number[] = [];
    privilegeMapping: PrivilegeAssignModel[] = [];
}

export class PrivilegeAssignModel {
    applicationId: number = 0;
    moduleId: number = 0;
    privilegeIds: number[] = [];
}
