import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'
axios.defaults.baseURL = apiUrl

export const useAuth = create(
  persist(
    (set) => ({
      currentUser: null,
      loading: false,
      error: null,
      isAuthenticated: false,

      login: async (userCredentials) => {
        try {
          set({ loading: true, error: null })
          const res = await axios.post(
            "/common-api/authenticate",
            userCredentials,
            { withCredentials: true }
          )

          if (res.status === 200) {
            // Use payload from backend response
            const userData = res.data.payload || res.data.user
            const token = res.data.token
            localStorage.setItem("token", token)

            // Ensure userData has role field
            const userWithRole = {
              ...userData,
              role: userData.role || ""
            }

            set({
              currentUser: userWithRole,
              isAuthenticated: true,
              loading: false,
              error: null
            })
            return userWithRole
          }
          return null
        } catch (err) {
          set({
            loading: false,
            error: err.response?.data?.message || "Login failed",
            isAuthenticated: false,
            currentUser: null
          })
          return null
        }
      },

      logout: async() => {
        try {
          set({ loading: true, error: null })
          await axios.get(
            "/common-api/logout",
            { withCredentials: true }
          )

          localStorage.removeItem("token")
          set({
            currentUser: null,
            isAuthenticated: false,
            loading: false,
            error: null
          })
        } catch(err) {
          set({
            loading: false,
            error: err.response?.data?.message || "Logout failed",
            isAuthenticated: false
          })
        }
      },

      readArticles : async ()=>{
        try{
          set({ loading: true, error: null })
          let res = await axios.get(
            "/users-api/articles",
            { withCredentials:true }
          )
          
          if(res.status===200){
            set({
              loading: false,
              error: null
            })
            return res.data.payload;
          }
        } catch(err) {
          set({
            loading: false,
            error: err.response?.data?.message || "Articles not found",
          })
          return null;
        }
      },

      checkAuth: async () => {
        try {
          const res = await axios.get("/common-api/check-auth", { withCredentials: true });
          if(res.status===200){
            set({
              loading:false,
              error:null,
              currentUser: res.data.payload,
              isAuthenticated: true
            })
            console.log("Auth check successful, user data:", res.data.payload);
          }
        } catch (err) {
          // If refresh fails, clear auth state
          localStorage.removeItem("token");
          set({
            loading: false,
            error: null,
            currentUser: null,
            isAuthenticated: false
          })
        }
      }
    }),
    {
      name: 'auth-storage', // unique name for localStorage key
    }
  )
)