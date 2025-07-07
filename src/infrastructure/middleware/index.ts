// Infrastructure Middleware - Middlewares de Express

import { Request, Response, NextFunction } from "express";
import { JwtTokenService } from "../services";
import { UserRole } from "@domain/entities";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
  };
}

export class AuthMiddleware {
  constructor(private tokenService: JwtTokenService) {}

  authenticate = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(401).json({ message: "No token provided" });
      }

      const token = authHeader.split(" ")[1]; // Bearer TOKEN

      if (!token) {
        return res.status(401).json({ message: "Invalid token format" });
      }

      const decoded = this.tokenService.verifyToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }
  };

  authorize = (roles: UserRole[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      next();
    };
  };
}

export class ValidationMiddleware {
  static validatePagination = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { page, limit } = req.query;

    if (page) {
      const pageNum = parseInt(page as string);
      if (isNaN(pageNum) || pageNum < 1) {
        return res
          .status(400)
          .json({ message: "Page must be a positive number" });
      }
      req.query.page = pageNum.toString();
    }

    if (limit) {
      const limitNum = parseInt(limit as string);
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        return res
          .status(400)
          .json({ message: "Limit must be between 1 and 100" });
      }
      req.query.limit = limitNum.toString();
    }

    next();
  };

  static validatePropertyFilters = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { minPrice, maxPrice, minArea, maxArea, bedrooms, bathrooms } =
      req.query;

    if (minPrice && (isNaN(Number(minPrice)) || Number(minPrice) < 0)) {
      return res
        .status(400)
        .json({ message: "minPrice must be a positive number" });
    }

    if (maxPrice && (isNaN(Number(maxPrice)) || Number(maxPrice) < 0)) {
      return res
        .status(400)
        .json({ message: "maxPrice must be a positive number" });
    }

    if (minArea && (isNaN(Number(minArea)) || Number(minArea) < 0)) {
      return res
        .status(400)
        .json({ message: "minArea must be a positive number" });
    }

    if (maxArea && (isNaN(Number(maxArea)) || Number(maxArea) < 0)) {
      return res
        .status(400)
        .json({ message: "maxArea must be a positive number" });
    }

    if (bedrooms && (isNaN(Number(bedrooms)) || Number(bedrooms) < 0)) {
      return res
        .status(400)
        .json({ message: "bedrooms must be a positive number" });
    }

    if (bathrooms && (isNaN(Number(bathrooms)) || Number(bathrooms) < 0)) {
      return res
        .status(400)
        .json({ message: "bathrooms must be a positive number" });
    }

    next();
  };
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation Error",
      errors: err.message,
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      message: "Invalid ID format",
    });
  }

  if (err.name === "MongoError" && (err as any).code === 11000) {
    return res.status(400).json({
      message: "Duplicate field value",
    });
  }

  res.status(500).json({
    message: "Internal server error",
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    message: "Route not found",
  });
};
