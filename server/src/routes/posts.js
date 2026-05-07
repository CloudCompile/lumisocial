import express from 'express';
import { supabase } from '../index.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Get home feed (posts from followed users)
router.get('/feed', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: followingData } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);

    const followingIds = followingData?.map(f => f.following_id) || [];
    followingIds.push(userId);

    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        users:user_id (id, username, avatar_url),
        likes (user_id),
        comments (id)
      `)
      .in('user_id', followingIds)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get explore feed (all posts)
router.get('/explore', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        users:user_id (id, username, avatar_url),
        likes (user_id),
        comments (id)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single post
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        users:user_id (id, username, avatar_url),
        likes (user_id),
        comments (id)
      `)
      .eq('id', req.params.id)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create post
router.post('/', requireAuth, async (req, res) => {
  try {
    const { media_url, media_type, caption } = req.body;
    const userId = req.user.id;

    if (!media_url || !media_type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        media_url,
        media_type,
        caption: caption || '',
      })
      .select();

    if (error) throw error;

    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete post
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', req.params.id)
      .single();

    if (fetchError) throw fetchError;

    if (post.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
