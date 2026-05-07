import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    fetchPostDetails();
  }, [id]);

  const fetchPostDetails = async () => {
    try {
      setLoading(true);
      const postResponse = await api.get(`/posts/${id}`);
      setPost(postResponse.data);
      setIsLiked(postResponse.data.likes?.some(l => l.user_id === user?.id) || false);
      setLikeCount(postResponse.data.likes?.length || 0);

      const commentsResponse = await api.get(`/comments/post/${id}`);
      setComments(commentsResponse.data);

      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      if (isLiked) {
        await api.delete(`/likes/${post.id}`);
        setIsLiked(false);
        setLikeCount(likeCount - 1);
      } else {
        await api.post('/likes', { post_id: post.id });
        setIsLiked(true);
        setLikeCount(likeCount + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setIsSubmitting(true);
      const response = await api.post('/comments', {
        post_id: id,
        content: commentText,
      });
      setComments([...comments, response.data]);
      setCommentText('');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-accent"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-accent hover:text-blue-400 transition"
        >
          ← Back
        </button>
        <div className="bg-red-900 text-red-100 p-4 rounded-lg">{error || 'Post not found'}</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 mb-20 md:mb-0">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-accent hover:text-blue-400 transition"
      >
        ← Back
      </button>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Media */}
        <div className="bg-black rounded-xl overflow-hidden aspect-square">
          {post.media_type === 'image' ? (
            <img src={post.media_url} alt="Post" className="w-full h-full object-cover" />
          ) : (
            <video src={post.media_url} controls className="w-full h-full object-cover" />
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          {/* Post Header */}
          <div className="pb-4 border-b border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-blue-600 flex-shrink-0 cursor-pointer"
                onClick={() => navigate(`/profile/${post.users.username}`)}
              >
                {post.users.avatar_url ? (
                  <img
                    src={post.users.avatar_url}
                    alt={post.users.username}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold">
                    {post.users.username[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <div
                className="cursor-pointer"
                onClick={() => navigate(`/profile/${post.users.username}`)}
              >
                <p className="font-semibold hover:text-accent transition">{post.users.username}</p>
              </div>
            </div>
            {post.caption && (
              <p className="text-gray-300 mb-4">{post.caption}</p>
            )}
          </div>

          {/* Engagement */}
          <div className="py-4 border-b border-gray-800">
            <div className="flex gap-4 mb-4">
              <button
                onClick={handleLike}
                className="text-2xl hover:scale-125 transition"
              >
                {isLiked ? '❤️' : '🤍'}
              </button>
              <span className="font-semibold">{likeCount} likes</span>
            </div>
            <p className="text-xs text-gray-400">
              {new Date(post.created_at).toLocaleString()}
            </p>
          </div>

          {/* Comments */}
          <div className="flex-1 overflow-y-auto py-4">
            <h3 className="font-semibold mb-4">Comments ({comments.length})</h3>
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="text-sm">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="font-semibold text-accent">{comment.users.username}</span>
                      <p className="text-gray-300 mt-1">{comment.content}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(comment.created_at).toLocaleString()}
                      </p>
                    </div>
                    {(user?.id === comment.user_id || user?.id === post.user_id) && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-red-500 hover:text-red-600 text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comment Input */}
          <form onSubmit={handleAddComment} className="pt-4 border-t border-gray-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:border-accent"
              />
              <button
                type="submit"
                disabled={isSubmitting || !commentText.trim()}
                className="px-4 py-2 bg-accent hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-semibold transition"
              >
                Post
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;
