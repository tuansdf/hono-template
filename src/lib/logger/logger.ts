import winston from "winston";

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ level, message, timestamp, stack }) => {
      return `${timestamp} ${level.toUpperCase()}: ${message} ${stack || ""}`;
    }),
  ),
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: "logs/combined.log" })],
});
