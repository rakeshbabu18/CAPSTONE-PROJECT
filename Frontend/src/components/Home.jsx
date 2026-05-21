import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import axios from 'axios'

function Home() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      setLoading(true)
      // Call the existing articles endpoint
      // No withCredentials here to avoid triggering session checks if not needed
      let res = await axios.get("/users-api/articles")
      console.log("Full articles response data:", res.data)
      const articlesData = res.data.payload || res.data;
      setArticles(Array.isArray(articlesData) ? articlesData : []);
    } catch (err) {
      console.error("Error fetching articles:", err)
    } finally {
      setLoading(false)
    }
  }

  const openArticle = (article) => {
    navigate(`/article/${article._id}`, {
      state: article,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome to Blog App</h1>
        <p className="text-xl text-gray-600 mb-12 text-center">Share your thoughts with the world</p>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
            {articles.map((article) => (
              <div 
                key={article._id} 
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 p-8 flex flex-col transition-all cursor-pointer overflow-hidden group"
                onClick={() => openArticle(article)}
              >
                <div className="flex justify-between items-start mb-6">
                  <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase tracking-widest">
                    {article.category || 'General'}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">
                    {article.updatedAt ? new Date(article.updatedAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                
                <h3 className="text-2xl font-extrabold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                  {article.title}
                </h3>
                
                <p className="text-sm font-semibold text-gray-500 mb-6 flex items-center">
                  <span className="w-6 h-6 bg-gray-200 rounded-full mr-2 flex items-center justify-center text-[10px] text-gray-600">
                    {article.author?.firstName?.charAt(0)}
                  </span>
                  By {article.author?.firstName || 'Unknown'} {article.author?.lastName || ''}
                </p>
                
                <p className="text-gray-600 grow mb-8 line-clamp-4 text-base leading-relaxed">
                  {article.content}
                </p>

                <div className="mt-auto border-t border-gray-50 pt-5 flex justify-between items-center text-sm">
                  <span className="text-blue-600 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center">
                    Read Full Story
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  <span className="text-gray-300">
                    {article.comments?.length || 0} comments
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && articles.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200 w-full">
            <p className="text-gray-500 text-lg">No articles have been published yet.</p>
          </div>
        )}

        <div className="mt-16 text-center border-t border-gray-100 pt-10 w-full">
          <p className="text-gray-500 mb-4 font-medium italic">Want to join the conversation?</p>
          <div className="flex gap-4 justify-center">
            <Link to="/login" className="text-blue-600 font-bold hover:underline">Log in</Link>
            <span className="text-gray-300 text-xl font-thin">|</span>
            <Link to="/register" className="text-blue-600 font-bold hover:underline">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
