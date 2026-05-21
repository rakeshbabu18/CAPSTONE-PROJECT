import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { toast } from 'react-hot-toast';
import axios from 'axios';

function ForgotPassword() {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePasswordReset = handleSubmit(async (data) => {
    setLoading(true);
    try {
      const res = await axios.post('/common-api/forgot-password', {
        email: data.email,
        newPassword: data.newPassword
      });
      
      toast.success(res.data.message || "Password has been reset successfully. Please login with your new password.");
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className='flex flex-col gap-2 items-center justify-center mt-[10%] bg-gray-300 w-100 h-110 ml-[35%] rounded-2xl p-6'>
      <form onSubmit={handlePasswordReset} className='flex flex-col gap-4 items-center w-full'>
        <p className="text-xl font-bold">Reset Password</p>
        <p className="text-sm text-gray-600 text-center mb-2">
          Verify your account and enter a new password.
        </p>

        {/* Email */}
        <div className='flex flex-col gap-1 w-70'>
          <input
            type="email"
            placeholder='Registered Email'
            {...register("email", { 
              required: "Email is required",
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email format" }
            })}
            className='w-full bg-gray-400 p-2 rounded-xl text-white'
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>

        {/* New Password */}
        <div className='flex flex-col gap-1 w-70'>
          <input
            type="password"
            placeholder='Enter New Password'
            {...register("newPassword", { 
              required: "New password is required",
              minLength: { value: 6, message: "Minimum 6 characters" }
            })}
            className='w-full bg-gray-400 p-2 rounded-xl text-white'
          />
          {errors.newPassword && <p className="text-red-500 text-sm">{errors.newPassword.message}</p>}
        </div>

        {/* Confirm Password */}
        <div className='flex flex-col gap-1 w-70'>
          <input
            type="password"
            placeholder='Confirm New Password'
            {...register("confirmPassword", { 
              required: "Please confirm your password",
              validate: (val) => {
                if (watch('newPassword') !== val) {
                  return "Passwords do not match";
                }
              }
            })}
            className='w-full bg-gray-400 p-2 rounded-xl text-white'
          />
          {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
        </div>

        <div className='flex gap-4 mt-2'>
           <button
            type="button"
            onClick={() => navigate('/login')}
            className='w-30 bg-gray-400 p-2 rounded-xl'
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className='w-40 bg-blue-400 p-2 rounded-xl font-medium'
          >
            {loading ? 'Processing...' : 'Reset Password'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ForgotPassword;
