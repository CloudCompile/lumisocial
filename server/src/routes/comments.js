import express from 'express';
import { supabase } from '../index.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Get comments for a post
router.get('/post/:post_id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        users:user_id (id, username, avatar_url)
      `)
      .eq('post_id', req.params.post_id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create comment
router.post('/', requireAuth, async (req, res) => {
  try {
    const { post_id, content } = req.body;
    const userId = req.user.id;

    if (!post_id || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('comments')
      .insert({
        user_id: userId,
        post_id,
        content,
      })
      .select(`
        *,
        users:user_id (id, username, avatar_url)
      `);

    if (error) throw error;

    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete comment
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { data: comment, error: fetchError } = await supabase
      .from('comments')
      .select('user_id, post_id')
      .eq('id', req.params.id)
      .single();

    if (fetchError) throw fetchError;

    const { data: post } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', comment.post_id)
      .single();

    if (comment.user_id !== req.user.id && post.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
