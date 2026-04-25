export class SignInModel {
  email!: string;
  password!: string
}

export class AuthResponseModel {
  accessToken!: string;
  refreshToken!: string;
  tokenType!: string;
  message!: string;
}

export class ForgotPasswordModel {
  email!: string;
}

export class GoogleSignInModel {
  idToken!: string;
  appKey!: string;
}

export class ResendOtpModel {
  tenantId!: number;
}

export class ResetPasswordModel {
  email!: string;
  otp!: string;
  newPassword!: string;
}

export class TokenRefreshModel {
  refreshToken!: string;
}

export enum BusinessType {
  RETAIL = 'RETAIL',
  WHOLESALE = 'WHOLESALE',
  MANUFACTURING = 'MANUFACTURING',
  DISTRIBUTION = 'DISTRIBUTION',
  ECOMMERCE = 'ECOMMERCE',
  SERVICE_PROVIDER = 'SERVICE_PROVIDER'
}