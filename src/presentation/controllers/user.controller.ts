// Presentation Controllers - Controlador de usuarios

import { Response } from "express";
import { UserUseCase } from "@application/usecases/user.usecase";
import { AuthenticatedRequest } from "@infrastructure/middleware";
import { UserRole } from "@domain/entities";

export class UserController {
  constructor(private userUseCase: UserUseCase) {}

  createUser = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      let { name, email, password, role, photo, phone, address, birthDate } =
        req.body;
      if (!password) {
        password = "usuario1234";
      }
      if (!name || !email || !password || !role) {
        return res.status(400).json({
          message: "Name, email, password and role are required",
        });
      }

      const user = await this.userUseCase.createUser(
        {
          name,
          email,
          password,
          role,
          photo,
          phone,
          address,
          birthDate: birthDate ? new Date(birthDate) : undefined,
        },
        req.user.role
      );

      res.status(201).json({
        message: "User created successfully",
        data: user,
      });
    } catch (error) {
      res.status(400).json({
        message:
          error instanceof Error ? error.message : "Failed to create user",
      });
    }
  };

  getUserById = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { id } = req.params;

      const user = await this.userUseCase.getUserById(
        id,
        req.user.userId,
        req.user.role
      );

      res.status(200).json({
        message: "User retrieved successfully",
        data: user,
      });
    } catch (error) {
      res.status(404).json({
        message: error instanceof Error ? error.message : "User not found",
      });
    }
  };

  getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { page, limit, sortBy, sortOrder, role, isActive, search } =
        req.query;

      const filters = {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as "asc" | "desc",
        role: role as UserRole,
        isActive: isActive !== undefined ? isActive === "true" : undefined,
        search: search as string,
      };

      const result = await this.userUseCase.getAllUsers(filters, req.user.role);

      res.status(200).json({
        message: "Users retrieved successfully",
        data: result.users,
        pagination: {
          page: filters.page || 1,
          limit: filters.limit || 10,
          total: result.total,
          pages: Math.ceil(result.total / (filters.limit || 10)),
        },
      });
    } catch (error) {
      res.status(403).json({
        message: error instanceof Error ? error.message : "Failed to get users",
      });
    }
  };

  updateUser = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { id } = req.params;
      const { name, email, role, photo, phone, address, birthDate, isActive } =
        req.body;

      const updateData = {
        name,
        email,
        role,
        photo,
        phone,
        address,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        isActive,
      };

      const user = await this.userUseCase.updateUser(
        id,
        updateData,
        req.user.userId,
        req.user.role
      );

      res.status(200).json({
        message: "User updated successfully",
        data: user,
      });
    } catch (error) {
      res.status(400).json({
        message:
          error instanceof Error ? error.message : "Failed to update user",
      });
    }
  };

  deleteUser = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { id } = req.params;

      await this.userUseCase.deleteUser(id, req.user.role);

      res.status(200).json({
        message: "User deleted successfully",
      });
    } catch (error) {
      res.status(400).json({
        message:
          error instanceof Error ? error.message : "Failed to delete user",
      });
    }
  };

  updatePassword = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { id } = req.params;
      const { currentPassword, newPassword } = req.body;

      if (!newPassword) {
        return res.status(400).json({
          message: "New password is required",
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          message: "Password must be at least 6 characters long",
        });
      }

      await this.userUseCase.updateUserPassword(
        id,
        currentPassword || "",
        newPassword,
        req.user.userId,
        req.user.role
      );

      res.status(200).json({
        message: "Password updated successfully",
      });
    } catch (error) {
      res.status(400).json({
        message:
          error instanceof Error ? error.message : "Failed to update password",
      });
    }
  };
}
