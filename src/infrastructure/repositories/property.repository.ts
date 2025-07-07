// Infrastructure Repositories - Implementación del repositorio de propiedades

import { IPropertyRepository } from "@domain/repositories";
import {
  Property,
  PropertyCreateRequest,
  PropertyUpdateRequest,
  PropertyFilters,
} from "@domain/entities";
import { PropertyModel, IPropertyDocument } from "../database/models";

export class MongoPropertyRepository implements IPropertyRepository {
  async create(
    propertyData: PropertyCreateRequest & { agentId?: string }
  ): Promise<Property> {
    const property = new PropertyModel(propertyData);
    const savedProperty = await property.save();
    return this.toProperty(savedProperty);
  }

  async findById(id: string): Promise<Property | null> {
    const property = await PropertyModel.findById(id);
    return property ? this.toProperty(property) : null;
  }

  async findAll(
    filters: PropertyFilters = {}
  ): Promise<{ properties: Property[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      location,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      bedrooms,
      bathrooms,
      propertyType,
      agentId,
    } = filters;

    // Construir query
    const query: any = {};

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = minPrice;
      if (maxPrice !== undefined) query.price.$lte = maxPrice;
    }

    if (minArea !== undefined || maxArea !== undefined) {
      query.area = {};
      if (minArea !== undefined) query.area.$gte = minArea;
      if (maxArea !== undefined) query.area.$lte = maxArea;
    }

    if (bedrooms !== undefined) {
      query.bedrooms = bedrooms;
    }

    if (bathrooms !== undefined) {
      query.bathrooms = bathrooms;
    }

    if (propertyType) {
      query.propertyType = propertyType;
    }

    if (agentId) {
      query.agentId = agentId;
    }

    // Solo mostrar propiedades activas por defecto
    query.isActive = true;

    // Calcular skip
    const skip = (page - 1) * limit;

    // Construir sort
    const sort: any = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Ejecutar consultas
    const [properties, total] = await Promise.all([
      PropertyModel.find(query).sort(sort).skip(skip).limit(limit).exec(),
      PropertyModel.countDocuments(query),
    ]);

    return {
      properties: properties.map((property) => this.toProperty(property)),
      total,
    };
  }

  async update(
    id: string,
    propertyData: PropertyUpdateRequest
  ): Promise<Property | null> {
    const updatedProperty = await PropertyModel.findByIdAndUpdate(
      id,
      { ...propertyData, updatedAt: new Date() },
      { new: true }
    );

    return updatedProperty ? this.toProperty(updatedProperty) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await PropertyModel.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }

  async findByAgentId(
    agentId: string,
    filters: PropertyFilters = {}
  ): Promise<{ properties: Property[]; total: number }> {
    const agentFilters = { ...filters, agentId };
    return this.findAll(agentFilters);
  }

  private toProperty(propertyDoc: IPropertyDocument): Property {
    return {
      id: propertyDoc._id.toString(),
      title: propertyDoc.title,
      imageUrl: propertyDoc.imageUrl,
      location: propertyDoc.location,
      price: propertyDoc.price,
      area: propertyDoc.area,
      bedrooms: propertyDoc.bedrooms,
      bathrooms: propertyDoc.bathrooms,
      parking: propertyDoc.parking,
      propertyType: propertyDoc.propertyType,
      description: propertyDoc.description,
      amenities: propertyDoc.amenities,
      isActive: propertyDoc.isActive,
      agentId: propertyDoc.agentId,
      createdAt: propertyDoc.createdAt,
      updatedAt: propertyDoc.updatedAt,
    };
  }
}
