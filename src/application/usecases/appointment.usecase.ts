// Application Use Cases - Casos de uso de citas

import {
  IAppointmentRepository,
  IPropertyRepository,
  IUserRepository,
} from "@domain/repositories";
import {
  Appointment,
  AppointmentCreateRequest,
  AppointmentUpdateRequest,
  AppointmentFilters,
  AppointmentWithDetails,
  AppointmentStatus,
  UserRole,
} from "@domain/entities";

export class AppointmentUseCase {
  constructor(
    private appointmentRepository: IAppointmentRepository,
    private propertyRepository: IPropertyRepository,
    private userRepository: IUserRepository
  ) {}

  async createAppointment(
    appointmentRequest: AppointmentCreateRequest,
    clientId: string,
    requestingUserRole: UserRole
  ): Promise<Appointment> {
    // Solo clientes pueden crear citas
    // if (requestingUserRole !== UserRole.CLIENT) {
    //   throw new Error("Only clients can create appointments");
    // }

    // Verificar que la propiedad existe
    const property = await this.propertyRepository.findById(
      appointmentRequest.propertyId
    );
    if (!property) {
      throw new Error("Property not found");
    }

    // Validar anticipación mínima de 12 horas
    const appointmentDateTime = new Date(
      `${appointmentRequest.date.toISOString().split("T")[0]}T${
        appointmentRequest.startTime
      }:00`
    );
    const now = new Date();
    const minimumAdvanceTime = new Date(now.getTime() + 12 * 60 * 60 * 1000); // 12 horas

    if (appointmentDateTime <= minimumAdvanceTime) {
      throw new Error(
        "Appointments must be scheduled at least 12 hours in advance"
      );
    }

    // Calcular endTime (1 hora después del startTime)
    const endTime = this.calculateEndTime(appointmentRequest.startTime);

    // Crear la cita
    const appointment = await this.appointmentRepository.create({
      ...appointmentRequest,
      clientId,
      endTime,
      status: AppointmentStatus.PENDING,
    });

    return appointment;
  }

  async getAppointmentById(
    id: string,
    requestingUserId: string,
    requestingUserRole: UserRole
  ): Promise<AppointmentWithDetails> {
    const appointment = await this.appointmentRepository.findByIdWithDetails(
      id
    );
    if (!appointment) {
      throw new Error("Appointment not found");
    }

    // Verificar permisos
    this.checkAppointmentPermissions(
      appointment,
      requestingUserId,
      requestingUserRole
    );

    return appointment;
  }

  async getAllAppointments(
    filters: AppointmentFilters,
    requestingUserId: string,
    requestingUserRole: UserRole
  ): Promise<{ appointments: AppointmentWithDetails[]; total: number }> {
    // Los clientes solo pueden ver sus propias citas
    if (requestingUserRole === UserRole.CLIENT) {
      filters.clientId = requestingUserId;
    }

    return await this.appointmentRepository.findAllWithDetails(filters);
  }

  async getAppointmentsByProperty(
    propertyId: string,
    filters: AppointmentFilters,
    requestingUserId: string,
    requestingUserRole: UserRole
  ): Promise<{ appointments: AppointmentWithDetails[]; total: number }> {
    // Verificar que la propiedad existe
    const property = await this.propertyRepository.findById(propertyId);
    if (!property) {
      throw new Error("Property not found");
    }

    // Los clientes solo pueden ver sus propias citas
    if (requestingUserRole === UserRole.CLIENT) {
      filters.clientId = requestingUserId;
    }

    filters.propertyId = propertyId;
    return await this.appointmentRepository.findAllWithDetails(filters);
  }

