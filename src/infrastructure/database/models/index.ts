// Infrastructure Database Models - Modelos de MongoDB

import mongoose, { Schema, Document } from "mongoose";
import { UserRole } from "@domain/entities";

// User Model
export interface IUserDocument extends Document {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  photo?: string;
  phone?: string;
  address?: string;
  birthDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // No incluir por defecto en las consultas
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
    },
    photo: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      default: null,
    },
    address: {
      type: String,
      default: null,
    },
    birthDate: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
      },
    },
  }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Property Model
export interface IPropertyDocument extends Document {
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
  isActive: boolean;
  agentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const propertySchema = new Schema<IPropertyDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    area: {
      type: Number,
      required: true,
      min: 0,
    },
    bedrooms: {
      type: Number,
      required: true,
      min: 0,
    },
    bathrooms: {
      type: Number,
      required: true,
      min: 0,
    },
    parking: {
      type: Number,
      required: true,
      min: 0,
    },
    propertyType: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    amenities: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    agentId: {
      type: String,
      default: null,
      ref: "User",
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
      },
    },
  }
);

// Indexes
propertySchema.index({ location: 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ area: 1 });
propertySchema.index({ bedrooms: 1 });
propertySchema.index({ bathrooms: 1 });
propertySchema.index({ propertyType: 1 });
propertySchema.index({ agentId: 1 });
propertySchema.index({ isActive: 1 });

// Compound indexes for common queries
propertySchema.index({ location: 1, price: 1 });
propertySchema.index({ bedrooms: 1, bathrooms: 1 });

export const UserModel = mongoose.model<IUserDocument>("User", userSchema);
export const PropertyModel = mongoose.model<IPropertyDocument>(
  "Property",
  propertySchema
);
