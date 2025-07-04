import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { protect, registerUser, loginUser, logoutUser } from "./auth";
import { IProduct, IOrder, IEmployee, ITransaction, insertProductSchema, insertOrderSchema, insertEmployeeSchema, insertTransactionSchema } from "@shared/schema";
import { ApiError } from './utils/errorHandler';
import { z, ZodError } from 'zod';

const validate = (schema: z.ZodObject<any, any>) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessage = error.errors.map(e => e.message).join(', ');
      next(new ApiError(`Validation Error: ${errorMessage}`, 400));
    } else {
      next(error);
    }
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  /**
   * @swagger
   * tags:
   *   name: Authentication
   *   description: User authentication and authorization
   */

  /**
   * @swagger
   * /api/auth/register:
   *   post:
   *     summary: Register a new user
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *               - firstName
   *               - lastName
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 description: User's email address
   *               password:
   *                 type: string
   *                 format: password
   *                 description: User's password
   *               firstName:
   *                 type: string
   *                 description: User's first name
   *               lastName:
   *                 type: string
   *                 description: User's last name
   *     responses:
   *       201:
   *         description: User registered successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                 email:
   *                   type: string
   *                 firstName:
   *                   type: string
   *                 lastName:
   *                   type: string
   *                 role:
   *                   type: string
   *                 token:
   *                   type: string
   *       400:
   *         description: User already exists or invalid input
   *       500:
   *         description: Server error
   */
  app.post('/api/auth/register', registerUser);

  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     summary: Log in a user
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 description: User's email address
   *               password:
   *                 type: string
   *                 format: password
   *                 description: User's password
   *     responses:
   *       200:
   *         description: User logged in successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                 email:
   *                   type: string
   *                 firstName:
   *                   type: string
   *                 lastName:
   *                   type: string
   *                 role:
   *                   type: string
   *                 token:
   *                   type: string
   *       400:
   *         description: Invalid credentials
   *       500:
   *         description: Server error
   */
  app.post('/api/auth/login', loginUser);

  /**
   * @swagger
   * /api/auth/logout:
   *   post:
   *     summary: Log out a user
   *     tags: [Authentication]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: User logged out successfully
   *       500:
   *         description: Server error
   */
  app.post('/api/auth/logout', protect, logoutUser);

  /**
   * @swagger
   * tags:
   *   name: Dashboard
   *   description: Dashboard related APIs
   */

  /**
   * @swagger
   * /api/dashboard/kpis:
   *   get:
   *     summary: Get Dashboard KPIs
   *     tags: [Dashboard]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Successfully retrieved KPIs
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 totalProducts:
   *                   type: number
   *                 totalOrders:
   *                   type: number
   *                 totalEmployees:
   *                   type: number
   *                 totalRevenue:
   *                   type: number
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  app.get('/api/dashboard/kpis', protect, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const kpis = await storage.getDashboardKPIs();
      res.json(kpis);
    } catch (error) {
      next(error);
    }
  });

  /**
   * @swagger
   * tags:
   *   name: Products
   *   description: Product management APIs
   */

  /**
   * @swagger
   * /api/products:
   *   get:
   *     summary: Get all products
   *     tags: [Products]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Successfully retrieved products
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Product'
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  app.get('/api/products', protect, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/products/:id', protect, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const product = await storage.getProduct(id);
      if (!product) {
        throw new ApiError("Product not found", 404);
      }
      res.json(product);
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/products', protect, validate(insertProductSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productData: IProduct = req.body;
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  });

  app.put('/api/products/:id', protect, validate(insertProductSchema.partial()), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const productData: Partial<IProduct> = req.body;
      const product = await storage.updateProduct(id, productData);
      res.json(product);
    } catch (error) {
      next(error);
    }
  });

  app.delete('/api/products/:id', protect, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      await storage.deleteProduct(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  // Order routes
  app.get('/api/orders', protect, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/orders', protect, validate(insertOrderSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orderData: IOrder = req.body;
      const order = await storage.createOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  });

  app.put('/api/orders/:id', protect, validate(insertOrderSchema.partial()), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const orderData: Partial<IOrder> = req.body;
      const order = await storage.updateOrder(id, orderData);
      res.json(order);
    } catch (error) {
      next(error);
    }
  });

  // Employee routes
  app.get('/api/employees', protect, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/employees', protect, validate(insertEmployeeSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const employeeData: IEmployee = req.body;
      const employee = await storage.createEmployee(employeeData);
      res.status(201).json(employee);
    } catch (error) {
      next(error);
    }
  });

  app.put('/api/employees/:id', protect, validate(insertEmployeeSchema.partial()), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const employeeData: Partial<IEmployee> = req.body;
      const employee = await storage.updateEmployee(id, employeeData);
      res.json(employee);
    } catch (error) {
      next(error);
    }
  });

  // Transaction routes
  app.get('/api/transactions', protect, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const transactions = await storage.getTransactions();
      res.json(transactions);
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/transactions', protect, validate(insertTransactionSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const transactionData: ITransaction = req.body;
      const transaction = await storage.createTransaction(transactionData);
      res.status(201).json(transaction);
    } catch (error) {
      next(error);
    }
  });


  const httpServer = createServer(app);
  return httpServer;
}
