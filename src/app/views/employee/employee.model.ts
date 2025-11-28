import { AddressModel } from "../contacts/contacts.model";

export class EmployeeModel {
    id!: number;
    employeeCode!: string;
    firstName!: string;
    lastName!: string;
    gender!: "MALE" | "FEMALE" | "OTHER";
    role!: EmployeeRole;
    officialEmail!: string;
    personalEmail!: string;
    contactNumber!: string;
    active!: boolean;
    address!: AddressModel;
}

export enum EmployeeRole {
    MANAGER = "MANAGER",
    SALES_MAN = "SALES_MAN",
    DELIVERY_MAN = "DELIVERY_MAN",
    DEVELOPER = "DEVELOPER",
    ACCOUNTANT = "ACCOUNTANT",
    HR = "HR",
    SUPERVISOR = "SUPERVISOR",
    OPERATOR = "OPERATOR",
    ADMIN = "ADMIN",
    OTHER = "OTHER"
}
