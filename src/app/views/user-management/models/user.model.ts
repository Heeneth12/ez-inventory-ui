export class UserModel {
  id!: number;
  userUuid!: string;
  fullName!: string;
  email!: string;
  phone!: string;
  roles!: string[];
  isActive!: boolean;
  tenantId!: number;
  addresses?: UserAddressModel[];
  userType!: UserType;
}

export class UserAddressModel {
  id!: number;
  userId!: number;
  addressLine1!: string;
  addressLine2?: string;
  route?: string;
  area?: string;
  city!: string;
  state!: string;
  country!: string;
  pinCode!: string;
  type!: AddressType;
}

export enum AddressType {
  HOME = 'HOME',
  OFFICE = 'OFFICE',
  BILLING = 'BILLING',
  SHIPPING = 'SHIPPING',
  WAREHOUSE = 'WAREHOUSE'
}

export enum UserType {
  EMPLOYEE = 'EMPLOYEE',
  CUSTOMER = 'CUSTOMER',
  VENDOR = 'VENDOR'
}

export class UserFilterModel {
  tenantId?: number;
  userId?: number;
  userUuid?: string;
  email?: string;
  phone?: string;
  searchQuery?: string;
  userType?: UserType[];
  active?: boolean;
}