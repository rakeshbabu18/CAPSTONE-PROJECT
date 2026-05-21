import React, { useState } from 'react'
import {toast} from 'react-hot-toast'
import axios from 'axios'
import { useNavigate } from 'react-router'
import { useAuth } from '../../stores/useAuth'

function UserDashboard() {
  const navigate = useNavigate()
  const currentUser = useAuth((state) => state.currentUser)
  const [articles, setArticles] = useState([])
  const [loading, setLoading] =useState(false)
  const [error, setError] = useState(null)

  React.useEffect(() => {
    onreadArticles();
  }, []);

  const openArticle = (article) => {
    navigate(`/article/${article._id}`, {
      state: article,
    })
  }

  const onreadArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      let res = await axios.get("/users-api/articles", {
        withCredentials:true
      });
      console.log("Dashboard articles response:", res.data);
      const articlesData = res.data.payload || res.data;
      setArticles(Array.isArray(articlesData) ? articlesData : []);
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

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome, <span className="text-blue-600">{currentUser?.firstName  }</span>!
          </h2>
          <p className="text-gray-500 mt-1">Explore the latest articles from our community.</p>
        </div>

        {/* Action Header */}
        <div className="flex justify-between items-center mb-8">
           
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
        {!loading && !error && articles.length > 0 ? (
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
        ) : (
          !loading && !error && (
            <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
              <div className="text-gray-400 mb-3">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">No articles found</h3>
              <p className="text-gray-500">Check back later for new content.</p>
            </div>
          )
        )}
      </main>
    </div>
  )
}

export default UserDashboard