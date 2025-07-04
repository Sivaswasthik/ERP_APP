import { Request, Response, NextFunction } from 'express';

export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let error = { ...err };
  error.message = err.message;

  // Log the error for debugging
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new ApiError(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = `Duplicate field value entered`;
    error = new ApiError(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val: any) => val.message).join(', ');
    error = new ApiError(message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Not authorized, token failed';
    error = new ApiError(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Not authorized, token expired';
    error = new ApiError(message, 401);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
  });
};
