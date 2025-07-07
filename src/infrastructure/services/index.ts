// Infrastructure Services - Implementación de servicios

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { IPasswordService, ITokenService } from "@domain/services";

export class BcryptPasswordService implements IPasswordService {
  private readonly saltRounds = 10;

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async compare(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}

export class JwtTokenService implements ITokenService {
  private readonly secret: string;
  private readonly expiresIn: string;

  constructor(secret: string, expiresIn: string = "7d") {
    this.secret = secret;
    this.expiresIn = expiresIn;
  }

  generateToken(payload: Record<string, any>): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.secret);
    } catch (error) {
      throw new Error("Invalid token");
    }
  }
}
