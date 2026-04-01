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
      db.run('INSERT INTO users (phone, password_hash, nickname) VALUES (?, ?, ?)', [phone, hashed, nickname || null]);
      
      // 获取插入的用户
      const result = db.exec('SELECT id, phone, nickname, created_at FROM users WHERE phone = ?', [phone]);
      if (result.length === 0 || result[0].values.length === 0) {
        return res.status(500).json({ message: 'Register failed' });
      }
      
      const userData = result[0].values[0];
      const user = {
        id: userData[0],
        phone: userData[1],
        nickname: userData[2],
        created_at: userData[3]
      };
      
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
    
    const result = db.exec('SELECT id, phone, nickname, password_hash, created_at FROM users WHERE phone = ?', [phone]);
    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const userData = result[0].values[0];
    const user = {
      id: userData[0],
      phone: userData[1],
      nickname: userData[2],
      password_hash: userData[3],
      created_at: userData[4]
    };

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
    
    const result = db.exec('SELECT id, phone, nickname, created_at FROM users WHERE id = ?', [req.user.id]);
    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const userData = result[0].values[0];
    const user = {
      id: userData[0],
      phone: userData[1],
      nickname: userData[2],
      created_at: userData[3]
    };
    
    res.json({ user });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

module.exports = router;