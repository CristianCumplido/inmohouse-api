// Application Use Cases - Casos de uso de usuarios

import { IUserRepository } from "@domain/repositories";
import { IPasswordService } from "@domain/services";
import {
  User,
  UserCreateRequest,
  UserUpdateRequest,
  UserFilters,
  UserRole,
} from "@domain/entities";

export class UserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private passwordService: IPasswordService
  ) {}

  async createUser(
    userRequest: UserCreateRequest,
    requestingUserRole: UserRole
  ): Promise<User> {
    // Verificar permisos - Solo admin puede crear usuarios
    if (requestingUserRole !== UserRole.ADMIN) {
      throw new Error("Insufficient permissions");
    }

    // Verificar si el email ya existe
    const existingUser = await this.userRepository.findByEmail(
      userRequest.email
    );
    if (existingUser) {
      throw new Error("Email already registered");
    }

    // Hashear la contraseña
    const hashedPassword = await this.passwordService.hash(
      userRequest.password
    );

    // Crear usuario
    const user = await this.userRepository.create({
      ...userRequest,
      password: hashedPassword,
    });

    return user;
  }

  async getUserById(
    id: string,
    requestingUserId: string,
    requestingUserRole: UserRole
  ): Promise<User> {
    // Verificar permisos
    if (requestingUserRole !== UserRole.ADMIN && requestingUserId !== id) {
      throw new Error("Insufficient permissions");
    }

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  async getAllUsers(
    filters: UserFilters,
    requestingUserRole: UserRole
  ): Promise<{ users: User[]; total: number }> {
    // Verificar permisos - Solo admin puede ver todos los usuarios
    if (requestingUserRole !== UserRole.ADMIN) {
      throw new Error("Insufficient permissions");
    }

    return await this.userRepository.findAll(filters);
  }

  async updateUser(
    id: string,
    userRequest: UserUpdateRequest,
    requestingUserId: string,
    requestingUserRole: UserRole
  ): Promise<User> {
    // Verificar permisos
    if (requestingUserRole !== UserRole.ADMIN && requestingUserId !== id) {
      throw new Error("Insufficient permissions");
    }

    // No permitir que usuarios no admin cambien el rol
    if (requestingUserRole !== UserRole.ADMIN && userRequest.role) {
      throw new Error("Cannot change user role");
    }

    // Verificar si el usuario existe
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new Error("User not found");
    }

    // Si se está actualizando el email, verificar que no exista
    if (userRequest.email && userRequest.email !== existingUser.email) {
      const emailExists = await this.userRepository.findByEmail(
        userRequest.email
      );
      if (emailExists) {
        throw new Error("Email already registered");
      }
    }

    const updatedUser = await this.userRepository.update(id, userRequest);
    if (!updatedUser) {
      throw new Error("Failed to update user");
    }

    return updatedUser;
  }

  async deleteUser(id: string, requestingUserRole: UserRole): Promise<void> {
    // Verificar permisos - Solo admin puede eliminar usuarios
    if (requestingUserRole !== UserRole.ADMIN) {
      throw new Error("Insufficient permissions");
    }

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error("User not found");
    }

    const deleted = await this.userRepository.delete(id);
    if (!deleted) {
      throw new Error("Failed to delete user");
    }
  }

  async updateUserPassword(
    id: string,
    currentPassword: string,
    newPassword: string,
    requestingUserId: string,
    requestingUserRole: UserRole
  ): Promise<void> {
    // Verificar permisos
    if (requestingUserRole !== UserRole.ADMIN && requestingUserId !== id) {
      throw new Error("Insufficient permissions");
    }

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error("User not found");
    }

    // Para usuarios no admin, verificar la contraseña actual
    if (requestingUserRole !== UserRole.ADMIN) {
      // Aquí necesitaríamos verificar la contraseña actual
      // Esta lógica debe ser implementada
    }

    const hashedPassword = await this.passwordService.hash(newPassword);
    const updated = await this.userRepository.updatePassword(
      id,
      hashedPassword
    );

    if (!updated) {
      throw new Error("Failed to update password");
    }
  }
}
