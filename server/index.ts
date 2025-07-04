import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { connectDB } from "./db";
import swaggerUi from 'swagger-ui-express';
import swaggerSpecs from './swagger';
import { errorHandler, ApiError } from './utils/errorHandler';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173', // Allow requests from your client-side application
  credentials: true, // Allow cookies to be sent with requests
}));

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await connectDB();
  const server = await registerRoutes(app);

  app.use(errorHandler);

  // The server will now only serve the API. The client will be served separately.
  const port = 5001; // Changed port from 5000 to 5001
  server.listen({
    port,
    host: "127.0.0.1",
  }, () => {
    log(`API serving on port ${port}`);
  });
})();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error, promise: Promise<any>) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});
