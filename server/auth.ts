import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, IUser } from '@shared/schema';
import { Document, Types } from 'mongoose';
import { ApiError } from './utils/errorHandler';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey'; // Use a strong secret in production
const JWT_EXPIRES_IN = '1h';

export const generateToken = (userId: any) => {
  const id = userId.toString(); // Assume userId will always have a toString method (e.g., ObjectId)
  return jwt.sign({ userId: id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = (password: string, hashedPassword: string) => {
  return bcrypt.compare(password, hashedPassword);
};

export const protect = (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ApiError('Not authorized, no token', 401));
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded.userId; // Attach user ID to request
    next();
  } catch (error) {
    next(error); // Pass JWT errors to the error handler
  }
};

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, firstName, lastName } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ApiError('User already exists', 400));
    }

    const hashedPassword = await hashPassword(password);

    const newUser = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      profileImageUrl: '', // Default empty
      role: 'staff', // Default role
    });

    const savedUser: IUser = await newUser.save();

    const token = generateToken(savedUser._id as Types.ObjectId);

    res.status(201).json({
      id: (savedUser._id as Types.ObjectId).toString(),
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role,
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // For JWT, client-side token removal is primary.
    // If sessions were used, this is where you'd destroy them.
    // For more advanced JWT invalidation (e.g., blacklisting),
    // that logic would go here.
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }) as IUser | null;

    if (!user || !(await comparePassword(password, user.password!))) {
      return next(new ApiError('Invalid credentials', 400));
    }

    const token = generateToken(user._id as Types.ObjectId);

    res.json({
      id: (user._id as Types.ObjectId).toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      token,
    });
  } catch (error) {
    next(error);
  }
};
