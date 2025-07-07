// Presentation Controllers - Controlador de propiedades

import { Response } from "express";
import { PropertyUseCase } from "@application/usecases/property.usecase";
import { AuthenticatedRequest } from "@infrastructure/middleware";

export class PropertyController {
  constructor(private propertyUseCase: PropertyUseCase) {}

  createProperty = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const {
        title,
        imageUrl,
        location,
        price,
        area,
        bedrooms,
        bathrooms,
        parking,
        propertyType,
        description,
        amenities,
      } = req.body;

      if (
        !title ||
        !imageUrl ||
        !location ||
        price === undefined ||
        area === undefined ||
        bedrooms === undefined ||
        bathrooms === undefined ||
        parking === undefined
      ) {
        return res.status(400).json({
          message:
            "Title, imageUrl, location, price, area, bedrooms, bathrooms and parking are required",
        });
      }

      const property = await this.propertyUseCase.createProperty(
        {
          title,
          imageUrl,
          location,
          price: Number(price),
          area: Number(area),
          bedrooms: Number(bedrooms),
          bathrooms: Number(bathrooms),
          parking: Number(parking),
          propertyType,
          description,
          amenities,
        },
        req.user.userId,
        req.user.role
      );

      res.status(201).json({
        message: "Property created successfully",
        data: property,
      });
    } catch (error) {
      res.status(400).json({
        message:
          error instanceof Error ? error.message : "Failed to create property",
      });
    }
  };

  getPropertyById = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;

      const property = await this.propertyUseCase.getPropertyById(id);

      res.status(200).json({
        message: "Property retrieved successfully",
        data: property,
      });
    } catch (error) {
      res.status(404).json({
        message: error instanceof Error ? error.message : "Property not found",
      });
    }
  };

  getAllProperties = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const {
        page,
        limit,
        sortBy,
        sortOrder,
        location,
        minPrice,
        maxPrice,
        minArea,
        maxArea,
        bedrooms,
        bathrooms,
        propertyType,
        agentId,
      } = req.query;

      const filters = {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as "asc" | "desc",
        location: location as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        minArea: minArea ? Number(minArea) : undefined,
        maxArea: maxArea ? Number(maxArea) : undefined,
        bedrooms: bedrooms ? Number(bedrooms) : undefined,
        bathrooms: bathrooms ? Number(bathrooms) : undefined,
        propertyType: propertyType as string,
        agentId: agentId as string,
      };

      const result = await this.propertyUseCase.getAllProperties(filters);

      res.status(200).json({
        message: "Properties retrieved successfully",
        data: result.properties,
        pagination: {
          page: filters.page || 1,
          limit: filters.limit || 10,
          total: result.total,
          pages: Math.ceil(result.total / (filters.limit || 10)),
        },
      });
    } catch (error) {
      res.status(400).json({
        message:
          error instanceof Error ? error.message : "Failed to get properties",
      });
    }
  };

  getPropertiesByAgent = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { agentId } = req.params;
      const {
        page,
        limit,
        sortBy,
        sortOrder,
        location,
        minPrice,
        maxPrice,
        minArea,
        maxArea,
        bedrooms,
        bathrooms,
        propertyType,
      } = req.query;

      const filters = {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as "asc" | "desc",
        location: location as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        minArea: minArea ? Number(minArea) : undefined,
        maxArea: maxArea ? Number(maxArea) : undefined,
        bedrooms: bedrooms ? Number(bedrooms) : undefined,
        bathrooms: bathrooms ? Number(bathrooms) : undefined,
        propertyType: propertyType as string,
      };

      const result = await this.propertyUseCase.getPropertiesByAgent(
        agentId,
        filters,
        req.user.userId,
        req.user.role
      );

      res.status(200).json({
        message: "Agent properties retrieved successfully",
        data: result.properties,
        pagination: {
          page: filters.page || 1,
          limit: filters.limit || 10,
          total: result.total,
          pages: Math.ceil(result.total / (filters.limit || 10)),
        },
      });
    } catch (error) {
      res.status(403).json({
        message:
          error instanceof Error
            ? error.message
            : "Failed to get agent properties",
      });
    }
  };

  updateProperty = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { id } = req.params;
      const {
        title,
        imageUrl,
        location,
        price,
        area,
        bedrooms,
        bathrooms,
        parking,
        propertyType,
        description,
        amenities,
        isActive,
      } = req.body;

      const updateData = {
        title,
        imageUrl,
        location,
        price: price !== undefined ? Number(price) : undefined,
        area: area !== undefined ? Number(area) : undefined,
        bedrooms: bedrooms !== undefined ? Number(bedrooms) : undefined,
        bathrooms: bathrooms !== undefined ? Number(bathrooms) : undefined,
        parking: parking !== undefined ? Number(parking) : undefined,
        propertyType,
        description,
        amenities,
        isActive,
      };

      const property = await this.propertyUseCase.updateProperty(
        id,
        updateData,
        req.user.userId,
        req.user.role
      );

      res.status(200).json({
        message: "Property updated successfully",
        data: property,
      });
    } catch (error) {
      res.status(400).json({
        message:
          error instanceof Error ? error.message : "Failed to update property",
      });
    }
  };

  deleteProperty = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { id } = req.params;

      await this.propertyUseCase.deleteProperty(
        id,
        req.user.userId,
        req.user.role
      );

      res.status(200).json({
        message: "Property deleted successfully",
      });
    } catch (error) {
      res.status(400).json({
        message:
          error instanceof Error ? error.message : "Failed to delete property",
      });
    }
  };

  togglePropertyStatus = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { id } = req.params;

      const property = await this.propertyUseCase.togglePropertyStatus(
        id,
        req.user.userId,
        req.user.role
      );

      res.status(200).json({
        message: "Property status updated successfully",
        data: property,
      });
    } catch (error) {
      res.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Failed to update property status",
      });
    }
  };
}
