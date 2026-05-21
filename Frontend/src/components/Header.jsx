import React from 'react'
import { NavLink, useNavigate } from 'react-router'
import { useAuth } from '../../stores/useAuth'

function Header() {
  const user = useAuth((state) => state.currentUser)
  const isAuthenticated = useAuth((state) => state.isAuthenticated)
  const logout = useAuth((state) => state.logout)
  const navigate = useNavigate()
  const profileImageUrl = user?.profileImageUrl || user?.profileImageurl

  const normalizedRole = String(user?.role || '').trim().toUpperCase()
  const profilePath = normalizedRole === 'AUTHOR'
    ? '/author-profile'
    : normalizedRole === 'ADMIN'
      ? '/admin-dashboard'
      : '/userDashboard'

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className='flex justify-between items-center bg-red-500 h-25 p-5'>
        <p className='text-3xl font-bold'>Blog App</p>
      <ul className='flex gap-10  text-xl font-medium'>
        <li>
          <NavLink to="/" className={({isActive})=>isActive?"bg-orange-300 p-1 rounded-[5%]":""}>Home</NavLink>
        </li>
        {isAuthenticated ? (
          <>
            <li>
              <NavLink to={profilePath} className={({isActive})=>isActive?"bg-orange-300 p-1 rounded-[5%]":""}>Profile</NavLink>
            </li>
            <li>
              <button type="button" onClick={handleLogout} className='cursor-pointer'>Logout</button>
            </li>
          </>
        ) : (
          <>
            <li>
              <NavLink to="/register" className={({isActive})=>isActive?"bg-orange-300 p-1 rounded-[5%]":""}>Register</NavLink>
            </li>
            <li>
              <NavLink to="/login" className={({isActive})=>isActive?"bg-orange-300 p-1 rounded-[5%]":""}>Login</NavLink>
            </li>
          </>
        )}
      </ul>
  
    </div>
  )
}

export default Header
