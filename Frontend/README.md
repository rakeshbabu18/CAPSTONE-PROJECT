# Blog App - Frontend

The frontend of the Blog App is built with React, Vite, and Tailwind CSS. It provides an interactive interface for reading, writing, and managing blog articles.

## Features
- Responsive Landing Page with recent articles
- User, Author, and Admin Dashboards
- Protected Routes based on authentication status
- Article creation and editing (Author only)
- Global state management using Zustand
- User notifications via React Hot Toast

## Prerequisites
- Node.js installed
- Backend server running (default port 4000)

## Installation

1. Navigate to the frontend directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

   ```

## Development

- Start the development server:
  ```bash
  npm run dev
  ```

- Build for production:
  ```bash
  npm run build
  ```

## Packages Installed

| Package | Purpose |
| :--- | :--- |
| `react` / `react-dom` | UI library |
| `react-router` | Navigation and routing |
| `axios` | HTTP client for API requests |
| `zustand` | State management (Auth state) |
| `react-hook-form` | Form handling and validation |
| `react-hot-toast` | Toast notifications |
| `tailwindcss` | Utility-first CSS framework |
| `vite` | Next-generation frontend tooling |

