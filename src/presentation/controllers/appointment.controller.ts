// Presentation Controllers - Controlador de citas

import { Response } from "express";
import { AppointmentUseCase } from "@application/usecases/appointment.usecase";
import { AuthenticatedRequest } from "@infrastructure/middleware";
import { AppointmentStatus } from "@domain/entities";

export class AppointmentController {
  constructor(private appointmentUseCase: AppointmentUseCase) {}

  createAppointment = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { propertyId, date, startTime, notes } = req.body;

      if (!propertyId || !date || !startTime) {
        return res.status(400).json({
          message: "Property ID, date, and start time are required",
        });
      }

      // Validar formato de fecha y hora
      const appointmentDate = new Date(date);
      if (isNaN(appointmentDate.getTime())) {
        return res.status(400).json({
          message: "Invalid date format",
        });
      }

      if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(startTime)) {
        return res.status(400).json({
          message: "Invalid time format. Use HH:MM",
        });
      }

      const appointment = await this.appointmentUseCase.createAppointment(
        {
          propertyId,
          date: appointmentDate,
          startTime,
          notes,
        },
        req.user.userId,
        req.user.role
      );

      res.status(201).json({
        message: "Appointment created successfully",
        data: appointment,
      });
    } catch (error) {
      res.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Failed to create appointment",
      });
    }
  };

  getAppointmentById = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { id } = req.params;

      const appointment = await this.appointmentUseCase.getAppointmentById(
        id,
        req.user.userId,
        req.user.role
      );

      res.status(200).json({
        message: "Appointment retrieved successfully",
        data: appointment,
      });
    } catch (error) {
      res.status(404).json({
        message:
          error instanceof Error ? error.message : "Appointment not found",
      });
    }
  };

  getAllAppointments = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const {
        page,
        limit,
        sortBy,
        sortOrder,
        propertyId,
        clientId,
        agentId,
        status,
        dateFrom,
        dateTo,
        location,
      } = req.query;

      const filters = {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as "asc" | "desc",
        propertyId: propertyId as string,
        clientId: clientId as string,
        agentId: agentId as string,
        status: status as AppointmentStatus,
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined,
        location: location as string,
      };

      const result = await this.appointmentUseCase.getAllAppointments(
        filters,
        req.user.userId,
        req.user.role
      );

      res.status(200).json({
        message: "Appointments retrieved successfully",
        data: result.appointments,
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
          error instanceof Error ? error.message : "Failed to get appointments",
      });
    }
  };

  getAppointmentsByProperty = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { propertyId } = req.params;
      const {
        page,
        limit,
        sortBy,
        sortOrder,
        clientId,
        agentId,
        status,
        dateFrom,
        dateTo,
      } = req.query;

      const filters = {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as "asc" | "desc",
        clientId: clientId as string,
        agentId: agentId as string,
        status: status as AppointmentStatus,
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined,
      };

      const result = await this.appointmentUseCase.getAppointmentsByProperty(
        propertyId,
        filters,
        req.user.userId,
        req.user.role
      );

      res.status(200).json({
        message: "Property appointments retrieved successfully",
        data: result.appointments,
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
          error instanceof Error
            ? error.message
            : "Failed to get property appointments",
      });
    }
  };

  updateAppointment = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { id } = req.params;
      const {
        date,
        startTime,
        status,
        notes,
        clientNotes,
        agentNotes,
        agentId,
      } = req.body;

      const updateData: any = {};

      if (date) {
        const appointmentDate = new Date(date);
        if (isNaN(appointmentDate.getTime())) {
          return res.status(400).json({
            message: "Invalid date format",
          });
        }
        updateData.date = appointmentDate;
      }

      if (startTime) {
        if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(startTime)) {
          return res.status(400).json({
            message: "Invalid time format. Use HH:MM",
          });
        }
        updateData.startTime = startTime;
      }

      if (status) {
        if (!Object.values(AppointmentStatus).includes(status)) {
          return res.status(400).json({
            message: "Invalid appointment status",
          });
        }
        updateData.status = status;
      }

      if (notes !== undefined) updateData.notes = notes;
      if (clientNotes !== undefined) updateData.clientNotes = clientNotes;
      if (agentNotes !== undefined) updateData.agentNotes = agentNotes;
      if (agentId !== undefined) updateData.agentId = agentId;

      const appointment = await this.appointmentUseCase.updateAppointment(
        id,
        updateData,
        req.user.userId,
        req.user.role
      );

      res.status(200).json({
        message: "Appointment updated successfully",
        data: appointment,
      });
    } catch (error) {
      res.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Failed to update appointment",
      });
    }
  };

  cancelAppointment = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { id } = req.params;

      const appointment = await this.appointmentUseCase.cancelAppointment(
        id,
        req.user.userId,
        req.user.role
      );

      res.status(200).json({
        message: "Appointment cancelled successfully",
        data: appointment,
      });
    } catch (error) {
      res.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Failed to cancel appointment",
      });
    }
  };

  confirmAppointment = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { id } = req.params;
      const { agentId } = req.body;

      if (!agentId) {
        return res.status(400).json({
          message: "Agent ID is required",
        });
      }

      const appointment = await this.appointmentUseCase.confirmAppointment(
        id,
        agentId,
        req.user.userId,
        req.user.role
      );

      res.status(200).json({
        message: "Appointment confirmed successfully",
        data: appointment,
      });
    } catch (error) {
      res.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Failed to confirm appointment",
      });
    }
  };

  completeAppointment = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { id } = req.params;

      const appointment = await this.appointmentUseCase.completeAppointment(
        id,
        req.user.userId,
        req.user.role
      );

      res.status(200).json({
        message: "Appointment completed successfully",
        data: appointment,
      });
    } catch (error) {
      res.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Failed to complete appointment",
      });
    }
  };
}
