import express from 'express';
import { supabase } from '../index.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Like a post
router.post('/', requireAuth, async (req, res) => {
  try {
    const { post_id } = req.body;
    const userId = req.user.id;

    if (!post_id) {
      return res.status(400).json({ error: 'Missing post_id' });
    }

    const { data, error } = await supabase
      .from('likes')
      .insert({
        user_id: userId,
        post_id,
      })
      .select();

    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Already liked' });
      }
      throw error;
    }

    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Unlike a post
router.delete('/:post_id', requireAuth, async (req, res) => {
  try {
    const { post_id } = req.params;
    const userId = req.user.id;

    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', post_id);

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get likes for a post
router.get('/post/:post_id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('likes')
      .select('*')
      .eq('post_id', req.params.post_id);

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
