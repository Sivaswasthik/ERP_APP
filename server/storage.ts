import {
  User,
  Product,
  Order,
  OrderItem,
  Employee,
  Transaction,
  IUser,
  IProduct,
  IOrder,
  IOrderItem,
  IEmployee,
  ITransaction,
} from "@shared/schema";
import { Document } from 'mongoose';
import { ApiError } from './utils/errorHandler';

export interface IStorage {
  // User operations
  getUser(id: string): Promise<IUser | null>;
  
  // Product operations
  getProducts(): Promise<IProduct[]>;
  getProduct(id: string): Promise<IProduct | null>;
  createProduct(product: IProduct): Promise<IProduct>;
  updateProduct(id: string, product: Partial<IProduct>): Promise<IProduct | null>;
  deleteProduct(id: string): Promise<void>;
  searchProducts(query: string): Promise<IProduct[]>;
  
  // Order operations
  getOrders(): Promise<IOrder[]>;
  getOrder(id: string): Promise<IOrder | null>;
  createOrder(order: IOrder): Promise<IOrder>;
  updateOrder(id: string, order: Partial<IOrder>): Promise<IOrder | null>;
  deleteOrder(id: string): Promise<void>;
  
  // Order items operations
  getOrderItems(orderId: string): Promise<IOrderItem[]>;
  createOrderItem(item: IOrderItem): Promise<IOrderItem>;
  
  // Employee operations
  getEmployees(): Promise<IEmployee[]>;
  getEmployee(id: string): Promise<IEmployee | null>;
  createEmployee(employee: IEmployee): Promise<IEmployee>;
  updateEmployee(id: string, employee: Partial<IEmployee>): Promise<IEmployee | null>;
  deleteEmployee(id: string): Promise<void>;
  searchEmployees(query: string): Promise<IEmployee[]>;
  
  // Transaction operations
  getTransactions(): Promise<ITransaction[]>;
  getTransaction(id: string): Promise<ITransaction | null>;
  createTransaction(transaction: ITransaction): Promise<ITransaction>;
  updateTransaction(id: string, transaction: Partial<ITransaction>): Promise<ITransaction | null>;
  deleteTransaction(id: string): Promise<void>;
  
  // Dashboard KPIs
  getDashboardKPIs(): Promise<{
    totalRevenue: number;
    activeOrders: number;
    inventoryItems: number;
    employees: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<IUser | null> {
    return await User.findById(id);
  }

  // Product operations
  async getProducts(): Promise<IProduct[]> {
    return await Product.find().sort({ createdAt: -1 });
  }

  async getProduct(id: string): Promise<IProduct | null> {
    const product = await Product.findById(id);
    if (!product) {
      throw new ApiError('Product not found', 404);
    }
    return product;
  }

  async createProduct(productData: IProduct): Promise<IProduct> {
    const newProduct = new Product(productData);
    return await newProduct.save();
  }

  async updateProduct(id: string, productData: Partial<IProduct>): Promise<IProduct | null> {
    const updatedProduct = await Product.findByIdAndUpdate(id, productData, { new: true });
    if (!updatedProduct) {
      throw new ApiError('Product not found for update', 404);
    }
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<void> {
    const result = await Product.findByIdAndDelete(id);
    if (!result) {
      throw new ApiError('Product not found for deletion', 404);
    }
  }

  async searchProducts(query: string): Promise<IProduct[]> {
    return await Product.find({ name: { $regex: query, $options: 'i' } }).sort({ createdAt: -1 });
  }

  // Order operations
  async getOrders(): Promise<IOrder[]> {
    return await Order.find().sort({ createdAt: -1 });
  }

  async getOrder(id: string): Promise<IOrder | null> {
    const order = await Order.findById(id);
    if (!order) {
      throw new ApiError('Order not found', 404);
    }
    return order;
  }

  async createOrder(orderData: IOrder): Promise<IOrder> {
    const newOrder = new Order(orderData);
    return await newOrder.save();
  }

  async updateOrder(id: string, orderData: Partial<IOrder>): Promise<IOrder | null> {
    const updatedOrder = await Order.findByIdAndUpdate(id, orderData, { new: true });
    if (!updatedOrder) {
      throw new ApiError('Order not found for update', 404);
    }
    return updatedOrder;
  }

  async deleteOrder(id: string): Promise<void> {
    const result = await Order.findByIdAndDelete(id);
    if (!result) {
      throw new ApiError('Order not found for deletion', 404);
    }
  }

  // Order items operations
  async getOrderItems(orderId: string): Promise<IOrderItem[]> {
    return await OrderItem.find({ orderId });
  }

  async createOrderItem(itemData: IOrderItem): Promise<IOrderItem> {
    const newItem = new OrderItem(itemData);
    return await newItem.save();
  }

  // Employee operations
  async getEmployees(): Promise<IEmployee[]> {
    return await Employee.find().sort({ createdAt: -1 });
  }

  async getEmployee(id: string): Promise<IEmployee | null> {
    const employee = await Employee.findById(id);
    if (!employee) {
      throw new ApiError('Employee not found', 404);
    }
    return employee;
  }

  async createEmployee(employeeData: IEmployee): Promise<IEmployee> {
    const newEmployee = new Employee(employeeData);
    return await newEmployee.save();
  }

  async updateEmployee(id: string, employeeData: Partial<IEmployee>): Promise<IEmployee | null> {
    const updatedEmployee = await Employee.findByIdAndUpdate(id, employeeData, { new: true });
    if (!updatedEmployee) {
      throw new ApiError('Employee not found for update', 404);
    }
    return updatedEmployee;
  }

  async deleteEmployee(id: string): Promise<void> {
    const result = await Employee.findByIdAndDelete(id);
    if (!result) {
      throw new ApiError('Employee not found for deletion', 404);
    }
  }

  async searchEmployees(query: string): Promise<IEmployee[]> {
    return await Employee.find({ firstName: { $regex: query, $options: 'i' } }).sort({ createdAt: -1 });
  }

  // Transaction operations
  async getTransactions(): Promise<ITransaction[]> {
    return await Transaction.find().sort({ date: -1 });
  }

  async getTransaction(id: string): Promise<ITransaction | null> {
    const transaction = await Transaction.findById(id);
    if (!transaction) {
      throw new ApiError('Transaction not found', 404);
    }
    return transaction;
  }

  async createTransaction(transactionData: ITransaction): Promise<ITransaction> {
    const newTransaction = new Transaction(transactionData);
    return await newTransaction.save();
  }

  async updateTransaction(id: string, transactionData: Partial<ITransaction>): Promise<ITransaction | null> {
    const updatedTransaction = await Transaction.findByIdAndUpdate(id, transactionData, { new: true });
    if (!updatedTransaction) {
      throw new ApiError('Transaction not found for update', 404);
    }
    return updatedTransaction;
  }

  async deleteTransaction(id: string): Promise<void> {
    const result = await Transaction.findByIdAndDelete(id);
    if (!result) {
      throw new ApiError('Transaction not found for deletion', 404);
    }
  }

  // Dashboard KPIs
  async getDashboardKPIs(): Promise<{
    totalRevenue: number;
    activeOrders: number;
    inventoryItems: number;
    employees: number;
  }> {
    const incomeTransactions = await Transaction.find({ type: "income" });
    const totalRevenue = incomeTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

    const activeOrders = await Order.countDocuments({ status: "pending" });
    const inventoryItems = await Product.countDocuments();
    const employees = await Employee.countDocuments();

    return {
      totalRevenue,
      activeOrders,
      inventoryItems,
      employees,
    };
  }
}

export const storage = new DatabaseStorage();
