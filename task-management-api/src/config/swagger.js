const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

function mountSwagger(app) {
  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Task Management API',
        version: '1.0.0',
      },
      servers: [{ url: '/' }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
    apis: [],
  };

  const spec = swaggerJSDoc(options);

  spec.paths = {
    '/api/auth/register': {
      post: {
        summary: 'Register',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: { email: { type: 'string' }, password: { type: 'string' } },
              },
            },
          },
        },
        responses: { 201: { description: 'Created' }, 400: { description: 'Bad request' } },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: { email: { type: 'string' }, password: { type: 'string' } },
              },
            },
          },
        },
        responses: { 200: { description: 'OK' }, 401: { description: 'Unauthorized' } },
      },
    },
    '/api/teams': {
      post: {
        security: [{ bearerAuth: [] }],
        summary: 'Create team',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', required: ['name'], properties: { name: { type: 'string' } } },
            },
          },
        },
        responses: { 201: { description: 'Created' }, 401: { description: 'Unauthorized' } },
      },
    },
    '/api/teams/{teamId}': {
      get: {
        security: [{ bearerAuth: [] }],
        summary: 'Get team details (members only)',
        parameters: [{ name: 'teamId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'OK' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
          404: { description: 'Not found' },
        },
      },
    },
    '/api/teams/{teamId}/members': {
      get: {
        security: [{ bearerAuth: [] }],
        summary: 'List team members',
        parameters: [{ name: 'teamId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'OK' }, 401: { description: 'Unauthorized' }, 403: { description: 'Forbidden' } },
      },
      post: {
        security: [{ bearerAuth: [] }],
        summary: 'Add team member (creator only)',
        parameters: [{ name: 'teamId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', required: ['userId'], properties: { userId: { type: 'string' } } },
            },
          },
        },
        responses: {
          201: { description: 'Created' },
          400: { description: 'Bad request' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
          404: { description: 'Not found' },
        },
      },
    },
    '/api/teams/{teamId}/members/{userId}': {
      delete: {
        security: [{ bearerAuth: [] }],
        summary: 'Remove team member (creator only)',
        parameters: [
          { name: 'teamId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'userId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'OK' },
          400: { description: 'Bad request' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
        },
      },
    },
    '/api/teams/{teamId}/tasks': {
      get: {
        security: [{ bearerAuth: [] }],
        summary: 'List tasks (cached)',
        parameters: [
          { name: 'teamId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'assignedTo', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['TODO', 'DOING', 'DONE'] } },
          { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
        ],
        responses: {
          200: { description: 'OK' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
        },
      },
      post: {
        security: [{ bearerAuth: [] }],
        summary: 'Create task',
        parameters: [{ name: 'teamId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title'],
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  assignedTo: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Created' },
          400: { description: 'Bad request' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
        },
      },
    },
    '/api/teams/{teamId}/tasks/{taskId}': {
      patch: {
        security: [{ bearerAuth: [] }],
        summary: 'Update task',
        parameters: [
          { name: 'teamId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'taskId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'OK' },
          400: { description: 'Bad request' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
          404: { description: 'Not found' },
        },
      },
      delete: {
        security: [{ bearerAuth: [] }],
        summary: 'Delete task',
        parameters: [
          { name: 'teamId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'taskId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'OK' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
          404: { description: 'Not found' },
        },
      },
    },
    '/api/teams/{teamId}/tasks/{taskId}/move': {
      post: {
        security: [{ bearerAuth: [] }],
        summary: 'Move task (change status)',
        parameters: [
          { name: 'teamId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'taskId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: { status: { type: 'string', enum: ['TODO', 'DOING', 'DONE'] } },
              },
            },
          },
        },
        responses: { 200: { description: 'OK' }, 400: { description: 'Bad request' }, 401: { description: 'Unauthorized' }, 403: { description: 'Forbidden' } },
      },
    },
    '/api/teams/{teamId}/tasks/{taskId}/assign': {
      post: {
        security: [{ bearerAuth: [] }],
        summary: 'Assign or unassign task',
        parameters: [
          { name: 'teamId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'taskId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['assignedTo'],
                properties: { assignedTo: { oneOf: [{ type: 'string' }, { type: 'null' }] } },
              },
            },
          },
        },
        responses: { 200: { description: 'OK' }, 400: { description: 'Bad request' }, 401: { description: 'Unauthorized' }, 403: { description: 'Forbidden' } },
      },
    },
    '/api/teams/{teamId}/tasks/{taskId}/comments': {
      post: {
        security: [{ bearerAuth: [] }],
        summary: 'Add comment on task',
        parameters: [
          { name: 'teamId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'taskId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', required: ['text'], properties: { text: { type: 'string' } } },
            },
          },
        },
        responses: { 201: { description: 'Created' }, 400: { description: 'Bad request' }, 401: { description: 'Unauthorized' }, 403: { description: 'Forbidden' } },
      },
    },
    '/api/teams/{teamId}/activity-logs': {
      get: {
        security: [{ bearerAuth: [] }],
        summary: 'List activity logs (rate limited)',
        parameters: [
          { name: 'teamId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
        ],
        responses: {
          200: { description: 'OK' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
        },
      },
    },
  };

  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(spec));
}

module.exports = { mountSwagger };
