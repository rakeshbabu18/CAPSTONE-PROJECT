import React, { useState } from 'react'
import {toast} from 'react-hot-toast'
import axios from 'axios'
import { useNavigate } from 'react-router'

function UserDashboard() {
  const navigate = useNavigate()
  const [articles, setArticles] = useState([])
  const [loading, setLoading] =useState(false)
  const [error, setError] = useState(null)

  const openArticle = (article) => {
    navigate(`/article/${article._id}`, {
      state: article,
    })
  }

  const onreadArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      let res = await axios.get("http://localhost:4000/users-api/articles", {
        withCredentials:true
      });
      setArticles(res.data.payload || []);
    } catch(err) {
      console.error("Error fetching articles:", err);
      setError(err.response?.data?.message || "Failed to load articles");
      toast.error(err.response?.data?.message || "Failed to load articles");
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* Navbar / Header */}
      <nav className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">User Dashboard</h1>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Action Header */}
        <div className="flex justify-between items-center mb-8">
           
          <button 
            onClick={onreadArticles} 
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg px-6 py-2.5 rounded-lg font-medium transition-all"
          >
            Fetch Articles
          </button>
        </div>

        {/* Status Messages */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-500 font-medium">Loading articles...</span>
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center font-medium border border-red-100">
            {error}
          </div>
        )}

        

        {/* Articles Grid */}
        {!loading && !error && articles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <div 
                key={article._id} 
                className="bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 p-6 flex flex-col transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-full uppercase tracking-wider">
                    {article.category || 'General'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {article.updatedAt ? new Date(article.updatedAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                  {article.title}
                </h3>
                
                <p className="text-sm font-medium text-gray-600 mb-4">
                  By {article.author?.firstName || 'Unknown'} {article.author?.lastName || ''}
                </p>
                
                <p className="text-black grow mb-6 line-clamp-3 text-sm leading-relaxed">
                  {article.content}
                </p>

                <div className="mt-auto pt-2">
                  <button
                    onClick={() => openArticle(article)}
                    className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                  >
                    Read Article →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default UserDashboard