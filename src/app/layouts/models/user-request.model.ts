export class CreateAppRequestModel {
    contactEmail!: string;
    contactName!: string;
    subject!: string;
    description!: string;
    category!: SupportCategory;
    priority!: SupportPriority;
    sourceUrl!: string | null; // url of the page where the request was created
    sourceName!: string | null; // name of the page where the request was created
    metadata!: object | null; // other information
}

export class MarketingRequestDto {
    contactEmail!: string;
    contactName!: string;
    subject!: string;
    description!: string;
    category!: SupportCategory;
    priority!: SupportPriority;
    sourceUrl!: string | null; // url of the page where the request was created
    sourceName!: string | null; // name of the page where the request was created
    metadata!: object | null; // other information
}

export enum SupportCategory {
    GENERAL_INQUIRY = 'GENERAL_INQUIRY',
    SALES_CONTACT = 'SALES_CONTACT',
    PRICING_DETAIL = 'PRICING_DETAIL',
    SUPPORT_TICKET = 'SUPPORT_TICKET',
    BUG_REPORT = 'BUG_REPORT',
    FEATURE_REQUEST = 'FEATURE_REQUEST',
    BILLING = 'BILLING',
    FEEDBACK = 'FEEDBACK',
    CONTACT = 'CONTACT',
    RATING = 'RATING',
    NPS = 'NPS',
}

export enum SupportPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    URGENT = 'URGENT'
}
