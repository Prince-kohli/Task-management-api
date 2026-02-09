# 🚀 Task Management API

A scalable REST API for managing teams, tasks, and activity logs. Built with Node.js, Express, and MongoDB.

## 🛠️ Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT (JSON Web Tokens)
- **Documentation**: Swagger UI
- **Background Jobs**: Cron-based (using MongoDB queue - No Redis required)
- **Caching**: In-Memory Caching (No Redis required)

---

## ⚙️ Setup & Installation

1.  **Clone the repository**
2.  **Install Dependencies**
    ```bash
    npm install
    ```
3.  **Configure Environment**
    Create a `.env` file in the root directory:
    ```env
    PORT=3000
    MONGODB_URI=mongodb://127.0.0.1:27017/task-manager
    JWT_SECRET=your_jwt_secret_key
    ```
4.  **Start the Server**
    ```bash
    npm run dev
    ```

---

## 📖 API Documentation

**Swagger UI:** [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

### 🔐 Authentication
| Method | Endpoint | Description | Body |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user | `{ "email": "...", "password": "..." }` |
| `POST` | `/api/auth/login` | Login user | `{ "email": "...", "password": "..." }` |

### 👥 Teams
| Method | Endpoint | Description | Body |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/teams` | Create a team | `{ "name": "..." }` |
| `GET` | `/api/teams/:id` | Get team details | - |
| `GET` | `/api/teams/:id/members` | List members | - |
| `POST` | `/api/teams/:id/members` | Add member | `{ "userId": "..." }` |
| `DELETE` | `/api/teams/:id/members/:userId` | Remove member | - |

### 📋 Tasks
| Method | Endpoint | Description | Body |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/teams/:teamId/tasks` | Create task | `{ "title": "...", "description": "...", "status": "TODO" }` |
| `GET` | `/api/teams/:teamId/tasks` | List tasks | _Query: page, limit, search, status_ |
| `PATCH` | `/api/teams/:teamId/tasks/:taskId` | Update task | `{ "title": "..." }` |
| `POST` | `/api/teams/:teamId/tasks/:taskId/move` | Move task | `{ "status": "DOING" }` |
| `POST` | `/api/teams/:teamId/tasks/:taskId/assign` | Assign task | `{ "assignedTo": "userId" }` |
| `POST` | `/api/teams/:teamId/tasks/:taskId/comments` | Add comment | `{ "text": "..." }` |
| `DELETE` | `/api/teams/:teamId/tasks/:taskId` | Delete task | - |

### 🕰️ Activity Logs
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/teams/:teamId/activity-logs` | View background job logs |

---

## 🧪 How to Test

### Option 1: Using Postman
1.  Import the provided `Task-Management-API.postman_collection.json`.
2.  Run **"Register User"** followed by **"Login User"** (Token is auto-saved).
3.  Create a Team (Team ID is auto-saved).
4.  Start creating and managing tasks!

### Option 2: Using CURL (Terminal)

**1. Register:**
```bash
curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"123456\"}"
```

**2. Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"123456\"}"
```
*(Copy the `token` from response)*

**3. Create Team (Replace TOKEN):**
```bash
curl -X POST http://localhost:3000/api/teams -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d "{\"name\":\"Engineering\"}"
```

**4. Create Task (Replace TOKEN & TEAM_ID):**
```bash
curl -X POST http://localhost:3000/api/teams/TEAM_ID/tasks -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d "{\"title\":\"My Task\",\"status\":\"TODO\"}"
```

---

## 🏗️ Architecture Highlights

### 🔄 Background Jobs (No Redis Required)
Instead of a complex Redis setup, this project uses a **Cron Job** (`src/jobs/activityCron.js`) that runs every minute.
1.  User performs an action (e.g., Move Task).
2.  Action is saved to `ActivityQueueItem` collection in MongoDB.
3.  Cron job picks up pending items and processes them into `ActivityLog`.

### 🚀 Caching
Task lists are cached in **memory** (RAM) for fast access. The cache is automatically invalidated when a task is created, updated, or deleted.
