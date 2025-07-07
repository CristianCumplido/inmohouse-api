// Presentation Controllers - Controlador de autenticación

import { Request, Response } from "express";
import { AuthUseCase } from "@application/usecases/auth.usecase";
import { AuthenticatedRequest } from "@infrastructure/middleware";

export class AuthController {
  constructor(private authUseCase: AuthUseCase) {}

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          message: "Email and password are required",
        });
      }

      const result = await this.authUseCase.login({ email, password });

      res.status(200).json({
        message: "Login successful",
        data: result,
      });
    } catch (error) {
      res.status(401).json({
        message: error instanceof Error ? error.message : "Login failed",
      });
    }
  };

  register = async (req: Request, res: Response) => {
    try {
      const { name, email, password, role, photo, phone, address, birthDate } =
        req.body;

      if (!name || !email || !password || !role) {
        return res.status(400).json({
          message: "Name, email, password and role are required desde auth",
        });
      }

      const result = await this.authUseCase.register({
        name,
        email,
        password,
        role,
        photo,
        phone,
        address,
        birthDate: birthDate ? new Date(birthDate) : undefined,
      });

      res.status(201).json({
        message: "Registration successful",
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : "Registration failed",
      });
    }
  };

  getProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "User not authenticated",
        });
      }

      const user = await this.authUseCase.validateToken(
        req.headers.authorization?.split(" ")[1] || ""
      );

      res.status(200).json({
        message: "Profile retrieved successfully",
        data: user,
      });
    } catch (error) {
      res.status(401).json({
        message:
          error instanceof Error ? error.message : "Failed to get profile",
      });
    }
  };

  validateToken = async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(401).json({
          message: "No token provided",
        });
      }

      const token = authHeader.split(" ")[1];

      if (!token) {
        return res.status(401).json({
          message: "Invalid token format",
        });
      }

      const user = await this.authUseCase.validateToken(token);

      res.status(200).json({
        message: "Token is valid",
        data: user,
      });
    } catch (error) {
      res.status(401).json({
        message: error instanceof Error ? error.message : "Invalid token",
      });
    }
  };
}
