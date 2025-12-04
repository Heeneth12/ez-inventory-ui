export class UserModel {
    id!: number;
    userUuid!: string;
    fullName!: string;
    email!: string;
    phone!: string;
    roles!: string[];
    isActive!: boolean;
    tenantId!: number;
}