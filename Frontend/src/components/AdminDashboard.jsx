import { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'

import {
  pageWrapper,
  articleCardClass,
  articleTitle,
  articleExcerpt,
  articleMeta,
  emptyStateClass,
  errorClass,
  loadingClass,
  navLinkClass,
  navLinkActiveClass,
  divider,
  ghostBtn
} from '../styles/common'

import { useNavigate } from "react-router";

function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([])
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatingUserId, setUpdatingUserId] = useState(null)
  const [activeTab, setActiveTab] = useState('users') // 'users' or 'articles'

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true)
        setError(null)

        const [usersRes, articlesRes] = await Promise.all([
          axios.get('/admin-api/users', { withCredentials: true }),
          axios.get('/admin-api/articles', { withCredentials: true }),
        ])

        setUsers(usersRes.data.payload || [])
        setArticles(articlesRes.data.payload || [])
      } catch (err) {
        const message = err.response?.data?.message || 'Failed to load admin dashboard'
        setError(message)
        toast.error(message)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const openArticle = (article) => {
    navigate(`/article/${article._id}`, {
      state: article,
    });
  };

  const toggleUserStatus = async (user) => {
    try {
      setUpdatingUserId(user._id)

      if (user.isActive) {
        await axios.put(`/admin-api/block-user/${user._id}`, {}, { withCredentials: true })
        toast.success('User blocked successfully')
      } else {
        await axios.put(`/admin-api/unblock-user/${user._id}`, {}, { withCredentials: true })
        toast.success('User unblocked successfully')
      }

      setUsers((prev) =>
        prev.map((item) => (item._id === user._id ? { ...item, isActive: !item.isActive } : item))
      )
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user status')
    } finally {
      setUpdatingUserId(null)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
    })
  }

  const renderArticleGrid = (arts) => {
    if (arts.length === 0) {
      return <div className={emptyStateClass}>No articles available.</div>
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {arts.map((article) => (
          <div key={article._id} className={`${articleCardClass} flex flex-col`}>
            <div className="flex flex-col gap-2">
              <p className={articleMeta}>{article.category}</p>
              <p className={articleTitle}>{article.title}</p>
              <p className={articleExcerpt}>{article.content.slice(0, 60)}...</p>

              <div className="flex justify-between items-center mt-2">
                <p className={articleMeta}>By {article.author?.firstName || 'Unknown'}</p>
                <p className={articleMeta}>{formatDate(article.createdAt)}</p>
              </div>
            </div>

            <div className="mt-auto pt-4 flex items-center justify-between">
              <button className={ghostBtn} onClick={() => openArticle(article)}>
                Read Article →
              </button>
              <span className={`text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full border ${article.isArticleActive !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                {article.isArticleActive !== false ? 'Active' : 'Deleted'}
              </span>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (loading) return <p className={loadingClass}>Loading admin dashboard...</p>
  if (error) return <p className={errorClass}>{error}</p>

  return (
    <div className={pageWrapper}>
      
      {/* Admin Navigation (Similar to Author Navigation) */}
      <div className="flex gap-6 mb-6 justify-between items-center">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('users')}
            className={activeTab === 'users' ? navLinkActiveClass : navLinkClass}
          >
            Users
          </button>

          <button
            onClick={() => setActiveTab('articles')}
            className={activeTab === 'articles' ? navLinkActiveClass : navLinkClass}
          >
            Articles
          </button>
        </div>
      </div>

      <div className={divider}></div>

      {activeTab === 'users' && (
        <section>
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          {users.length === 0 ? (
            <div className={emptyStateClass}>No users found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user) => (
                <div key={user._id} className={`${articleCardClass} flex flex-col`}>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <p className={articleTitle}>{user.firstName} {user.lastName || ''}</p>
                      <span className="text-xs font-medium bg-white border border-[#d2d2d7] px-2 py-0.5 rounded uppercase tracking-wide text-[#636366]">
                        {user.role}
                      </span>
                    </div>
                    <p className={articleExcerpt}>{user.email}</p>
                    
                    <div className="mt-auto pt-4 flex items-center gap-3">
                      <button
                        className={
                          user.role === 'ADMIN'
                            ? 'flex-1 border border-[#d2d2d7] bg-gray-100 text-gray-500 font-medium px-4 py-2 rounded-lg text-sm text-center cursor-not-allowed'
                            : user.isActive
                              ? 'flex-1 bg-white border border-rose-200 text-rose-700 font-medium px-4 py-2 rounded-lg hover:bg-rose-50 transition-colors text-sm text-center'
                              : 'flex-1 bg-white border border-emerald-200 text-emerald-700 font-medium px-4 py-2 rounded-lg hover:bg-emerald-50 transition-colors text-sm text-center'
                        }
                        onClick={() => toggleUserStatus(user)}
                        disabled={updatingUserId === user._id || user.role === 'ADMIN'}
                      >
                        {updatingUserId === user._id
                          ? 'Updating...'
                          : user.role === 'ADMIN'
                            ? 'Protected'
                            : user.isActive
                              ? 'Block User'
                              : 'Unblock'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === 'articles' && (
        <>
          <section>
            <h2 className="text-xl font-semibold mb-4">Active Articles</h2>
            {renderArticleGrid(articles.filter(a => a.isArticleActive !== false))}
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold mb-4">Deleted Articles</h2>
            {renderArticleGrid(articles.filter(a => a.isArticleActive === false))}
          </section>
        </>
      )}
    </div>
  )
}

export default AdminDashboard
