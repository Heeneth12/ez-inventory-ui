
export class ContactModel {
    id?: number;
    contactCode?: string;
    name?: string;
    email?: string;
    phone?: string;
    gstNumber?: string;
    type?: string;
    active?: boolean;
    addresses: AddressModel[] = [];
}

export class AddressModel {
    id?: number;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    country?: string;
    pinCode?: string;
    type?: string;
    contactId?: number;
}

export class ContactFilter {
    name?: string;
    type?: string;
    isActive?: boolean;
}

export enum ContactType {
    CUSTOMER = 'CUSTOMER',
    SUPPLIER = 'SUPPLIER',
    BOTH = 'BOTH'
}

export enum AddressType {
    BILLING = 'BILLING',
    SHIPPING = 'SHIPPING',
    OFFICE = 'OFFICE',
    HOME = 'HOME',
    OTHER = 'OTHER'
}
