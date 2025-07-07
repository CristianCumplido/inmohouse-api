// Application Use Cases - Casos de uso de propiedades

import { IPropertyRepository } from "@domain/repositories";
import {
  Property,
  PropertyCreateRequest,
  PropertyUpdateRequest,
  PropertyFilters,
  UserRole,
} from "@domain/entities";

export class PropertyUseCase {
  constructor(private propertyRepository: IPropertyRepository) {}

  async createProperty(
    propertyRequest: PropertyCreateRequest,
    requestingUserId: string,
    requestingUserRole: UserRole
  ): Promise<Property> {
    // Verificar permisos - Admin y Agent pueden crear propiedades
    if (
      requestingUserRole !== UserRole.ADMIN &&
      requestingUserRole !== UserRole.AGENT
    ) {
      throw new Error("Insufficient permissions");
    }

    // Si es un agente, asignar la propiedad al agente
    const agentId =
      requestingUserRole === UserRole.AGENT ? requestingUserId : undefined;

    const property = await this.propertyRepository.create({
      ...propertyRequest,
      agentId,
    });

    return property;
  }

  async getPropertyById(id: string): Promise<Property> {
    const property = await this.propertyRepository.findById(id);
    if (!property) {
      throw new Error("Property not found");
    }

    return property;
  }

  async getAllProperties(
    filters: PropertyFilters
  ): Promise<{ properties: Property[]; total: number }> {
    return await this.propertyRepository.findAll(filters);
  }

  async getPropertiesByAgent(
    agentId: string,
    filters: PropertyFilters,
    requestingUserId: string,
    requestingUserRole: UserRole
  ): Promise<{ properties: Property[]; total: number }> {
    // Verificar permisos - Admin puede ver todas, Agent solo las suyas
    if (requestingUserRole !== UserRole.ADMIN && requestingUserId !== agentId) {
      throw new Error("Insufficient permissions");
    }

    return await this.propertyRepository.findByAgentId(agentId, filters);
  }

  async updateProperty(
    id: string,
    propertyRequest: PropertyUpdateRequest,
    requestingUserId: string,
    requestingUserRole: UserRole
  ): Promise<Property> {
    // Verificar que la propiedad existe
    const existingProperty = await this.propertyRepository.findById(id);
    if (!existingProperty) {
      throw new Error("Property not found");
    }

    // Verificar permisos
    if (
      requestingUserRole !== UserRole.ADMIN &&
      (requestingUserRole !== UserRole.AGENT ||
        existingProperty.agentId !== requestingUserId)
    ) {
      throw new Error("Insufficient permissions");
    }

    const updatedProperty = await this.propertyRepository.update(
      id,
      propertyRequest
    );
    if (!updatedProperty) {
      throw new Error("Failed to update property");
    }

    return updatedProperty;
  }

  async deleteProperty(
    id: string,
    requestingUserId: string,
    requestingUserRole: UserRole
  ): Promise<void> {
    // Verificar que la propiedad existe
    const existingProperty = await this.propertyRepository.findById(id);
    if (!existingProperty) {
      throw new Error("Property not found");
    }

    // Verificar permisos
    if (
      requestingUserRole !== UserRole.ADMIN &&
      (requestingUserRole !== UserRole.AGENT ||
        existingProperty.agentId !== requestingUserId)
    ) {
      throw new Error("Insufficient permissions");
    }

    const deleted = await this.propertyRepository.delete(id);
    if (!deleted) {
      throw new Error("Failed to delete property");
    }
  }

  async togglePropertyStatus(
    id: string,
    requestingUserId: string,
    requestingUserRole: UserRole
  ): Promise<Property> {
    // Verificar que la propiedad existe
    const existingProperty = await this.propertyRepository.findById(id);
    if (!existingProperty) {
      throw new Error("Property not found");
    }

    // Verificar permisos
    if (
      requestingUserRole !== UserRole.ADMIN &&
      (requestingUserRole !== UserRole.AGENT ||
        existingProperty.agentId !== requestingUserId)
    ) {
      throw new Error("Insufficient permissions");
    }

    const updatedProperty = await this.propertyRepository.update(id, {
      isActive: !existingProperty.isActive,
    });

    if (!updatedProperty) {
      throw new Error("Failed to update property status");
    }

    return updatedProperty;
  }
}
