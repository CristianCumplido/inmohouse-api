// Infrastructure Database Connection - Conexión a MongoDB

import mongoose from "mongoose";

export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async connect(uri: string): Promise<void> {
    if (this.isConnected) {
      console.log("Database already connected");
      return;
    }

    try {
      const options = {
        autoIndex: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4,
      };

      await mongoose.connect(uri, options);
      this.isConnected = true;
      console.log("MongoDB connected successfully");

      // Event listeners
      mongoose.connection.on("error", (error) => {
        console.error("MongoDB connection error:", error);
        this.isConnected = false;
      });

      mongoose.connection.on("disconnected", () => {
        console.log("MongoDB disconnected");
        this.isConnected = false;
      });

      mongoose.connection.on("reconnected", () => {
        console.log("MongoDB reconnected");
        this.isConnected = true;
      });

      // Graceful shutdown
      process.on("SIGINT", async () => {
        await this.disconnect();
        process.exit(0);
      });
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log("MongoDB disconnected");
    } catch (error) {
      console.error("Error disconnecting from MongoDB:", error);
      throw error;
    }
  }

  public isConnectionActive(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }
}
