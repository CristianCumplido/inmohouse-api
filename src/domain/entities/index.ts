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

// Domain Entities - Capa de Dominio para Appointments

export enum AppointmentStatus {
  PENDING = "Pendiente",
  CONFIRMED = "Confirmada",
  COMPLETED = "Completada",
  CANCELLED = "Cancelada",
}

export interface Appointment {
  id: string;
  propertyId: string;
  clientId: string;
  agentId?: string;
  date: Date;
  startTime: string; // "HH:MM" format
  endTime: string; // "HH:MM" format
  status: AppointmentStatus;
  notes?: string;
  clientNotes?: string;
  agentNotes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AppointmentCreateRequest {
  propertyId: string;
  date: Date;
  startTime: string; // "HH:MM" format
  notes?: string;
}

export interface AppointmentUpdateRequest {
  date?: Date;
  startTime?: string;
  endTime?: string;
  status?: AppointmentStatus;
  notes?: string;
  clientNotes?: string;
  agentNotes?: string;
  agentId?: string;
}

export interface AppointmentFilters extends PaginationQuery {
  propertyId?: string;
  clientId?: string;
  agentId?: string;
  status?: AppointmentStatus;
  dateFrom?: Date;
  dateTo?: Date;
  location?: string; // Para filtrar por ubicación de la propiedad
}

export interface AppointmentWithDetails extends Appointment {
  property?: {
    id: string;
    title: string;
    location: string;
    imageUrl: string;
    price: number;
  };
  client?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  agent?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
}
