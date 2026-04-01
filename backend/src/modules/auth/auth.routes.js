const express = require('express');
const dbModule = require('../../config/db');
const { hashPassword, comparePassword } = require('../../utils/password');
const { signToken } = require('../../utils/jwt');
const { authRequired } = require('../../middleware/auth');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { phone, password, nickname } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ message: 'phone and password required' });
    }
    const hashed = await hashPassword(password);

    const db = dbModule.getDb();
    if (!db) {
      return res.status(500).json({ message: 'Database not initialized' });
    }

    try {
      // 插入用户
      const result = db.prepare('INSERT INTO users (phone, password_hash, nickname) VALUES (?, ?, ?)')
        .run(phone, hashed, nickname || null);

      // 获取插入的用户
      const user = db.prepare('SELECT id, phone, nickname, created_at FROM users WHERE id = ?')
        .get(result.lastInsertRowid);

      if (!user) {
        return res.status(500).json({ message: 'Register failed' });
      }

      const token = signToken({ id: user.id, phone: user.phone });
      res.json({ user, token });
    } catch (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ message: 'Phone already registered' });
      }
      console.error(err);
      return res.status(500).json({ message: 'Register failed' });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Register failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ message: 'phone and password required' });
    }

    const db = dbModule.getDb();
    if (!db) {
      return res.status(500).json({ message: 'Database not initialized' });
    }

    const user = db.prepare('SELECT id, phone, nickname, password_hash, created_at FROM users WHERE phone = ?')
      .get(phone);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const ok = await comparePassword(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken({ id: user.id, phone: user.phone });
    delete user.password_hash;
    res.json({ user, token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Login failed' });
  }
});

// GET /api/auth/me
router.get('/me', authRequired, (req, res) => {
  try {
    const db = dbModule.getDb();
    if (!db) {
      return res.status(500).json({ message: 'Database not initialized' });
    }

    const user = db.prepare('SELECT id, phone, nickname, created_at FROM users WHERE id = ?')
      .get(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

module.exports = router;
