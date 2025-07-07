// Main Server File - Punto de entrada de la aplicación

import dotenv from "dotenv";
import { ServerConfig } from "./infrastructure/config/server";
import { DatabaseConnection } from "./infrastructure/database/connection";

// Load environment variables
dotenv.config();

class Application {
  private server: ServerConfig;
  private database: DatabaseConnection;

  constructor() {
    this.server = new ServerConfig();
    this.database = DatabaseConnection.getInstance();
  }

  public async start(): Promise<void> {
    try {
      // Connect to database
      const mongoUri =
        process.env.MONGODB_URI ||
        "mongodb+srv://cristiancumplido:awdvxVitKifXzCye@cluster0.k9fdyni.mongodb.net/inmoHouse?retryWrites=true&w=majority&appName=Cluster0";
      await this.database.connect(mongoUri);

      // Start server
      const port = parseInt(process.env.PORT || "3000");
      await this.server.start(port);

      console.log("✅ Application started successfully");
    } catch (error) {
      console.error("❌ Failed to start application:", error);
      process.exit(1);
    }
  }

  public async shutdown(): Promise<void> {
    try {
      console.log("🔄 Shutting down application...");
      await this.database.disconnect();
      console.log("✅ Application shutdown complete");
    } catch (error) {
      console.error("❌ Error during shutdown:", error);
      process.exit(1);
    }
  }
}

// Create and start application
const app = new Application();

// Graceful shutdown handling
process.on("SIGTERM", async () => {
  console.log("SIGTERM received");
  await app.shutdown();
});

process.on("SIGINT", async () => {
  console.log("SIGINT received");
  await app.shutdown();
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Start the application
app.start().catch((error) => {
  console.error("Failed to start application:", error);
  process.exit(1);
});
