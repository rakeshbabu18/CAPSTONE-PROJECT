import React from 'react'
import Login from './components/Login'
import Registration from './components/Registration'
import Home from './components/Home'
import {createBrowserRouter, RouterProvider, Navigate} from 'react-router'
import RootLayout from './components/RootLayout'
import UserDashboard from './components/UserDashboard'
import AuthorDashboard from './components/AuthorDashboard'
import AuthorArticles from './components/AuthorArticles'
import WriteArticle from './components/WriteArticle'
import ArticleById from './components/ArticleById'
import EditArticle from './components/EditArticle'
import {Toaster} from 'react-hot-toast'
import ProtectedRoute from './components/ProtectedRoute'
import Unauthorized from './components/Unauthorized'
import AdminDashboard from './components/AdminDashboard'


function App() {
   const routerobj = createBrowserRouter([
    {
      path:'/',
      element:<RootLayout />,
      children:[
        {
          path:'/',
          element:<Home />
        },
        {
          path:'/unauthorized',
          element:<Unauthorized />
        },
        {
          path:'/register',
          element:<Registration />
        },
        {
          path:'/login',
          element:<Login />
        },
        {
          path:'/userDashboard',
          element:<ProtectedRoute allowedRoles={["USER"]}><UserDashboard /></ProtectedRoute>
        },
        {
          path:'/author-profile',
          element:<ProtectedRoute allowedRoles={["AUTHOR"]}><AuthorDashboard /></ProtectedRoute>,
          children: [
            {
              path: '',
              element: <Navigate to="articles" replace={true} />
            },
            {
              path: 'articles',
              element: <AuthorArticles />
            },
            {
              path: 'write-article',
              element: <WriteArticle />
            }
          ]
        },
        {
          path:'/admin-dashboard',
          element:<ProtectedRoute allowedRoles={["ADMIN"]}><AdminDashboard /></ProtectedRoute>
        },
        {
          path: '/article/:id',
          element: <ArticleById />
        },
        {
          path: '/edit-article',
          element: <ProtectedRoute allowedRoles={["AUTHOR"]}><EditArticle /></ProtectedRoute>
        }
      ]
    }
   ])

  return (
     <>
     <Toaster position='top-center' reverseOrder={false} />
      <RouterProvider router={routerobj} />
     </>
  )
}

export default App
