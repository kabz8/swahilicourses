import express from "express";
import { registerRoutes } from "../server/routes";

// Create an Express app instance for Vercel serverless function to handle all /api/* routes
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register all existing routes on this app. This function returns an http.Server instance,
// which we can ignore in the serverless environment. It does not start listening here.
void registerRoutes(app);

export default app;


