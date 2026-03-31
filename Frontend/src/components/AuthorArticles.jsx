import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { useAuth } from "../../stores/useAuth";
import { toast } from "react-hot-toast";

import {
  articleCardClass,
  articleTitle,
  articleExcerpt,
  articleMeta,
  ghostBtn,
  secondaryBtn,
  deleteBtn,
  loadingClass,
  errorClass,
  emptyStateClass,
} from "../styles/common";

function AuthorArticles() {
  const navigate = useNavigate();
  const currentUser = useAuth((state) => state.currentUser);

  const [activeArticles, setActiveArticles] = useState([]);
  const [deletedArticles, setDeletedArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deletingArticleId, setDeletingArticleId] = useState(null);
  const [retrievingArticleId, setRetrievingArticleId] = useState(null);

  useEffect(() => {
    const authorId = currentUser?.userId || currentUser?._id;
    if (!authorId) return;

    const getArticles = async () => {
      setLoading(true);
      setError(null);

      try {
        const ownRes = await axios.get(`/author-api/articles/${authorId}?includeInactive=true`, { withCredentials: true });
        const allOwnArticles = ownRes.data.payload || [];

        setActiveArticles(allOwnArticles.filter((article) => article.isArticleActive !== false));
        setDeletedArticles(allOwnArticles.filter((article) => article.isArticleActive === false));
      } catch (err) {
        console.log(err);
        setError(err.response?.data?.message || err.response?.data?.error || "Failed to fetch articles");
      } finally {
        setLoading(false);
      }
    };

    getArticles();
  }, [currentUser]);

  const openArticle = (article) => {
    navigate(`/article/${article._id}`, {
      state: article,
    });
  };

  const editArticle = (article) => {
    navigate(`/edit-article`, {
      state: article,
    });
  };

  const deleteArticle = async (articleId) => {
    const confirmed = window.confirm("Delete this article permanently?");
    if (!confirmed) return;

    try {
      setDeletingArticleId(articleId);
      await axios.patch(`/author-api/delete-article/${articleId}`, {}, { withCredentials: true });

      const articleToDelete = activeArticles.find((article) => article._id === articleId);
      setActiveArticles((prev) => prev.filter((article) => article._id !== articleId));
      if (articleToDelete) {
        setDeletedArticles((prev) => [{ ...articleToDelete, isArticleActive: false }, ...prev]);
      }
      toast.success("Article deleted successfully");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete article");
    } finally {
      setDeletingArticleId(null);
    }
  };

  const retrieveArticle = async (articleId) => {
    try {
      setRetrievingArticleId(articleId);
      await axios.patch(`/author-api/retrieve-article/${articleId}`, {}, { withCredentials: true });

      const articleToRetrieve = deletedArticles.find((article) => article._id === articleId);
      setDeletedArticles((prev) => prev.filter((article) => article._id !== articleId));
      if (articleToRetrieve) {
        setActiveArticles((prev) => [{ ...articleToRetrieve, isArticleActive: true }, ...prev]);
      }
      toast.success("Article retrieved successfully");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to retrieve article");
    } finally {
      setRetrievingArticleId(null);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
    });
  };

  const renderArticleGrid = (articles, options = {}) => {
    const { showEdit = false, showRetrieve = false } = options;

    if (articles.length === 0) {
      return <div className={emptyStateClass}>No articles available.</div>;
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {articles.map((article) => (
          <div key={article._id} className={`${articleCardClass} flex flex-col`}>
            <div className="flex flex-col gap-2">
              <p className={articleMeta}>{article.category}</p>

              <p className={articleTitle}>{article.title}</p>

              <p className={articleExcerpt}>{article.content.slice(0, 60)}...</p>

              <div className="flex justify-between items-center mt-2">
                <p className={articleMeta}>By {article.author?.firstName || "Unknown"}</p>
                <p className={articleMeta}>{formatDate(article.createdAt)}</p>
              </div>
            </div>

            <div className="mt-auto pt-4 flex items-center gap-3">
              <button className={ghostBtn} onClick={() => openArticle(article)}>
                Read Article →
              </button>
              {showEdit && (
                <>
                  <button
                    className="px-3 py-1 rounded-md border border-blue-500 text-blue-600 hover:bg-blue-50 transition-colors"
                    onClick={() => editArticle(article)}
                  >
                    Edit
                  </button>

                  <button
                    className={deleteBtn}
                    onClick={() => deleteArticle(article._id)}
                    disabled={deletingArticleId === article._id}
                  >
                    {deletingArticleId === article._id ? "Deleting..." : "Delete"}
                  </button>
                </>
              )}
              {showRetrieve && (
                <button
                  className={secondaryBtn}
                  onClick={() => retrieveArticle(article._id)}
                  disabled={retrievingArticleId === article._id}
                >
                  {retrievingArticleId === article._id ? "Retrieving..." : "Retrieve"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) return <p className={loadingClass}>Loading articles...</p>;
  if (error) return <p className={errorClass}>{error}</p>;

  return (
    <div>
      <section>
        <h2 className="text-xl font-semibold mb-4">Your Active Articles</h2>
        {activeArticles.length === 0 ? (
          <div className={emptyStateClass}>You haven't published any articles yet.</div>
        ) : (
          renderArticleGrid(activeArticles)
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Deleted Articles</h2>
        {deletedArticles.length === 0 ? (
          <div className={emptyStateClass}>No deleted articles.</div>
        ) : (
          renderArticleGrid(deletedArticles, { showRetrieve: true })
        )}
      </section>
    </div>
  );
}

export default AuthorArticles;