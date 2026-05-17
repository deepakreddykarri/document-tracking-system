# Document Tracking System

A full-stack web application designed for secure document management, tracking, and workflow automation.

## Features

- **User Authentication:** Secure login system with role-based access control (Admin, Manager, User).
- **Document Management:** Upload, update, and track document lifecycles easily.
- **Real-time Updates:** Live tracking of document status changes using WebSockets.
- **Workflow Automation:** Streamlined processes for document approvals and status transitions.
- **Dashboard & Analytics:** Overview of document metrics and system activity.
- **Responsive UI:** Modern, clean, and responsive design.

## Project Architecture

This project is organized into separate frontend and backend directories.

```text
Document-Tracking-System/
├── backend/      # Node.js + Express API server
└── frontend/     # React + Vite web application
```

---

## 🖥️ Frontend

The frontend is a modern single-page application built with React and Vite.

### Tech Stack
- React 18 (Vite)
- Redux Toolkit (State Management)
- Tailwind CSS (Styling)
- Socket.io Client (Real-time WebSockets)
- Axios (API Client)
- React Router DOM v6 (Routing)
- React Toastify (Notifications)
- React Icons

### Folder Structure
```text
src/
├── components/   # Reusable UI components (cards, forms, layout)
├── constants/    # Application-wide constants and enumerations
├── context/      # React Context providers (e.g., Auth, Theme)
├── pages/        # Main application views (Login, Dashboard, Documents)
├── services/     # API communication and external service integrations
└── store/        # Redux store configuration and state slices
```

### Setup & Run
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Run in development mode: `npm run dev`
4. Build for production: `npm run build`

### Environment Variables
Create a `.env` or `.env.development` file in the `frontend` directory:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## ⚙️ Backend

The backend is a robust RESTful API built with Node.js, Express, and MongoDB.

### Tech Stack
- Node.js & Express
- MongoDB (Mongoose)
- Socket.io (Real-time WebSockets)
- JWT (JSON Web Tokens for Authentication)
- Multer (File Uploads)
- Bcryptjs (Password Hashing)
- Express Validator (Request Validation)

### Folder Structure
```text
backend/
├── config/       # Database and environment configurations
├── controllers/  # Route handlers and business logic
├── middleware/   # Custom middlewares (auth, validation, file upload)
├── models/       # Mongoose database schemas
├── routes/       # API endpoint definitions
└── server.js     # Express app entry point
```

### Setup & Run
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Run in development mode: `npm run dev` (uses nodemon)
4. Start server normally: `npm start`
5. Seed Admin user: `npm run seed:admin`

### Environment Variables
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

---

## 🚀 Running the Full Stack

To run both the frontend and backend simultaneously, you will need two terminal windows:

**Terminal 1 (Backend):**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
npm run dev
```

The application will be accessible at `http://localhost:5173` and the API will run on `http://localhost:5000`.

---

## 🔐 Default Credentials

After seeding the database (using `npm run seed:admin` in the backend), you can log in with the following default admin credentials:

- **Email:** `admin@doctrack.com`
- **Password:** `admin123`
