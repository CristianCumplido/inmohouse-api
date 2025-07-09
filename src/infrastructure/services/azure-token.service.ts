// infrastructure/services/azure-token.service.ts
import {
  IAzureTokenService,
  AzureTokenPayload,
} from "@domain/services/azure-token.service";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import axios from "axios";

export class AzureTokenService implements IAzureTokenService {
  async validateToken(token: string): Promise<AzureTokenPayload> {
    try {
      // Opción 1: Si 'token' es un access token, usar Microsoft Graph
      const response = await axios.get("https://graph.microsoft.com/v1.0/me", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const userInfo = response.data;
      const cleanEmail = this.extractCleanEmail(userInfo);

      return {
        email: userInfo.mail || cleanEmail,
        name: userInfo.displayName,
        oid: userInfo.id,
        preferred_username: userInfo.userPrincimateName,
        given_name: userInfo.givenName,
        family_name: userInfo.surname,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Azure token validation failed: ${error.response?.status} ${error.response?.statusText}`
        );
      }
      throw new Error("Azure token validation failed");
    }
  }

  // Método alternativo si necesitas intercambiar un authorization code por un token
  async exchangeCodeForToken(code: string): Promise<string> {
    try {
      const response = await axios.post(
        `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/token`,
        new URLSearchParams({
          client_id: process.env.AZURE_CLIENT_ID!,
          client_secret: process.env.AZURE_CLIENT_SECRET!,
          code: code,
          grant_type: "authorization_code",
          redirect_uri: process.env.AZURE_REDIRECT_URI!,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      return response.data.access_token;
    } catch (error) {
      throw new Error("Failed to exchange code for token");
    }
  }
  private extractCleanEmail(userInfo: any): string {
    // 1. Priorizar el campo 'mail' si existe (más confiable)
    if (userInfo.mail) {
      return userInfo.mail;
    }

    // 2. Si no hay 'mail', procesar userPrincipalName
    if (userInfo.userPrincipalName) {
      const upn = userInfo.userPrincipalName;

      // Detectar si es usuario externo (contiene #EXT#)
      if (upn.includes("#EXT#")) {
        // Extraer la parte antes de #EXT#
        const emailPart = upn.split("#EXT#")[0];
        // Reemplazar _ por @ para obtener el email original
        return emailPart.replace(/_/g, "@");
      }

      // Si no es externo, devolver el UPN tal como está
      return upn;
    }

    // 3. Fallback: buscar en otros campos
    if (userInfo.otherMails && userInfo.otherMails.length > 0) {
      return userInfo.otherMails[0];
    }

    throw new Error("No email found in user info");
  }
}
