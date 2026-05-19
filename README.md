# Blog App (MERN Stack)

A full-stack blogging platform built using the MERN (MongoDB, Express, React, Node.js) stack. This application features a robust Role-Based Access Control (RBAC) system supporting distinct permissions for Users, Authors, and Admins.

## Features

*   **Role-Based Access Control (RBAC):**
*   **User:** Can browse active published articles, read content, and write comments.
*   **Author:** Can create, edit, delete (soft delete/hide), and manage their own portfolio of articles.
*   **Admin:** Has access to a powerful dashboard to manage user accounts (block/unblock) and oversee all articles on the platform.
*   **Media Uploads:** Cloudinary and Multer integration handles profile image uploads seamlessly during user registration.
*   **Interactive UI:** Built with React, Vite, and styled with Tailwind CSS for a modern, responsive user interface. Client-side routing is handled by React Router v6.
*   **State Management:** Powered by Zustand featuring persisted frontend authentication state.

## Tech Stack

### Frontend
*   React 18 (via Vite)
*   React Router v6
*   Zustand (Global State Management)
*   React Hook Form (Form Validation)
*   Axios (HTTP Client)
*   Tailwind CSS (Styling)
*   React Hot Toast (Toast Notifications)

### Backend
*   Node.js & Express.js
*   MongoDB & Mongoose (Database & ORM)
*   JSON Web Tokens (JWT) & bcryptjs (Auth & Encryption)
*   Cloudinary & Multer (Image processing and cloud storage)

## Installation & Setup

### Prerequisites
*   Node.js
*   MongoDB Atlas account or local MongoDB server
*   Cloudinary account (for image hosting)

### 1. Repository Setup
Clone the project and navigate into it:
```bash
git clone <your-repo-url>
cd BLOG-APP
```

### 2. Backend Environment
Navigate to the backend folder and install dependencies:
```bash
cd backend
npm install
```

Start the backend server:
```bash
node server.js
```

### 3. Frontend Environment
Open a new terminal and navigate to the frontend folder:
```bash
cd Frontend
npm install
```

Start the Vite development server:
```bash
npm run dev

## Project Structure highlighting
*   **`backend/APIs/`**: Express route controllers organized by domain (`userAPI`, `adminAPI`, `authorAPI`, `commonAPI`).
*   **`backend/Models/`**: Mongoose schemas defining `ArticleModel` and `UserModel`.
*   **`Frontend/src/components/`**: React functional components including route protections (`ProtectedRoute.jsx`) and role-specific dashboards.
*   **`Frontend/src/stores/`**: Zustand store (`useAuth.js`) managing global application authentication state.
