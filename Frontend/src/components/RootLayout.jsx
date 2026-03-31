import React from 'react'
import Header from './Header'
import Footer from './Footer'
import { Outlet } from 'react-router'
import { useAuth } from '../../stores/useAuth'
import { useEffect } from 'react'
function RootLayout() {
  const { checkAuth } = useAuth();
  useEffect(()=>{
    checkAuth();
  },[checkAuth]);
  return (
    <div>
    <Header />
    <Outlet />
    <Footer /> 
    </div>
  )
}

export default RootLayout