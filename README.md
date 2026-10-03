# TaskFlow

A full-stack task management application built with the MERN stack, designed to help users organize tasks, manage priorities, and track their workflow through a clean and responsive interface.

## ✨ Features

- 🔐 User registration and authentication
- 👤 Protected user-specific task management
- ✅ Create, update, complete, and delete tasks
- 📋 Organized task workflow
- 🎯 Task priority management
- 📱 Responsive frontend interface
- 🔒 Authentication middleware for protected API routes
- 🗄️ MongoDB database integration
- ⚡ RESTful backend API
- 🌐 Ready for cloud deployment
  ## 🌐 Live Demo

Try TaskFlow online:

- **Frontend (Vercel):** https://taskflow-alpha-lyart-95.vercel.app/
- **Backend API (Render):** https://taskflow-api-hycd.onrender.com/

Feel free to explore the application, create an account, manage tasks, and try the Pomodoro and music features.

### 🚀 Deployment

| Component | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |

## 🛠️ Tech Stack

### Frontend
- React.js
- Vite
- JavaScript
- HTML5
- CSS3

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt

### Development Tools
- Git & GitHub
- VS Code
- Postman
- npm

## 📁 Project Structure

```text
TaskFlow/
│
├── backend/
│   ├── middleware/
│   │   └── authMiddleware.js
│   │
│   ├── models/
│   │   ├── Task.js
│   │   └── User.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── taskRoutes.js
│   │
│   ├── server.js
│   ├── package.json
│   ├── package-lock.json
│   └── Dockerfile
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── Auth.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- MongoDB or a MongoDB Atlas account
- Git

### 1. Clone the repository

```bash
git clone https://github.com/akshkish/TASKFLOW.git
cd TASKFLOW
```

### 2. Setup the backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Start the backend:

```bash
npm start
```

The backend will run on:

```text
http://localhost:5000
```

### 3. Setup the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

## 🔐 Environment Variables

The backend uses environment variables for configuration and authentication.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

**Never commit your `.env` file to GitHub.**

The project already uses `.gitignore` rules to keep environment variables and `node_modules` out of the repository.

## 🔄 Application Flow

```text
User
  │
  ▼
React Frontend
  │
  │ HTTP Requests
  ▼
Express REST API
  │
  ├── Authentication Middleware
  │
  ├── Auth Routes
  │
  └── Task Routes
  │
  ▼
MongoDB
```

## 🔑 Authentication

TaskFlow uses token-based authentication.

The authentication flow is:

```text
Register / Login
       │
       ▼
   JWT Token
       │
       ▼
Authenticated Requests
       │
       ▼
Authentication Middleware
       │
       ▼
Protected API Routes
```

Passwords are securely handled using `bcrypt`, while JWT is used for authenticated API access.

## 📡 API Overview

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login an existing user |

### Tasks

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tasks` | Get user tasks |
| POST | `/api/tasks` | Create a task |
| PUT | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |

> API endpoints may vary depending on the current backend implementation.

## 🐳 Docker Support

The backend includes a `Dockerfile`, making the application suitable for container-based deployment.

Example:

```bash
cd backend
docker build -t taskflow-backend .
docker run -p 5000:5000 taskflow-backend
```

Docker is optional for local development.

## ☁️ Deployment

TaskFlow can be deployed using modern cloud platforms.

A possible deployment architecture is:

```text
                    ┌─────────────────┐
                    │     GitHub      │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
       React Frontend                 Node/Express API
          Vercel                         Render
              │                             │
              └──────────────┬──────────────┘
                             ▼
                       MongoDB Atlas
```

## 🎯 Project Goals

TaskFlow was developed to practice and demonstrate:

- Full-stack web development
- React application development
- REST API design
- Authentication and authorization
- MongoDB database integration
- Frontend-backend communication
- Git and GitHub workflow
- Cloud deployment
- Containerization with Docker

## 📚 What I Learned

Through this project, I worked with:

- Building a MERN stack application from the ground up
- Structuring a React frontend and Express backend
- Connecting an application to MongoDB
- Implementing authentication and protected routes
- Managing environment variables securely
- Working with REST APIs
- Using Git for version control
- Preparing an application for cloud deployment
- Exploring Docker-based deployment

## 🔮 Future Improvements

Potential improvements include:

- Task deadlines and reminders
- Drag-and-drop task organization
- Task categories and labels
- Search and filtering
- Dashboard analytics
- Dark/light theme customization
- Notifications
- Improved mobile experience
- Automated testing
- CI/CD pipeline

## 👩‍💻 Author

**Akshaya**

GitHub: [@akshkish](https://github.com/akshkish)

## 📄 License

This project is licensed under the MIT License.
