# Blog App - Backend

The backend of the Blog App is built with Node.js, Express, and MongoDB. It handles authentication, article management, and comment systems for three roles: User, Author, and Admin.

## Features
- JWT Authentication (stored in HTTP-only cookies)
- Role-based Access Control (USER, AUTHOR, ADMIN)
- Image Upload integration with Cloudinary
- Article CRUD operations
- Comment system

## Prerequisites
- Node.js installed
- MongoDB URI (local or Atlas)
- Cloudinary Account (for image handling)

## Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

 
   ```

## Running the Server

- To start the server:
  ```bash
  node server.js
  ```

## Packages Installed

| Package | Purpose |
| :--- | :--- |
| `express` | Web framework for Node.js |
| `mongoose` | MongoDB object modeling |
| `jsonwebtoken` | Token-based authentication |
| `bcryptjs` | Password hashing |
| `multer` | Middleware for handling multipart/form-data (uploads) |
| `cloudinary` | Cloud image management |
| `cookie-parser` | Parse Cookie header and populate req.cookies |
| `cors` | Cross-Origin Resource Sharing |
| `dotenv` | Loads environment variables from .env |

## Directory Structure
- `APIs/`: Contains route handlers for different user roles and common tasks.
- `Models/`: Mongoose schemas for Users and Articles.
- `Middlewares/`: Security and validation middlewares (Verify Token, etc).
- `Services/`: Business logic (Authentication services).
- `config/`: Configuration for Multer and Cloudinary.
