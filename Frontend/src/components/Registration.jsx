import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import axios from "axios"
import { useNavigate } from 'react-router'

function Registration() {

  const { register, handleSubmit } = useForm()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [preview, setPreview] = useState(null)
  const navigate = useNavigate()

  const handleRegister = handleSubmit(async (data) => {
    setLoading(true)
    setError(null)
    // Create form data object
        const formData = new FormData();
        //get user object
        let { role, profileImageUrl, ...userObj } = data;
        //add all fields except profilePic to FormData object
        Object.keys(userObj).forEach((key) => {
        formData.append(key, userObj[key]);
        });
        // add profilePic to Formdata object
        if (profileImageUrl?.[0]) {
          formData.append("profileImageUrl", profileImageUrl[0]);
        }

    try {

      if (data.role === "USER") {

        let res = await axios.post(
          "http://localhost:4000/users-api/users",
          formData
        )

        if (res.status === 201) {
          navigate("/login")
        }

      } else if (data.role === "AUTHOR") {

        let res = await axios.post(
          "http://localhost:4000/author-api/users",
          formData
        )

        if (res.status === 201) {
          navigate("/login")
        }
      }

    } catch (err) {
      setError(err.response?.data?.message || "Registration failed")
    }

    setLoading(false)
  })
  //remove preview image from browser memory
  useEffect(()=>{
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    }
  },[preview])

  return (
    <div className='flex items-center justify-center mt-[10%] bg-gray-300 w-200 h-100 ml-[25%] rounded-xl'>

      <form onSubmit={handleRegister} className='flex flex-col gap-3 items-center'>

        <div className='flex gap-3'>
          <p>Select Role</p>

          <input type="radio" {...register("role", { required: true })} value="USER" />
          User

          <input type="radio" {...register("role", { required: true })} value="AUTHOR" />
          Author
        </div>

        <div className='flex gap-3'>
          <input type="text" placeholder='Enter First name'
            {...register("firstName", { required: true })}
            className='w-40 bg-gray-400 p-2 rounded-xl'
          />

          <input type="text" placeholder='Enter Last name'
            {...register("lastName")}
            className='w-40 bg-gray-400 p-2 rounded-xl'
          />
        </div>

        <input type="email" placeholder='Enter Email'
          {...register("email", { required: true })}
          className='w-80 bg-gray-400 p-2 rounded-xl'
        />

        <input type="password" placeholder='Enter Password'
          {...register("password", { required: true })}
          className='w-80 bg-gray-400 p-2 rounded-xl'
        />

        <input
        type="file"
        accept="image/png, image/jpeg"
        {...register("profileImageUrl")}
        onChange={(e) => {

            //get image file
            const file = e.target.files[0];
            // validation for image format
            if (file) {
                if (!["image/jpeg", "image/png"].includes(file.type)) {
                setError("Only JPG or PNG allowed");
                return;
                }
                //validation for file size
                if (file.size > 2 * 1024 * 1024) {
                setError("File size must be less than 2MB");
                return;
                }
                //Converts file → temporary browser URL(create preview URL)
                const previewUrl = URL.createObjectURL(file);
                setPreview(previewUrl);
                setError(null);
            }

        }} />
        {preview && (
                <div className="mt-3 flex justify-center">
                <img
                    src={preview}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded-full border"
                />
                </div>
            )}

        <button
          type="submit"
          disabled={loading}
          className='w-40 bg-blue-400 p-2 rounded-xl'
        >
          {loading ? "Registering..." : "Register"}
        </button>

        {error && <p className="text-red-600">{error}</p>}

      </form>
    </div>
  )
}

export default Registration