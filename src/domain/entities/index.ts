// Domain Entities - Capa de Dominio

export enum UserRole {
  ADMIN = "Administrador",
  AGENT = "Agente",
  CLIENT = "Cliente",
}

export interface Property {
  id: string;
  title: string;
  imageUrl: string;
  location: string;
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  propertyType?: string;
  description?: string;
  amenities?: string[];
  isActive?: boolean;
  agentId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  photo?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
  phone?: string;
  address?: string;
  birthDate?: Date;
}

export interface UserCreateRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  photo?: string;
  phone?: string;
  address?: string;
  birthDate?: Date;
}

export interface UserUpdateRequest {
  name?: string;
  email?: string;
  role?: UserRole;
  photo?: string;
  phone?: string;
  address?: string;
  birthDate?: Date;
  isActive?: boolean;
}

export interface PropertyCreateRequest {
  title: string;
  imageUrl: string;
  location: string;
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  propertyType?: string;
  description?: string;
  amenities?: string[];
}

export interface PropertyUpdateRequest {
  title?: string;
  imageUrl?: string;
  location?: string;
  price?: number;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  parking?: number;
  propertyType?: string;
  description?: string;
  amenities?: string[];
  isActive?: boolean;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PropertyFilters extends PaginationQuery {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
  agentId?: string;
}

export interface UserFilters extends PaginationQuery {
  role?: UserRole;
  isActive?: boolean;
  search?: string;
}
