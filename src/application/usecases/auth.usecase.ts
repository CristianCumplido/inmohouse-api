// Application Use Cases - Casos de uso de autenticación (CORREGIDO)

import { IUserRepository } from "@domain/repositories";
import { IPasswordService, ITokenService } from "@domain/services";
import {
  AuthRequest,
  AuthResponse,
  UserCreateRequest,
  User,
  UserRole,
} from "@domain/entities";
import { AzureTokenPayload } from "@/domain/services/azure-token.service";

interface IAzureTokenService {
  validateToken(token: string): Promise<AzureTokenPayload>;
}
// Extender la interfaz del repositorio para incluir el método con password
interface IUserRepositoryExtended extends IUserRepository {
  findByEmailWithPassword(
    email: string
  ): Promise<(User & { password: string }) | null>;
}

export class AuthUseCase {
  constructor(
    private userRepository: IUserRepositoryExtended,
    private passwordService: IPasswordService,
    private tokenService: ITokenService,
    private azureTokenService: IAzureTokenService
  ) {}

  async login(authRequest: AuthRequest): Promise<AuthResponse> {
    const { email, password } = authRequest;

    // Buscar usuario por email con contraseña
    const userWithPassword = await this.userRepository.findByEmailWithPassword(
      email
    );
    if (!userWithPassword) {
      throw new Error("Invalid credentials");
    }

    // Verificar si el usuario está activo
    if (!userWithPassword.isActive) {
      throw new Error("Account is deactivated");
    }

    // Verificar contraseña
    const isValidPassword = await this.passwordService.compare(
      password,
      userWithPassword.password
    );
    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    // Generar token JWT
    const token = this.tokenService.generateToken({
      userId: userWithPassword.id,
      email: userWithPassword.email,
      role: userWithPassword.role,
    });

    // Retornar respuesta sin la contraseña
    const { password: _, ...user } = userWithPassword;

    return {
      token,
      user,
    };
  }

  async register(userRequest: UserCreateRequest): Promise<AuthResponse> {
    // Verificar si el email ya existe
    const existingUser = await this.userRepository.findByEmail(
      userRequest.email
    );
    if (existingUser) {
      throw new Error("Email already registered");
    }

    // Hashear la contraseña
    const hashedPassword = await this.passwordService.hash(
      userRequest.password
    );

    // Crear usuario
    const user = await this.userRepository.create({
      ...userRequest,
      password: hashedPassword,
    });

    // Generar token JWT
    const token = this.tokenService.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user,
    };
  }

  async validateToken(token: string): Promise<User> {
    try {
      const payload = this.tokenService.verifyToken(token);
      const user = await this.userRepository.findById(payload.userId);

      if (!user || !user.isActive) {
        throw new Error("Invalid token");
      }

      return user;
    } catch (error) {
      throw new Error("Invalid token");
    }
  }
  async loginWithAzure(azureToken: string): Promise<AuthResponse> {
    try {
      // 1. Validar token de Azure
      const azurePayload = await this.azureTokenService.validateToken(
        azureToken
      );

      if (!azurePayload.email) {
        throw new Error("Email not found in Azure token");
      }

      // 2. Buscar usuario existente
      let user = await this.userRepository.findByEmail(azurePayload.email);

      if (user) {
        // 3. Si existe, verificar que esté activo
        if (!user.isActive) {
          throw new Error("Account is deactivated");
        }
      } else {
        // 4. Si no existe, crear nuevo usuario
        const userName =
          azurePayload.name ||
          `${azurePayload.given_name || ""} ${
            azurePayload.family_name || ""
          }`.trim() ||
          azurePayload.email.split("@")[0];
        const hashedPassword = await this.passwordService.hash("usuario1234");
        const userCreateRequest: UserCreateRequest = {
          name: userName,
          email: azurePayload.email,
          password: hashedPassword, // Sin contraseña porque es SSO
          role: UserRole.CLIENT, // Rol por defecto
        };

        user = await this.userRepository.create(userCreateRequest);
      }

      // 5. Generar token JWT interno
      const token = this.tokenService.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        token,
        user,
      };
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Azure authentication failed"
      );
    }
  }
}
