import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

// If we are in development, the vite proxy handles this. 
// If in production, we might need the absolute URL or it might be served from the same domain.
const apiUrl = import.meta.env.VITE_API_URL || ''
if (apiUrl) {
  axios.defaults.baseURL = apiUrl
}

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
            
            if (token) {
              localStorage.setItem("token", token)
            }

            // Ensure userData has role field
            const userWithRole = userData ? {
              ...userData,
              role: userData.role || ""
            } : null

            set({
              currentUser: userWithRole,
              isAuthenticated: !!userWithRole,
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
            const userData = res.data.payload;
            set({
              loading:false,
              error:null,
              currentUser: userData || null,
              isAuthenticated: !!userData
            })
            console.log("Auth check successful, user data:", userData);
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