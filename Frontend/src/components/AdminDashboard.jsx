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
  const [updatingArticleId, setUpdatingArticleId] = useState(null)
  const [activeTab, setActiveTab] = useState('users') // 'users' or 'articles'

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await axios.get('/admin-api/users', { withCredentials: true })
      console.log("Admin users response:", res.data);
      const usersData = res.data.payload || res.data;
      setUsers(Array.isArray(usersData) ? usersData : [])
    } catch (err) {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const fetchArticles = async () => {
    try {
      setLoading(true)
      const res = await axios.get('/admin-api/articles', { withCredentials: true })
      console.log("Admin articles response:", res.data);
      const articlesData = res.data.payload || res.data;
      setArticles(Array.isArray(articlesData) ? articlesData : [])
    } catch (err) {
      toast.error('Failed to load articles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setError(null)
        if (activeTab === 'users') {
          await fetchUsers()
        } else if (activeTab === 'articles') {
          await fetchArticles()
        }
      } catch (err) {
        setError('Failed to load dashboard')
      }
    }

    loadDashboard()
  }, [activeTab])

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

  const toggleArticleStatus = async (article) => {
    try {
      setUpdatingArticleId(article._id)

      if (article.isArticleActive !== false) {
        // currently active, so delete it
        await axios.put(`/admin-api/delete-article/${article._id}`, {}, { withCredentials: true })
        toast.success('Article deleted successfully')
      } else {
        // currently deleted, so restore it
        await axios.put(`/admin-api/restore-article/${article._id}`, {}, { withCredentials: true })
        toast.success('Article restored successfully')
      }

      setArticles((prev) =>
        prev.map((item) => (item._id === article._id ? { ...item, isArticleActive: item.isArticleActive === false ? true : false } : item))
      )
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update article status')
    } finally {
      setUpdatingArticleId(null)
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
              
              <div className="flex items-center gap-3">
                <button
                  disabled={updatingArticleId === article._id}
                  onClick={() => toggleArticleStatus(article)}
                  className={`text-xs font-semibold uppercase tracking-wide px-3 py-1.5 rounded border transition-colors ${
                    article.isArticleActive !== false 
                      ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' 
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  {updatingArticleId === article._id ? '...' : (article.isArticleActive !== false ? 'Delete' : 'Restore')}
                </button>
              </div>
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
