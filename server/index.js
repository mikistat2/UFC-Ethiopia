// ...existing code...


// ...existing code...



import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import pg from 'pg';
import axios from 'axios';
import bcrypt from 'bcrypt';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


app.post('/api/comments/:commentId/like', async (req, res) => {
  const { commentId } = req.params;
  const { action } = req.body; // 'like' or 'unlike'
  if (!commentId || !['like', 'unlike'].includes(action)) {
    return res.status(400).json({ error: 'Invalid request.' });
  }
  try {
    const op = action === 'like' ? 1 : -1;
    const result = await db.query(
      'UPDATE comments SET like_count = GREATEST(like_count + $1, 0) WHERE id = $2 RETURNING id, like_count',
      [op, commentId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Comment not found.' });
    const updated = result.rows[0];
    io.emit('like-count-update', { commentId: updated.id, like_count: updated.like_count });
    res.json({ success: true, commentId: updated.id, like_count: updated.like_count });
  } catch (error) {
    console.error('Like endpoint error:', error);
    res.status(500).json({ error: 'Failed to update like count.' });
  }
});
// Create HTTP server and Socket.io instance
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on('like-comment', (data) => {
    // Broadcast like event to all other clients
    socket.broadcast.emit('like-comment', data);
  });
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});
// MMA Fighters API (ZylaLabs)
const ZYLA_API_URL = "https://zylalabs.com/api/9520/mma+fighter+rankings+extractor+api/17404/get+all+fighter+names";
const ZYLA_API_KEY = process.env.ZYLA_API_KEY;

// Endpoint to get all fighter names
app.get('/api/fighters', async (req, res) => {
  try {
    const response = await axios.post(
      ZYLA_API_URL,
      {}, // body is empty
      {
        headers: {
          Authorization: `Bearer ${ZYLA_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    res.json(response.data); // Send data back to React
  } catch (error) {
    console.error("Error fetching fighters:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch fighters" });
  }
});



const db = new pg.Client({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});
db.connect();

app.get('/', (req, res) => {
  res.send('UFC Live API running');
});


const saltRounds = 10;

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get comments for a specific event
app.get('/api/comments/:eventId', async (req, res) => {
  const { eventId } = req.params;
  try {
    const result = await db.query(
      'SELECT * FROM comments WHERE event_id = $1 ORDER BY id ASC',
      [eventId]
    );
    res.json({ comments: result.rows });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to fetch comments.' });
  }
});

// Register endpoint
app.post('/api/register', async (req, res) => {
  const { email, password, nickname } = req.body;
  if (!email || !password || !nickname) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  try {
    const checkResult = await db.query(
      'SELECT email FROM users WHERE email = $1',
      [email]
    );
    if (checkResult.rows.length > 0) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    const hash = await bcrypt.hash(password, saltRounds);
    await db.query(
      'INSERT INTO users (email, password, nickname) VALUES ($1, $2, $3)',
      [email, hash, nickname]
    );
    res.json({ success: true, message: 'User registered successfully!' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'An error occurred during registration.' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password.' });
  }
  try {
    const userResult = await db.query('SELECT id, password, nickname FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Email does not exist. Please register.' });
    }
    const user = userResult.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      // In production, return a JWT or session token here
      res.json({ success: true, user: { id: user.id, email, nickname: user.nickname } });
    } else {
      res.status(401).json({ error: 'Incorrect password.' });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'An error occurred during login.' });
  }
});

// Post a comment (requires userId, eventId, eventName, nickname, body)
app.post('/api/comments', async (req, res) => {
  const { userId, eventId, eventName, nickname, body } = req.body;
  if (!userId || !eventId || !eventName || !nickname || !body) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  try {
    const result = await db.query(
      'INSERT INTO comments (user_id, event_id, event_name, nickname, body) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, eventId, eventName, nickname, body]
    );
    const newComment = result.rows[0];
    io.emit('new-comment', newComment);
    res.json({ success: true, message: 'Comment posted.', comment: newComment });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to post comment.' });
  }
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running with Socket.io on port ${PORT}`);
});
