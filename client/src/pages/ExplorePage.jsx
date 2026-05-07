import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import PostCard from '../components/PostCard';

const ExplorePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchExplore();
  }, []);

  const fetchExplore = async () => {
    try {
      setLoading(true);
      const response = await api.get('/posts/explore');
      setPosts(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-6">Explore</h1>

      {error && (
        <div className="bg-red-900 text-red-100 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      {posts.length === 0 && (
        <div className="text-center text-gray-400 py-12">
          <p>No posts yet</p>
        </div>
      )}

      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onLikeChange={fetchExplore} />
        ))}
      </div>
    </div>
  );
};

export default ExplorePage;
