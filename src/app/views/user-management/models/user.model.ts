export class UserModel {
    id!: number;
    userUuid!: string;
    fullName!: string;
    email!: string;
    phone!: string;
    role!: string[];
    isActive!: boolean;
    tenantId!: number;
}