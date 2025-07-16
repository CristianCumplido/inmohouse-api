// Infrastructure Repository Implementation - Appointment MongoDB Repository

import {
  Appointment,
  AppointmentCreateRequest,
  AppointmentUpdateRequest,
  AppointmentFilters,
  AppointmentWithDetails,
  AppointmentStatus,
} from "@domain/entities";
import { IAppointmentRepository } from "@domain/repositories";
import {
  AppointmentModel,
  IAppointmentDocument,
} from "@infrastructure/database/models";
import { SortOrder } from "mongoose";

export class AppointmentRepository implements IAppointmentRepository {
  async create(
    appointmentData: AppointmentCreateRequest & {
      clientId: string;
      endTime: string;
      status?: string;
    }
  ): Promise<Appointment> {
    const appointment = new AppointmentModel(appointmentData);
    const savedAppointment = await appointment.save();
    return this.mapToEntity(savedAppointment);
  }

  async findById(id: string): Promise<Appointment | null> {
    const appointment = await AppointmentModel.findById(id);
    return appointment ? this.mapToEntity(appointment) : null;
  }

  async findByIdWithDetails(
    id: string
  ): Promise<AppointmentWithDetails | null> {
    const appointment = await AppointmentModel.findById(id)
      .populate({
        path: "propertyId",
        select: "id title location imageUrl price",
        model: "Property",
      })
      .populate({
        path: "clientId",
        select: "id name email phone",
        model: "User",
      })
      .populate({
        path: "agentId",
        select: "id name email phone",
        model: "User",
      });

    return appointment ? this.mapToEntityWithDetails(appointment) : null;
  }

  async findAll(filters: AppointmentFilters): Promise<{
    appointments: Appointment[];
    total: number;
  }> {
    const query = this.buildQuery(filters);
    const { skip, limit, sort } = this.buildPaginationAndSort(filters);

    const [appointments, total] = await Promise.all([
      AppointmentModel.find(query).sort(sort).skip(skip).limit(limit),
      AppointmentModel.countDocuments(query),
    ]);

    return {
      appointments: appointments.map((app) => this.mapToEntity(app)),
      total,
    };
  }

  async findAllWithDetails(filters: AppointmentFilters): Promise<{
    appointments: AppointmentWithDetails[];
    total: number;
  }> {
    const query = this.buildQuery(filters);
    const { skip, limit, sort } = this.buildPaginationAndSort(filters);

    const [appointments, total] = await Promise.all([
      AppointmentModel.find(query)
        .populate({
          path: "propertyId",
          select: "id title location imageUrl price",
          model: "Property",
        })
        .populate({
          path: "clientId",
          select: "id name email phone",
          model: "User",
        })
        .populate({
          path: "agentId",
          select: "id name email phone",
          model: "User",
        })
        .sort(sort)
        .skip(skip)
        .limit(limit),
      AppointmentModel.countDocuments(query),
    ]);

    return {
      appointments: appointments.map((app) => this.mapToEntityWithDetails(app)),
      total,
    };
  }

  async findByClientId(
    clientId: string,
    filters: AppointmentFilters
  ): Promise<{ appointments: Appointment[]; total: number }> {
    return this.findAll({ ...filters, clientId });
  }

  async findByPropertyId(
    propertyId: string,
    filters: AppointmentFilters
  ): Promise<{ appointments: Appointment[]; total: number }> {
    return this.findAll({ ...filters, propertyId });
  }

  async findByAgentId(
    agentId: string,
    filters: AppointmentFilters
  ): Promise<{ appointments: Appointment[]; total: number }> {
    return this.findAll({ ...filters, agentId });
  }

  async update(
    id: string,
    appointmentData: AppointmentUpdateRequest
  ): Promise<Appointment | null> {
    const updatedAppointment = await AppointmentModel.findByIdAndUpdate(
      id,
      appointmentData,
      { new: true }
    );
    return updatedAppointment ? this.mapToEntity(updatedAppointment) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await AppointmentModel.findByIdAndDelete(id);
    return !!result;
  }

  async findConflictingAppointments(
    propertyId: string,
    date: Date,
    startTime: string,
    endTime: string,
    excludeAppointmentId?: string
  ): Promise<Appointment[]> {
    const query: any = {
      propertyId,
      date: {
        $gte: new Date(date.toISOString().split("T")[0]),
        $lt: new Date(
          new Date(date.getTime() + 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0]
        ),
      },
      status: { $in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
      $or: [
        {
          $and: [
            { startTime: { $lt: endTime } },
            { endTime: { $gt: startTime } },
          ],
        },
      ],
    };

    if (excludeAppointmentId) {
      query._id = { $ne: excludeAppointmentId };
    }

    const conflicts = await AppointmentModel.find(query);
    return conflicts.map((app) => this.mapToEntity(app));
  }

  private buildQuery(filters: AppointmentFilters): any {
    const query: any = {};

    if (filters.propertyId) {
      query.propertyId = filters.propertyId;
    }

    if (filters.clientId) {
      query.clientId = filters.clientId;
    }

    if (filters.agentId) {
      query.agentId = filters.agentId;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.dateFrom || filters.dateTo) {
      query.date = {};
      if (filters.dateFrom) {
        query.date.$gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        query.date.$lte = filters.dateTo;
      }
    }

    return query;
  }

  private buildPaginationAndSort(filters: AppointmentFilters): {
    skip: number;
    limit: number;
    sort: { [key: string]: SortOrder };
  } {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const sortField = filters.sortBy || "date";
    const sortOrder: SortOrder = filters.sortOrder === "desc" ? -1 : 1;
    const sort = { [sortField]: sortOrder };

    return { skip, limit, sort };
  }

  private mapToEntity(doc: IAppointmentDocument): Appointment {
    return {
      id: doc.id,
      propertyId: doc.propertyId,
      clientId: doc.clientId,
      agentId: doc.agentId,
      date: doc.date,
      startTime: doc.startTime,
      endTime: doc.endTime,
      status: doc.status,
      notes: doc.notes,
      clientNotes: doc.clientNotes,
      agentNotes: doc.agentNotes,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  private mapToEntityWithDetails(doc: any): AppointmentWithDetails {
    const appointment = this.mapToEntity(doc);

    return {
      ...appointment,
      property: doc.propertyId
        ? {
            id: doc.propertyId.id || doc.propertyId._id?.toString(),
            title: doc.propertyId.title,
            location: doc.propertyId.location,
            imageUrl: doc.propertyId.imageUrl,
            price: doc.propertyId.price,
          }
        : undefined,
      client: doc.clientId
        ? {
            id: doc.clientId.id || doc.clientId._id?.toString(),
            name: doc.clientId.name,
            email: doc.clientId.email,
            phone: doc.clientId.phone,
          }
        : undefined,
      agent: doc.agentId
        ? {
            id: doc.agentId.id || doc.agentId._id?.toString(),
            name: doc.agentId.name,
            email: doc.agentId.email,
            phone: doc.agentId.phone,
          }
        : undefined,
    };
  }
}
