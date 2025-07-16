// Domain Repositories - Interfaces de la capa de dominio

import {
  User,
  UserCreateRequest,
  UserUpdateRequest,
  UserFilters,
  Appointment,
  AppointmentCreateRequest,
  AppointmentFilters,
  AppointmentUpdateRequest,
  AppointmentWithDetails,
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
  findAllbyAgent(
    filters?: UserFilters
  ): Promise<{ users: User[]; total: number }>;

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
export interface IAppointmentRepository {
  create(
    appointmentData: AppointmentCreateRequest & {
      clientId: string;
      endTime: string;
      status?: string;
    }
  ): Promise<Appointment>;

  findById(id: string): Promise<Appointment | null>;

  findByIdWithDetails(id: string): Promise<AppointmentWithDetails | null>;

  findAll(filters: AppointmentFilters): Promise<{
    appointments: Appointment[];
    total: number;
  }>;

  findAllWithDetails(filters: AppointmentFilters): Promise<{
    appointments: AppointmentWithDetails[];
    total: number;
  }>;

  findByClientId(
    clientId: string,
    filters: AppointmentFilters
  ): Promise<{
    appointments: Appointment[];
    total: number;
  }>;

  findByPropertyId(
    propertyId: string,
    filters: AppointmentFilters
  ): Promise<{
    appointments: Appointment[];
    total: number;
  }>;

  findByAgentId(
    agentId: string,
    filters: AppointmentFilters
  ): Promise<{
    appointments: Appointment[];
    total: number;
  }>;

  update(
    id: string,
    appointmentData: AppointmentUpdateRequest
  ): Promise<Appointment | null>;

  delete(id: string): Promise<boolean>;

  // Métodos para validar disponibilidad (futuras implementaciones)
  findConflictingAppointments(
    propertyId: string,
    date: Date,
    startTime: string,
    endTime: string,
    excludeAppointmentId?: string
  ): Promise<Appointment[]>;
}