  async updateAppointment(
    id: string,
    appointmentRequest: AppointmentUpdateRequest,
    requestingUserId: string,
    requestingUserRole: UserRole
  ): Promise<Appointment> {
    // Verificar que la cita existe
    const existingAppointment = await this.appointmentRepository.findById(id);
    if (!existingAppointment) {
      throw new Error("Appointment not found");
    }

    // Verificar permisos
    this.checkAppointmentPermissions(
      existingAppointment,
      requestingUserId,
      requestingUserRole
    );

    // Los clientes solo pueden cancelar citas
    if (requestingUserRole === UserRole.CLIENT) {
      if (
        appointmentRequest.status &&
        appointmentRequest.status !== AppointmentStatus.CANCELLED
      ) {
        throw new Error("Clients can only cancel appointments");
      }
      // Restricgir campos que puede modificar el cliente
      appointmentRequest = {
        status: appointmentRequest.status,
        clientNotes: appointmentRequest.clientNotes,
      };
    }

    // Si se está cambiando la fecha/hora, validar anticipación
    if (appointmentRequest.date || appointmentRequest.startTime) {
      const newDate = appointmentRequest.date || existingAppointment.date;
      const newStartTime =
        appointmentRequest.startTime || existingAppointment.startTime;

      const appointmentDateTime = new Date(
        `${newDate.toISOString().split("T")[0]}T${newStartTime}:00`
      );
      const now = new Date();
      const minimumAdvanceTime = new Date(now.getTime() + 12 * 60 * 60 * 1000);

      if (appointmentDateTime <= minimumAdvanceTime) {
        throw new Error(
          "Appointments must be scheduled at least 12 hours in advance"
        );
      }

      // Recalcular endTime si se cambió startTime
      if (appointmentRequest.startTime) {
        appointmentRequest.endTime = this.calculateEndTime(
          appointmentRequest.startTime
        );
      }
    }

    const updatedAppointment = await this.appointmentRepository.update(
      id,
      appointmentRequest
    );
    if (!updatedAppointment) {
      throw new Error("Failed to update appointment");
    }

    return updatedAppointment;
  }

  async cancelAppointment(
    id: string,
    requestingUserId: string,
    requestingUserRole: UserRole
  ): Promise<Appointment> {
    return await this.updateAppointment(
      id,
      { status: AppointmentStatus.CANCELLED },
      requestingUserId,
      requestingUserRole
    );
  }

  async confirmAppointment(
    id: string,
    agentId: string,
    requestingUserId: string,
    requestingUserRole: UserRole
  ): Promise<Appointment> {
    // Solo agentes y administradores pueden confirmar citas
    if (
      requestingUserRole !== UserRole.AGENT &&
      requestingUserRole !== UserRole.ADMIN
    ) {
      throw new Error(
        "Only agents and administrators can confirm appointments"
      );
    }

    // Verificar que el agente existe
    const agent = await this.userRepository.findById(agentId);
    if (!agent || agent.role !== UserRole.AGENT) {
      throw new Error("Agent not found");
    }

    return await this.updateAppointment(
      id,
      {
        status: AppointmentStatus.CONFIRMED,
        agentId: agentId,
      },
      requestingUserId,
      requestingUserRole
    );
  }

  async completeAppointment(
    id: string,
    requestingUserId: string,
    requestingUserRole: UserRole
  ): Promise<Appointment> {
    // Solo agentes y administradores pueden completar citas
    if (
      requestingUserRole !== UserRole.AGENT &&
      requestingUserRole !== UserRole.ADMIN
    ) {
      throw new Error(
        "Only agents and administrators can complete appointments"
      );
    }

    return await this.updateAppointment(
      id,
      { status: AppointmentStatus.COMPLETED },
      requestingUserId,
      requestingUserRole
    );
  }

  private calculateEndTime(startTime: string): string {
    const [hours, minutes] = startTime.split(":").map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + 60; // Agregar 1 hora

    const endHours = Math.floor(endMinutes / 60) % 24;
    const endMins = endMinutes % 60;

    return `${endHours.toString().padStart(2, "0")}:${endMins
      .toString()
      .padStart(2, "0")}`;
  }

  private checkAppointmentPermissions(
    appointment: Appointment,
    requestingUserId: string,
    requestingUserRole: UserRole
  ): void {
    if (requestingUserRole === UserRole.ADMIN) {
      return; // Admin puede ver todo
    }

    if (requestingUserRole === UserRole.AGENT) {
      return; // Agentes pueden ver todas las citas según requerimientos
    }

    if (
      requestingUserRole === UserRole.CLIENT &&
      appointment.clientId !== requestingUserId
    ) {
      throw new Error("Insufficient permissions");
    }
  }
}
