import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';

const ProfilePage = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/users/${username}`);
      setProfile(response.data);
      setBio(response.data.bio || '');
      setAvatar(response.data.avatar_url || '');

      const postsResponse = await api.get(`/users/${response.data.id}/posts`);
      setPosts(postsResponse.data);

      if (user?.id !== response.data.id) {
        const followResponse = await api.get(
          `/follows/${user.id}/is-following/${response.data.id}`
        );
        setIsFollowing(followResponse.data.isFollowing);
      }

      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await api.delete(`/follows/${profile.id}`);
        setIsFollowing(false);
      } else {
        await api.post('/follows', { following_id: profile.id });
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await api.put('/users', {
        bio,
        avatar_url: avatar,
      });
      setProfile({ ...profile, bio, avatar_url: avatar });
      setIsEditing(false);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-accent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        <div className="bg-red-900 text-red-100 p-4 rounded-lg">{error}</div>
      </div>
    );
  }

  const isOwnProfile = user?.id === profile?.id;

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 mb-20 md:mb-0">
      {/* Profile Header */}
      <div className="bg-gray-900 rounded-xl p-6 mb-6 border border-gray-800">
        <div className="flex gap-6 mb-6">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.username}
              className="w-24 h-24 rounded-full object-cover border-2 border-accent"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent to-blue-600 flex items-center justify-center text-3xl font-bold border-2 border-accent">
              {profile?.username?.[0]?.toUpperCase()}
            </div>
          )}

          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{profile?.username}</h1>
            {isEditing ? (
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-sm text-white mb-2"
                rows="3"
              />
            ) : (
              <p className="text-gray-400 mb-4">{profile?.bio || 'No bio yet'}</p>
            )}

            {isOwnProfile && isEditing && (
              <input
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="Avatar URL"
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-sm text-white mb-2"
              />
            )}

            <div className="flex gap-6 mb-4">
              <div>
                <p className="font-bold text-lg">{profile?.postCount || 0}</p>
                <p className="text-sm text-gray-400">Posts</p>
              </div>
              <div>
                <p className="font-bold text-lg">{profile?.followerCount || 0}</p>
                <p className="text-sm text-gray-400">Followers</p>
              </div>
              <div>
                <p className="font-bold text-lg">{profile?.followingCount || 0}</p>
                <p className="text-sm text-gray-400">Following</p>
              </div>
            </div>

            {isOwnProfile ? (
              <button
                onClick={() => {
                  if (isEditing) {
                    handleUpdateProfile();
                  } else {
                    setIsEditing(true);
                  }
                }}
                className="px-6 py-2 bg-accent hover:bg-blue-600 rounded-lg font-semibold transition"
              >
                {isEditing ? 'Save' : 'Edit Profile'}
              </button>
            ) : (
              <button
                onClick={handleFollow}
                className={`px-6 py-2 rounded-lg font-semibold transition ${
                  isFollowing
                    ? 'bg-gray-800 hover:bg-gray-700'
                    : 'bg-accent hover:bg-blue-600'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <h2 className="text-2xl font-bold mb-4">Posts</h2>
      {posts.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          <p>No posts yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
