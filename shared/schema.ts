import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password?: string; // Password can be optional for certain operations (e.g., fetching user without password)
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  role: 'admin' | 'manager' | 'staff';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProduct extends Document {
  name: string;
  description?: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'discontinued';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IOrder extends Document {
  orderNumber: string;
  customerName: string;
  customerEmail?: string;
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  type: 'sale' | 'purchase';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IOrderItem extends Document {
  orderId: Schema.Types.ObjectId;
  productId: Schema.Types.ObjectId;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface IEmployee extends Document {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  department: string;
  salary?: number;
  hireDate: Date;
  status: 'active' | 'on_leave' | 'terminated';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITransaction extends Document {
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  date: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  firstName: { type: String },
  lastName: { type: String },
  profileImageUrl: { type: String },
  role: { type: String, enum: ['admin', 'manager', 'staff'], default: 'staff' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const productSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  description: { type: String },
  sku: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  status: { type: String, enum: ['active', 'discontinued'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const orderSchema = new Schema<IOrder>({
  orderNumber: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'cancelled'], default: 'pending' },
  type: { type: String, enum: ['sale', 'purchase'], default: 'sale' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const orderItemSchema = new Schema<IOrderItem>({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
});

const employeeSchema = new Schema<IEmployee>({
  employeeId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  position: { type: String, required: true },
  department: { type: String, required: true },
  salary: { type: Number },
  hireDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'on_leave', 'terminated'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const transactionSchema = new Schema<ITransaction>({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['income', 'expense', 'transfer'], required: true },
  category: { type: String, required: true },
  date: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

import { z } from 'zod';

export const User = model<IUser>('User', userSchema);
export const Product = model<IProduct>('Product', productSchema);
export const Order = model<IOrder>('Order', orderSchema);
export const OrderItem = model<IOrderItem>('OrderItem', orderItemSchema);
export const Employee = model<IEmployee>('Employee', employeeSchema);
export const Transaction = model<ITransaction>('Transaction', transactionSchema);

// Zod Schemas for validation
export const insertProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  sku: z.string().min(1, "SKU is required"),
  category: z.string().min(1, "Category is required"),
  price: z.number().positive("Price must be a positive number"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  status: z.enum(['active', 'discontinued']).default('active'),
  imageUrl: z.string().url("Invalid image URL").optional(),
});

export const insertOrderSchema = z.object({
  orderNumber: z.string().min(1, "Order number is required"),
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Invalid email address").optional(),
  totalAmount: z.number().positive("Total amount must be positive"),
  status: z.enum(['pending', 'processing', 'completed', 'cancelled']).default('pending'),
  type: z.enum(['sale', 'purchase']).default('sale'),
});

export const insertEmployeeSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  position: z.string().min(1, "Position is required"),
  department: z.string().min(1, "Department is required"),
  salary: z.number().positive("Salary must be a positive number").optional(),
  hireDate: z.string().transform((str) => new Date(str)), // Assuming date comes as string
  status: z.enum(['active', 'on_leave', 'terminated']).default('active'),
});

export const insertTransactionSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.number().positive("Amount must be a positive number"),
  type: z.enum(['income', 'expense', 'transfer']),
  category: z.string().min(1, "Category is required"),
  date: z.string().transform((str) => new Date(str)), // Assuming date comes as string
});
