# Task Management API

A comprehensive RESTful API for managing teams, tasks, and activity logs.

## Features

- **User Authentication**: Secure registration and login using JWT.
- **Team Management**: Create and view teams, manage memberships.
- **Task Management**: Create, update, delete, assign, and track tasks with status workflow (TODO, DOING, DONE).
- **Activity Logs**: Track changes and updates within teams.
- **Swagger Documentation**: Interactive API documentation available at `/api/docs`.
- **Role-Based Access Control**: Permissions for team creators and members.

## Tech Stack

- **Node.js** & **Express.js**
- **MongoDB** & **Mongoose**
- **JWT** (JSON Web Tokens) for authentication
- **Swagger** (OpenAPI 3.0) for documentation
- **Helmet** & **CORS** for security

## Getting Started

### Prerequisites

- Node.js (v14+ recommended)
- MongoDB instance running locally or in the cloud.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd task-management-api
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure environment variables:**
    Copy the example environment file and update it with your configuration.
    ```bash
    cp .env.example .env
    ```

    Update `.env` with your values:
    ```env
    PORT=3000
    MONGODB_URI=mongodb://127.0.0.1:27017/task_management
    JWT_SECRET=your_super_secret_key
    JWT_EXPIRES_IN=7d
    ```

### Running the Application

- **Development Mode** (with hot-reload):
  ```bash
  npm run dev
  ```

- **Production Mode**:
  ```bash
  npm start
  ```

## API Documentation

The API comes with built-in Swagger documentation.

1.  Start the server.
2.  Navigate to `http://localhost:3000/api/docs` (or your configured port) to explore and test the endpoints.

### Key Endpoints

#### Auth
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get token

#### Teams
- `POST /api/teams` - Create a new team
- `GET /api/teams/:teamId` - Get team details
- `GET /api/teams/:teamId/members` - List team members
- `POST /api/teams/:teamId/members` - Add a member
- `DELETE /api/teams/:teamId/members/:userId` - Remove a member

#### Tasks
- `GET /api/teams/:teamId/tasks` - List tasks (Supports pagination, search, filtering by status/assignee)
- `POST /api/teams/:teamId/tasks` - Create a task
- `PATCH /api/teams/:teamId/tasks/:taskId` - Update task details
- `DELETE /api/teams/:teamId/tasks/:taskId` - Delete a task
- `POST /api/teams/:teamId/tasks/:taskId/move` - Change task status
- `POST /api/teams/:teamId/tasks/:taskId/assign` - Assign/Unassign task
- `POST /api/teams/:teamId/tasks/:taskId/comments` - Add a comment

#### Activity Logs
- `GET /api/teams/:teamId/activity-logs` - View team activity history

## Project Structure

```
src/
├── config/         # Configuration (DB, Swagger)
├── controllers/    # Request handlers
├── jobs/           # Background jobs (Cron)
├── middleware/     # Express middleware (Auth, Validation, Error Handling)
├── models/         # Mongoose schemas
├── routes/         # API route definitions
├── services/       # Business logic layer
├── utils/          # Utility functions
├── app.js          # App setup
└── server.js       # Entry point
```

## License

This project is licensed under the ISC License.
