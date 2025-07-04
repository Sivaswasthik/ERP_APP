import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ERP System API',
      version: '1.0.0',
      description: 'API documentation for the Enterprise ERP System backend.',
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Product: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'The auto-generated ID of the product',
            },
            name: {
              type: 'string',
              description: 'The name of the product',
            },
            description: {
              type: 'string',
              description: 'A brief description of the product',
            },
            price: {
              type: 'number',
              format: 'float',
              description: 'The price of the product',
            },
            stock: {
              type: 'integer',
              description: 'The current stock quantity of the product',
            },
            category: {
              type: 'string',
              description: 'The category of the product',
            },
            imageUrl: {
              type: 'string',
              description: 'URL to the product image',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'The date and time when the product was created',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'The date and time when the product was last updated',
            },
          },
          required: ['name', 'price', 'stock', 'category'],
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./server/routes.ts', './server/auth.ts', './shared/schema.ts'], // Path to the API routes and schema
};

const specs = swaggerJsdoc(options);

export default specs;
