import React from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { useAuth } from '../../stores/useAuth'
import {toast} from 'react-hot-toast'

function Login() {

  const { register, handleSubmit } = useForm()
  const navigate = useNavigate()

  const login = useAuth((state) => state.login)
  const authError = useAuth((state) => state.error)
  const loading = useAuth((state) => state.loading)

  const handleLogin = handleSubmit(async (data) => {
    const user = await login(data)

    if (!user) {
      console.error("Login failed - no user returned")
      return
    }

    console.log("Login successful, user data:", user)
    toast.success("Logged in successfully")
    
    const userRole = String(user.role || "").trim().toUpperCase()
    console.log("User role:", userRole)

    if (userRole === "USER") {
      console.log("Navigating to /userDashboard")
      navigate("/userDashboard")
    } else if (userRole === "AUTHOR") {
      console.log("Navigating to /author-profile")
      navigate("/author-profile")
    } else if (userRole === "ADMIN") {
      console.log("Navigating to /admin-dashboard")
      navigate("/admin-dashboard")
    } else {
      console.warn("Unknown role:", user.role)
    }
  })

  return (
    <div className='flex flex-col gap-2 items-center justify-center mt-[10%] bg-gray-300 w-100 h-100 ml-[35%] rounded-2xl'>

      <form onSubmit={handleLogin} className='flex flex-col gap-6 items-center'>
        <p>Login</p>

        <input
          type="email"
          placeholder='Enter Email'
          {...register("email", { required: true })}
          className='w-70 bg-gray-400 p-2 rounded-xl'
        />

        <input
          type="password"
          placeholder='Enter Password'
          {...register("password", { required: true })}
          className='w-70 bg-gray-400 p-2 rounded-xl'
        />

        
        {authError && <p className="text-red-600">{authError}</p>}
        {loading && <p>Loading...</p>}

        <button
          type="submit"
          disabled={loading}
          className='w-40 bg-blue-400 p-2 rounded-xl'
        >
          Login
        </button>

      </form>

    </div>
  )
}

export default Login
