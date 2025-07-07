// Infrastructure Repositories - Implementación del repositorio de usuarios

import { IUserRepository } from "@domain/repositories";
import {
  User,
  UserCreateRequest,
  UserUpdateRequest,
  UserFilters,
} from "@domain/entities";
import { UserModel, IUserDocument } from "../database/models";

export class MongoUserRepository implements IUserRepository {
  async create(userData: UserCreateRequest): Promise<User> {
    const user = new UserModel(userData);
    const savedUser = await user.save();
    return this.toUser(savedUser);
  }

  async findById(id: string): Promise<User | null> {
    const user = await UserModel.findById(id);
    return user ? this.toUser(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email });
    return user ? this.toUser(user) : null;
  }

  async findByEmailWithPassword(
    email: string
  ): Promise<(User & { password: string }) | null> {
    const user = await UserModel.findOne({ email }).select("+password");
    if (!user) return null;

    return {
      ...this.toUser(user),
      password: user.password,
    };
  }

  async findAll(
    filters: UserFilters = {}
  ): Promise<{ users: User[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      role,
      isActive,
      search,
    } = filters;

    // Construir query
    const query: any = {};

    if (role) {
      query.role = role;
    }

    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Calcular skip
    const skip = (page - 1) * limit;

    // Construir sort
    const sort: any = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Ejecutar consultas
    const [users, total] = await Promise.all([
      UserModel.find(query).sort(sort).skip(skip).limit(limit).exec(),
      UserModel.countDocuments(query),
    ]);

    return {
      users: users.map((user) => this.toUser(user)),
      total,
    };
  }

  async update(id: string, userData: UserUpdateRequest): Promise<User | null> {
    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { ...userData, updatedAt: new Date() },
      { new: true }
    );

    return updatedUser ? this.toUser(updatedUser) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await UserModel.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }

  async updatePassword(id: string, hashedPassword: string): Promise<boolean> {
    const result = await UserModel.updateOne(
      { _id: id },
      { password: hashedPassword, updatedAt: new Date() }
    );
    return result.modifiedCount === 1;
  }

  private toUser(userDoc: IUserDocument): User {
    return {
      id: userDoc._id.toString(),
      name: userDoc.name,
      email: userDoc.email,
      role: userDoc.role,
      photo: userDoc.photo,
      phone: userDoc.phone,
      address: userDoc.address,
      birthDate: userDoc.birthDate,
      isActive: userDoc.isActive,
      createdAt: userDoc.createdAt,
      updatedAt: userDoc.updatedAt,
    };
  }
}
