import express from 'express';
import { supabase } from '../index.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Follow a user
router.post('/', requireAuth, async (req, res) => {
  try {
    const { following_id } = req.body;
    const followerId = req.user.id;

    if (!following_id) {
      return res.status(400).json({ error: 'Missing following_id' });
    }

    if (followerId === following_id) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const { data, error } = await supabase
      .from('follows')
      .insert({
        follower_id: followerId,
        following_id,
      })
      .select();

    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Already following' });
      }
      throw error;
    }

    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Unfollow a user
router.delete('/:following_id', requireAuth, async (req, res) => {
  try {
    const { following_id } = req.params;
    const followerId = req.user.id;

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', following_id);

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get followers
router.get('/:user_id/followers', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('follows')
      .select('follower_id, users:follower_id (id, username, avatar_url)')
      .eq('following_id', req.params.user_id);

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get following
router.get('/:user_id/following', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('follows')
      .select('following_id, users:following_id (id, username, avatar_url)')
      .eq('follower_id', req.params.user_id);

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check if following
router.get('/:user_id/is-following/:target_id', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', req.params.user_id)
      .eq('following_id', req.params.target_id)
      .single();

    if (error && error.code === 'PGRST116') {
      return res.json({ isFollowing: false });
    }

    if (error) throw error;

    res.json({ isFollowing: !!data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
