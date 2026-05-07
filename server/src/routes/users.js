import express from 'express';
import { supabase } from '../index.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/:username', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', req.params.username)
      .single();

    if (error) throw error;

    const { data: posts } = await supabase
      .from('posts')
      .select('id')
      .eq('user_id', data.id);

    const { data: followers } = await supabase
      .from('follows')
      .select('id')
      .eq('following_id', data.id);

    const { data: following } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', data.id);

    res.json({
      ...data,
      postCount: posts?.length || 0,
      followerCount: followers?.length || 0,
      followingCount: following?.length || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user
router.get('/', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user profile
router.put('/', requireAuth, async (req, res) => {
  try {
    const { avatar_url, bio } = req.body;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('users')
      .update({
        avatar_url,
        bio,
      })
      .eq('id', userId)
      .select();

    if (error) throw error;

    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user's posts
router.get('/:user_id/posts', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        users:user_id (id, username, avatar_url),
        likes (user_id),
        comments (id)
      `)
      .eq('user_id', req.params.user_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
