import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const PostCard = ({ post, onLikeChange }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.likes?.some(l => l.user_id === user?.id) || false);
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleLike = async (e) => {
    e.stopPropagation();
    try {
      if (isLiked) {
        await api.delete(`/likes/${post.id}`);
        setIsLiked(false);
        setLikeCount(likeCount - 1);
      } else {
        await api.post('/likes', { post_id: post.id });
        setIsLiked(true);
        setLikeCount(likeCount + 1);
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 600);
      }
      onLikeChange?.();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden mb-4 shadow-lg hover:shadow-xl transition border border-gray-800">
      {/* Post Header */}
      <div className="p-4 flex items-center gap-3 border-b border-gray-800">
        <div
          className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-blue-600 flex-shrink-0 cursor-pointer"
          onClick={() => navigate(`/profile/${post.users.username}`)}
        >
          {post.users.avatar_url ? (
            <img src={post.users.avatar_url} alt={post.users.username} className="w-full h-full object-cover rounded-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-bold text-sm">
              {post.users.username[0]?.toUpperCase()}
            </div>
          )}
        </div>
        <div
          className="flex-1 cursor-pointer"
          onClick={() => navigate(`/profile/${post.users.username}`)}
        >
          <p className="font-semibold hover:text-accent transition">{post.users.username}</p>
          <p className="text-xs text-gray-400">{formatDate(post.created_at)}</p>
        </div>
      </div>

      {/* Media */}
      <div
        className="bg-black relative aspect-square overflow-hidden cursor-pointer group"
        onClick={() => navigate(`/post/${post.id}`)}
      >
        {post.media_type === 'image' ? (
          <img
            src={post.media_url}
            alt="Post"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        ) : (
          <video
            src={post.media_url}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            controls
          />
        )}
      </div>

      {/* Post Footer */}
      <div className="p-4">
        {/* Actions */}
        <div className="flex gap-4 mb-4">
          <button
            onClick={handleLike}
            className="text-xl hover:scale-125 transition"
          >
            <span className={isAnimating ? 'heart-beat inline-block' : ''}>
              {isLiked ? '❤️' : '🤍'}
            </span>
          </button>
          <button
            onClick={() => navigate(`/post/${post.id}`)}
            className="text-xl hover:scale-125 transition"
          >
            💬
          </button>
        </div>

        {/* Stats */}
        <div className="text-sm text-gray-400 mb-3">
          <p className="font-semibold text-white">{likeCount} likes</p>
          <p className="text-xs">{post.comments?.length || 0} comments</p>
        </div>

        {/* Caption */}
        {post.caption && (
          <div className="text-sm mb-3">
            <span className="font-semibold text-white">{post.users.username} </span>
            <span className="text-gray-300">{post.caption}</span>
          </div>
        )}

        {/* Comments Preview */}
        <button
          onClick={() => navigate(`/post/${post.id}`)}
          className="text-xs text-gray-400 hover:text-accent transition"
        >
          View all {post.comments?.length || 0} comments
        </button>
      </div>
    </div>
  );
};

export default PostCard;
