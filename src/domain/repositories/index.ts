// Domain Repositories - Interfaces de la capa de dominio

import {
  User,
  UserCreateRequest,
  UserUpdateRequest,
  UserFilters,
} from "../entities";
import {
  Property,
  PropertyCreateRequest,
  PropertyUpdateRequest,
  PropertyFilters,
} from "../entities";

export interface IUserRepository {
  create(userData: UserCreateRequest): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByEmailWithPassword(
    email: string
  ): Promise<(User & { password: string }) | null>;
  findAll(filters?: UserFilters): Promise<{ users: User[]; total: number }>;
  update(id: string, userData: UserUpdateRequest): Promise<User | null>;
  delete(id: string): Promise<boolean>;
  updatePassword(id: string, hashedPassword: string): Promise<boolean>;
}

export interface IPropertyRepository {
  create(
    propertyData: PropertyCreateRequest & { agentId?: string }
  ): Promise<Property>;
  findById(id: string): Promise<Property | null>;
  findAll(
    filters?: PropertyFilters
  ): Promise<{ properties: Property[]; total: number }>;
  update(
    id: string,
    propertyData: PropertyUpdateRequest
  ): Promise<Property | null>;
  delete(id: string): Promise<boolean>;
  findByAgentId(
    agentId: string,
    filters?: PropertyFilters
  ): Promise<{ properties: Property[]; total: number }>;
}
