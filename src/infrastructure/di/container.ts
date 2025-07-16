// Dependency Injection Container - Contenedor de dependencias

import { AuthUseCase } from "@application/usecases/auth.usecase";
import { UserUseCase } from "@application/usecases/user.usecase";
import { PropertyUseCase } from "@application/usecases/property.usecase";

import { MongoUserRepository } from "@infrastructure/repositories/user.repository";
import { MongoPropertyRepository } from "@infrastructure/repositories/property.repository";
import { AzureTokenService } from "@infrastructure/services/azure-token.service";

import {
  BcryptPasswordService,
  JwtTokenService,
} from "@infrastructure/services";
import { AuthMiddleware } from "@infrastructure/middleware";

import { AuthController } from "@presentation/controllers/auth.controller";
import { UserController } from "@presentation/controllers/user.controller";
import { PropertyController } from "@presentation/controllers/property.controller";

import { AppRoutes } from "@presentation/routes";
import { AppointmentController } from "@/presentation/controllers/appointment.controller";
import { AppointmentUseCase } from "@/application/usecases/appointment.usecase";
import { AppointmentRepository } from "../repositories/appointment.repository";

export class DIContainer {
  private static instance: DIContainer;

  // Services
  public readonly passwordService: BcryptPasswordService;
  public readonly tokenService: JwtTokenService;

  // Repositories
  public readonly azureTokenService: AzureTokenService =
    new AzureTokenService();
  public readonly userRepository: MongoUserRepository;
  public readonly propertyRepository: MongoPropertyRepository;
  public readonly appointmentRepository: AppointmentRepository;
  // Use Cases
  public readonly authUseCase: AuthUseCase;
  public readonly userUseCase: UserUseCase;
  public readonly propertyUseCase: PropertyUseCase;
  public readonly appointmentUseCase: AppointmentUseCase;

  // Middleware
  public readonly authMiddleware: AuthMiddleware;

  // Controllers
  public readonly authController: AuthController;
  public readonly userController: UserController;
  public readonly propertyController: PropertyController;
  public readonly appointmentController: AppointmentController;

  // Routes
  public readonly appRoutes: AppRoutes;

  private constructor() {
    // Initialize services
    this.passwordService = new BcryptPasswordService();
    this.tokenService = new JwtTokenService(
      process.env.JWT_SECRET || "fallback-secret-key",
      process.env.JWT_EXPIRES_IN || "7d"
    );

    // Initialize repositories
    this.userRepository = new MongoUserRepository();
    this.propertyRepository = new MongoPropertyRepository();
    this.appointmentRepository = new AppointmentRepository();
    // Initialize use cases
    this.authUseCase = new AuthUseCase(
      this.userRepository,
      this.passwordService,
      this.tokenService,
      this.azureTokenService
    );

    this.userUseCase = new UserUseCase(
      this.userRepository,
      this.passwordService
    );

    this.propertyUseCase = new PropertyUseCase(this.propertyRepository);
    this.appointmentUseCase = new AppointmentUseCase(
      this.appointmentRepository,
      this.propertyRepository,
      this.userRepository
    );
    // Initialize middleware
    this.authMiddleware = new AuthMiddleware(this.tokenService);

    // Initialize controllers
    this.authController = new AuthController(this.authUseCase);
    this.userController = new UserController(this.userUseCase);
    this.propertyController = new PropertyController(this.propertyUseCase);
    this.appointmentController = new AppointmentController(
      this.appointmentUseCase
    );
    // Initialize routes
    this.appRoutes = new AppRoutes(
      this.authController,
      this.userController,
      this.propertyController,
      this.appointmentController,
      this.authMiddleware
    );
  }

  public static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }
}
