import { useParams, useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../stores/useAuth";
import { toast } from "react-hot-toast";

import {
  articlePageWrapper,
  articleHeader,
  articleCategory,
  articleMainTitle,
  articleAuthorRow,
  authorInfo,
  articleContent,
  articleFooter,
  articleActions,
  editBtn,
  deleteBtn,
  loadingClass,
  errorClass,
} from "../styles/common.js";

function ArticleByID() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const user = useAuth((state) => state.currentUser);

  const [article, setArticle] = useState(location.state || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  const loggedInUserId = user?.userId || user?._id;
  const articleAuthorId = article?.author?._id || article?.author;
  const isAuthorOwner =
    String(user?.role || "").toUpperCase() === "AUTHOR" &&
    loggedInUserId &&
    articleAuthorId &&
    String(articleAuthorId) === String(loggedInUserId);

  useEffect(() => {
    const getArticle = async () => {
      setLoading(true);

      try {
        const res = await axios.get(`http://localhost:4000/users-api/article/${id}`, { withCredentials: true });

        setArticle(res.data.payload);
      } catch (err) {
        setError(err.response?.data?.error);
      } finally {
        setLoading(false);
      }
    };

    if (!article) {
      getArticle();
    }
  }, [id, article]);

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // retrieving all the comments of the article
  const fetchComments = async () => {
    try {
      setCommentsLoading(true);
      const res = await axios.get(`http://localhost:4000/users-api/comments/${id}`, { withCredentials: true });
      setComments(res.data.payload || []);
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || "Failed to load comments");
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchComments();
    }
  }, [id]);

  // adding comments to articles if the current user is user and not author
  const submitComment = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login to submit a comment");
      return;
    }

    const trimmedComment = commentText.trim();
    if (!trimmedComment) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      setCommentLoading(true);
      await axios.put(
        `http://localhost:4000/users-api/articles`,
        { articleId: id, comment: trimmedComment },
        { withCredentials: true }
      );
      toast.success("Comment submitted successfully");
      setCommentText("");
      fetchComments();
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || "Failed to submit comment");
    } finally {
      setCommentLoading(false);
    }
  };

  // delete article
  const deleteArticle = async () => {
    try {
      await axios.patch(`http://localhost:4000/author-api/delete-article/${id}`, {}, { withCredentials: true });

      toast.success("Article deleted successfully");
      navigate("/author-profile");
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || "Failed to delete article");
      setError(err.response?.data?.error);
    }
  };

  const editArticle = (articleObj) => {
    navigate("/edit-article", { state: articleObj });
  };

  if (loading) return <p className={loadingClass}>Loading article...</p>;
  if (error) return <p className={errorClass}>{error}</p>;
  if (!article) return null;

  return (
    <div className={articlePageWrapper}>
      {/* Header */}
      <div className={articleHeader}>
        <span className={articleCategory}>{article.category}</span>

        <h1 className={`${articleMainTitle} uppercase`}>{article.title}</h1>

        <div className={articleAuthorRow}>
          <div className={authorInfo}>Author:{article.author?.firstName || "Author"}</div>

          <div>{formatDate(article.createdAt)}</div>
        </div>
      </div>

      {/* Content */}
      <div className={articleContent}>{article.content}</div>

      {/* Comment Section */}
      {user && user.role === "USER" && (
        <div className="mt-10">
          <h3 className="text-xl font-semibold mb-4">Leave a Comment</h3>
          <form onSubmit={submitComment} className="flex flex-col gap-3">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write your comment..."
              rows={1}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <div>
              <button
                type="submit"
                disabled={commentLoading}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {commentLoading ? "Submitting..." : "Submit Comment"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Comments List */}
      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4">Comments</h3>
        {commentsLoading ? (
          <p className="text-gray-500">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-gray-500">No comments yet.</p>
        ) : (
          <div className="space-y-3">
            {comments.map((item, index) => (
              <div key={`${item.user?._id || "user"}-${index}`} className="rounded-md border border-gray-200 p-3 bg-white">
                <p className="text-sm font-semibold text-gray-800">
                  {item.user?.firstName || "User"} {item.user?.lastName || ""}
                </p>
                <p className="text-sm text-gray-700 mt-1">{item.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AUTHOR actions */}
      {isAuthorOwner && (
        <div className={articleActions}>
          <button className={editBtn} onClick={() => editArticle(article)}>
            Edit
          </button>

          <button className={deleteBtn} onClick={deleteArticle}>
            Delete
          </button>
        </div>
      )}

      {/* Footer */}
      <div className={articleFooter}>Last updated: {formatDate(article.updatedAt)}</div>
    </div>
  );
}

export default ArticleByID;