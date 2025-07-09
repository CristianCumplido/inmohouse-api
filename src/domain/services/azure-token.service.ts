// domain/services/azure-token.service.ts
export interface IAzureTokenService {
  validateToken(token: string): Promise<AzureTokenPayload>;
}

export interface AzureTokenPayload {
  email: string;
  name?: string;
  oid?: string; // ID único de Azure AD
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
}
