import React from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { useAuth } from '../../stores/useAuth'
import {toast} from 'react-hot-toast'

function Login() {

  const { register, handleSubmit, formState: { errors } } = useForm()
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

<form onSubmit={handleLogin} className='flex flex-col gap-4 items-center'>
        <p className="mb-2">Login</p>

        <div className='flex flex-col gap-1 w-70'>
          <input
            type="email"
            placeholder='Enter Email'
            {...register("email", { 
              required: "Email is required",
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email format" }
            })}
            className='w-full bg-gray-400 p-2 rounded-xl'
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>

        <div className='flex flex-col gap-1 w-70 mb-2'>
          <input
            type="password"
            placeholder='Enter Password'
            {...register("password", { 
              required: "Password is required"
            })}
            className='w-full bg-gray-400 p-2 rounded-xl'
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
        </div>

        
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
