import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import compression from "compression";
import http from "http";
import https from "https";
import path from "path";
import multer from 'multer';
import cron from 'node-cron';

import ConnectDB from "./src/config/db.config";
import AppError from "./src/errors/AppError";
import GlobalErrorHandler from "./src/errors/errorHandler";

// import authRoutes from "./src/routes/auth.route";


import Limiter from "./src/middleware/rateLimit";
import logger, { logRequest } from "./src/middleware/logger";
import { COOKIE_SECRET, PORT } from "./src/serviceUrl";

dotenv.config();
const port = PORT || 8081;

const app = express();
process.on("uncaughtException", (err: Error) => {
  logger.error("Unhandled Exception, shutting down...");
  logger.error(`${err.name}: ${err.message}`);
  process.exit(1);
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", 1);
app.use(multer().any());


app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  })
);

app.use(cookieParser(COOKIE_SECRET));
app.use(helmet({
  contentSecurityPolicy: false,
}));

//set view engine
app.set("views", path.join(__dirname, "src/views"));
app.set("view engine", "ejs");

//This code is converting our req.body to a string which is actually false.
// app.use(sanitizeInputs);
app.use(mongoSanitize());
app.use(logRequest);
const shouldCompress = (req: express.Request, res: express.Response) => {
  if (req.headers["x-no-compression"]) {
    // Don't compress responses if this request header is present
    return false;
  }
  return compression.filter(req, res);
};

app.use(compression({ filter: shouldCompress }));

//All Routes comes in Here
// app.use("/v1/api/auth", authRoutes);



app.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.send("Hi");
});

app.use("*", (req: Request, res: Response, next: NextFunction) => {
  const errorMessage = `Can not find ${req.originalUrl} with ${req.method} on this server`;
  logger.warn(errorMessage);
  next(new AppError(errorMessage, 501));
});

app.use(GlobalErrorHandler);
const server = ConnectDB().then(() => {
  const httpServer = http.createServer(app);
  httpServer.listen(port, () => {
    logger.info(`Server running on port ${port}`);
  });

  return httpServer;
});

process.on("unhandledRejection", (err: Error) => {
  logger.error("Unhandled Rejection, shutting down server...");
  logger.error(`${err.name}: ${err.message}`);
  server.catch(() => {
    process.exit(1);
  });
});

// Optional: Handle SIGTERM for graceful shutdown
process.on("SIGTERM", () => {
  server.then((httpServer) => {
    logger.info("SIGTERM received. Shutting down gracefully...");
    httpServer.close(() => {
      logger.info("Server closed");
      process.exit(0);
    });
  });
});


// function keepAlive(url: string) {
//   https
//     .get(url, (res) => {
//       logger.info(`[KEEP-ALIVE] Pinged ${url} — Status: ${res.statusCode}`);
//       res.resume(); // prevent memory leak
//     })
//     .on("error", (error) => {
//       logger.error(`[KEEP-ALIVE ERROR] ${error.message}`);
//     });
// }

// // Cron job — runs every 14 minutes
// cron.schedule("*/50 * * * *", () => {
//   const timestamp = new Date().toISOString();
//   logger.info(`[CRON] Keep-alive triggered at ${timestamp}`);
//   keepAlive("https://connected-backend-14v7.onrender.com");
// });