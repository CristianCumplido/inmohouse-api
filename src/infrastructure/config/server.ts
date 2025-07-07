// Server Configuration - Configuración del servidor Express

import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { DIContainer } from "../di/container";
import { errorHandler, notFoundHandler } from "../middleware";

export class ServerConfig {
  private app: Application;
  private container: DIContainer;

  constructor() {
    this.app = express();
    this.container = DIContainer.getInstance();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware() {
    // Security middleware
    this.app.use(
      helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
      })
    );

    // CORS configuration
    this.app.use(
      cors({
        origin: process.env.CORS_ORIGIN || "http://localhost:4200",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
      })
    );

    // Rate limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"), // limit each IP to 100 requests per windowMs
      message: {
        error: "Too many requests from this IP, please try again later.",
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

    this.app.use("/api", limiter);

    // Request logging
    if (process.env.NODE_ENV !== "test") {
      this.app.use(morgan("combined"));
    }

    // Body parsing middleware
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // Trust proxy for rate limiting behind reverse proxy
    this.app.set("trust proxy", 1);
  }

  private setupRoutes() {
    // API routes
    this.app.use("/api/v1", this.container.appRoutes.getRouter());

    // Root endpoint
    this.app.get("/", (req, res) => {
      res.json({
        message: "Property Management API",
        version: "1.0.0",
        status: "running",
        endpoints: {
          auth: "/api/v1/auth",
          users: "/api/v1/users",
          properties: "/api/v1/properties",
          health: "/api/v1/health",
        },
      });
    });
  }

  private setupErrorHandling() {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }

  public getApp(): Application {
    return this.app;
  }

  public async start(port: number = 3000): Promise<void> {
    return new Promise((resolve) => {
      this.app.listen(port, () => {
        console.log(`🚀 Server running on port ${port}`);
        console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
        console.log(`🔗 API Base URL: http://localhost:${port}/api/v1`);
        console.log(`📚 Health Check: http://localhost:${port}/api/v1/health`);
        resolve();
      });
    });
  }
}
