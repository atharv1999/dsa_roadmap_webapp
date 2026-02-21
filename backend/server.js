const express = require('express');
const cors = require('cors');
const db = require('./database');
const fetch = require('node-fetch');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ===================== TOPICS =====================

// Get all topics
app.get('/api/topics', (req, res) => {
  const topics = db.prepare('SELECT * FROM topics ORDER BY sort_order, id').all();
  res.json(topics);
});

// Create a topic
app.post('/api/topics', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Topic name is required' });
  try {
    const maxOrder = db.prepare('SELECT COALESCE(MAX(sort_order), 0) as max_order FROM topics').get();
    const result = db.prepare('INSERT INTO topics (name, sort_order) VALUES (?, ?)').run(name, maxOrder.max_order + 1);
    const topic = db.prepare('SELECT * FROM topics WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(topic);
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Topic already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Delete a topic
app.delete('/api/topics/:id', (req, res) => {
  db.prepare('DELETE FROM topics WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ===================== SUBTOPICS =====================

// Get subtopics for a topic
app.get('/api/topics/:topicId/subtopics', (req, res) => {
  const subtopics = db.prepare(
    'SELECT * FROM subtopics WHERE topic_id = ? ORDER BY sort_order, id'
  ).all(req.params.topicId);
  res.json(subtopics);
});

// Create a subtopic
app.post('/api/subtopics', (req, res) => {
  const { topic_id, name, description } = req.body;
  if (!topic_id || !name) return res.status(400).json({ error: 'topic_id and name are required' });
  const maxOrder = db.prepare('SELECT COALESCE(MAX(sort_order), 0) as max_order FROM subtopics WHERE topic_id = ?').get(topic_id);
  const result = db.prepare('INSERT INTO subtopics (topic_id, name, description, sort_order) VALUES (?, ?, ?, ?)').run(topic_id, name, description || '', maxOrder.max_order + 1);
  const subtopic = db.prepare('SELECT * FROM subtopics WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(subtopic);
});

// Delete a subtopic
app.delete('/api/subtopics/:id', (req, res) => {
  db.prepare('DELETE FROM subtopics WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ===================== PROBLEMS =====================

// Get problems for a subtopic
app.get('/api/subtopics/:subtopicId/problems', (req, res) => {
  const problems = db.prepare(
    'SELECT * FROM problems WHERE subtopic_id = ? ORDER BY sort_order, id'
  ).all(req.params.subtopicId);
  res.json(problems);
});

// Fetch LeetCode problem info from URL
app.post('/api/leetcode/fetch', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    // Extract slug from URL like https://leetcode.com/problems/two-sum/
    const match = url.match(/leetcode\.com\/problems\/([\w-]+)/);
    if (!match) return res.status(400).json({ error: 'Invalid LeetCode URL' });
    const slug = match[1];

    const query = `
      query questionData($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          title
          difficulty
          titleSlug
        }
      }
    `;

    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com',
      },
      body: JSON.stringify({ query, variables: { titleSlug: slug } }),
    });

    const data = await response.json();
    if (!data.data || !data.data.question) {
      return res.status(404).json({ error: 'Problem not found on LeetCode' });
    }

    const question = data.data.question;
    res.json({
      title: question.title,
      difficulty: question.difficulty,
      leetcode_url: `https://leetcode.com/problems/${question.titleSlug}/`,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch from LeetCode: ' + err.message });
  }
});

// Create a problem
app.post('/api/problems', (req, res) => {
  const { subtopic_id, title, leetcode_url, difficulty } = req.body;
  if (!subtopic_id || !title || !leetcode_url) {
    return res.status(400).json({ error: 'subtopic_id, title, and leetcode_url are required' });
  }
  const maxOrder = db.prepare('SELECT COALESCE(MAX(sort_order), 0) as max_order FROM problems WHERE subtopic_id = ?').get(subtopic_id);
  const result = db.prepare(
    'INSERT INTO problems (subtopic_id, title, leetcode_url, difficulty, sort_order) VALUES (?, ?, ?, ?, ?)'
  ).run(subtopic_id, title, leetcode_url, difficulty || 'Easy', maxOrder.max_order + 1);
  const problem = db.prepare('SELECT * FROM problems WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(problem);
});

// Toggle done status
app.patch('/api/problems/:id/done', (req, res) => {
  const problem = db.prepare('SELECT * FROM problems WHERE id = ?').get(req.params.id);
  if (!problem) return res.status(404).json({ error: 'Problem not found' });
  const newStatus = problem.is_done ? 0 : 1;
  db.prepare('UPDATE problems SET is_done = ? WHERE id = ?').run(newStatus, req.params.id);
  res.json({ ...problem, is_done: newStatus });
});

// Toggle bookmark
app.patch('/api/problems/:id/bookmark', (req, res) => {
  const problem = db.prepare('SELECT * FROM problems WHERE id = ?').get(req.params.id);
  if (!problem) return res.status(404).json({ error: 'Problem not found' });
  const newStatus = problem.is_bookmarked ? 0 : 1;
  db.prepare('UPDATE problems SET is_bookmarked = ? WHERE id = ?').run(newStatus, req.params.id);
  res.json({ ...problem, is_bookmarked: newStatus });
});

// Save code solution
app.patch('/api/problems/:id/code', (req, res) => {
  const { code_solution } = req.body;
  db.prepare('UPDATE problems SET code_solution = ? WHERE id = ?').run(code_solution || '', req.params.id);
  const problem = db.prepare('SELECT * FROM problems WHERE id = ?').get(req.params.id);
  res.json(problem);
});

// Delete a problem
app.delete('/api/problems/:id', (req, res) => {
  db.prepare('DELETE FROM problems WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Get stats for a subtopic (done count / total count)
app.get('/api/subtopics/:subtopicId/stats', (req, res) => {
  const total = db.prepare('SELECT COUNT(*) as count FROM problems WHERE subtopic_id = ?').get(req.params.subtopicId);
  const done = db.prepare('SELECT COUNT(*) as count FROM problems WHERE subtopic_id = ? AND is_done = 1').get(req.params.subtopicId);
  res.json({ total: total.count, done: done.count });
});

// Get all bookmarked problems (with subtopic and topic info)
app.get('/api/bookmarks', (req, res) => {
  const problems = db.prepare(`
    SELECT p.*, s.name as subtopic_name, t.name as topic_name
    FROM problems p
    JOIN subtopics s ON p.subtopic_id = s.id
    JOIN topics t ON s.topic_id = t.id
    WHERE p.is_bookmarked = 1
    ORDER BY p.created_at DESC
  `).all();
  res.json(problems);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
