// Presentation Routes - Rutas de la API

import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { UserController } from "../controllers/user.controller";
import { PropertyController } from "../controllers/property.controller";
import {
  AuthMiddleware,
  ValidationMiddleware,
} from "@infrastructure/middleware";
import { UserRole } from "@domain/entities";

export class AppRoutes {
  private router: Router;
  private authMiddleware: AuthMiddleware;

  constructor(
    private authController: AuthController,
    private userController: UserController,
    private propertyController: PropertyController,
    authMiddleware: AuthMiddleware
  ) {
    this.router = Router();
    this.authMiddleware = authMiddleware;
    this.setupRoutes();
  }

  private setupRoutes() {
    // Health check
    this.router.get("/health", (req, res) => {
      res.status(200).json({
        message: "API is running",
        timestamp: new Date().toISOString(),
      });
    });

    // Auth routes
    this.setupAuthRoutes();

    // User routes
    this.setupUserRoutes();

    // Property routes
    this.setupPropertyRoutes();
  }

  private setupAuthRoutes() {
    const authRouter = Router();

    authRouter.post("/login", this.authController.login);
    authRouter.post("/register", this.authController.register);
    authRouter.get(
      "/profile",
      this.authMiddleware.authenticate,
      this.authController.getProfile
    );
    authRouter.post("/validate-token", this.authController.validateToken);

    this.router.use("/auth", authRouter);
    authRouter.post("/azure-login", this.authController.loginWithAzure);
  }

  private setupUserRoutes() {
    const userRouter = Router();

    // Todas las rutas de usuarios requieren autenticación
    userRouter.use(this.authMiddleware.authenticate);

    // Solo admin puede crear usuarios
    userRouter.post(
      "/",
      this.authMiddleware.authorize([UserRole.ADMIN]),
      this.userController.createUser
    );

    // Admin puede ver todos los usuarios
    userRouter.get(
      "/",
      ValidationMiddleware.validatePagination,
      this.authMiddleware.authorize([UserRole.ADMIN]),
      this.userController.getAllUsers
    );

    // Usuario puede ver su propio perfil, admin puede ver cualquiera
    userRouter.get("/:id", this.userController.getUserById);

    // Usuario puede actualizar su propio perfil, admin puede actualizar cualquiera
    userRouter.put("/:id", this.userController.updateUser);

    // Solo admin puede eliminar usuarios
    userRouter.delete(
      "/:id",
      this.authMiddleware.authorize([UserRole.ADMIN]),
      this.userController.deleteUser
    );

    // Usuario puede cambiar su propia contraseña, admin puede cambiar cualquiera
    userRouter.patch("/:id/password", this.userController.updatePassword);

    this.router.use("/users", userRouter);
  }

  private setupPropertyRoutes() {
    const propertyRouter = Router();

    // Rutas públicas (no requieren autenticación)
    propertyRouter.get(
      "/",
      ValidationMiddleware.validatePagination,
      ValidationMiddleware.validatePropertyFilters,
      this.propertyController.getAllProperties
    );

    propertyRouter.get("/:id", this.propertyController.getPropertyById);

    // Rutas que requieren autenticación
    propertyRouter.use(this.authMiddleware.authenticate);

    // Admin y Agent pueden crear propiedades
    propertyRouter.post(
      "/",
      this.authMiddleware.authorize([UserRole.ADMIN, UserRole.AGENT]),
      this.propertyController.createProperty
    );

    // Obtener propiedades por agente
    propertyRouter.get(
      "/agent/:agentId",
      ValidationMiddleware.validatePagination,
      ValidationMiddleware.validatePropertyFilters,
      this.propertyController.getPropertiesByAgent
    );

    // Admin y propietario (agent) pueden actualizar
    propertyRouter.put("/:id", this.propertyController.updateProperty);

    // Admin y propietario (agent) pueden eliminar
    propertyRouter.delete("/:id", this.propertyController.deleteProperty);

    // Admin y propietario (agent) pueden cambiar estado
    propertyRouter.patch(
      "/:id/toggle-status",
      this.propertyController.togglePropertyStatus
    );

    this.router.use("/properties", propertyRouter);
  }

  public getRouter(): Router {
    return this.router;
  }
}
