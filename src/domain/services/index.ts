// Domain Services - Servicios de la capa de dominio

import { JwtPayload } from "../entities";

export interface IPasswordService {
  hash(password: string): Promise<string>;
  compare(password: string, hashedPassword: string): Promise<boolean>;
}

export interface ITokenService {
  generateToken(payload: JwtPayload): string;
  verifyToken(token: string): JwtPayload;
}

export interface IEmailService {
  sendWelcomeEmail(email: string, name: string): Promise<void>;
  sendPasswordResetEmail(email: string, resetToken: string): Promise<void>;
}

export interface IFileService {
  uploadFile(file: Express.Multer.File): Promise<string>;
  deleteFile(fileUrl: string): Promise<void>;
}
