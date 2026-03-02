export class SignInModel {
    email!: string;
    password!: string
}

export enum BusinessType {
  RETAIL = 'RETAIL',
  WHOLESALE = 'WHOLESALE',
  MANUFACTURING = 'MANUFACTURING',
  DISTRIBUTION = 'DISTRIBUTION',
  ECOMMERCE = 'ECOMMERCE',
  SERVICE_PROVIDER = 'SERVICE_PROVIDER'
}