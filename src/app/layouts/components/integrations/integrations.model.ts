export class IntegrationRequest {
    integrationType: IntegrationType | null = null;
    displayName: string = '';
    primaryKey: string = '';
    secondaryKey?: string;
    tertiaryKey?: string;
    isTestMode: boolean = false;
    webhookConfig?: string;
    extraConfig?: string;
    links?: string;
}

export enum IntegrationType {
    RAZORPAY = 'RAZORPAY',
    RAZORPAY_TEST = 'RAZORPAY_TEST',
    STRIPE = 'STRIPE',
    STRIPE_TEST = 'STRIPE_TEST',
    WHATSAPP = 'WHATSAPP',
    SLACK = 'SLACK',
    ZOHO = 'ZOHO',
    SENDGRID = 'SENDGRID',
    EMAIL_SMTP = 'EMAIL_SMTP',
    EMAIL_SMTP_TEST = 'EMAIL_SMTP_TEST',
    WEBHOOK_GENERIC = 'WEBHOOK_GENERIC',
    GMAIL = 'GMAIL',
    GMAIL_TEST = 'GMAIL_TEST'
}

export interface IntegrationDto {
    id: number;
    integrationUuid: string;
    tenantId: number;
    integrationType: IntegrationType;
    displayName: string;
    primaryKey: string;
    secondaryKey?: string;
    tertiaryKey?: string;
    isTestMode: boolean;
    isConnected: boolean;
    isActive: boolean;
    webhookConfig?: string;
    extraConfig?: string;
    links?: string;
    connectedAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

//razorpay object
export interface RazorpayRequest {
    keyId: string;
    keySecret: string;
    webhookSecret: string;
    currency: string;
    type: 'RAZORPAY' | 'RAZORPAY_TEST';
}

//email object
export interface EmailRequest {
    smtpUsername: string;
    smtpPassword: string;
    type: 'EMAIL_SMTP' | 'EMAIL_SMTP_TEST';
}

//gmail object
export interface GmailRequest {
    smtpUsername: string;
    smtpPassword: string;
    type: 'GMAIL' | 'GMAIL_TEST';
}