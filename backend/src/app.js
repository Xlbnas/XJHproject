const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./modules/auth/auth.routes');
const orderRoutes = require('./modules/orders/order.routes');
const recommendationRoutes = require('./modules/recommendations/recommendation.routes');
const dbModule = require('./config/db');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  }
});

// Use middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/recommendations', recommendationRoutes);

// Menu API endpoint
app.get('/api/menu', (req, res) => {
  try {
    const db = dbModule.getDb();
    const stmt = db.prepare(`
      SELECT id, name, category, price, desc, image, tags, sales 
      FROM menu_items
    `);
    
    const menuData = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      menuData.push({
        ...row,
        tags: row.tags ? row.tags.split(',') : []
      });
    }
    
    res.json(menuData);
  } catch (error) {
    console.error('Menu API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Socket.io events
io.on('connection', (socket) => {
  console.log('A user connected');
  
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Set io as global variable for routes to use
global.io = io;

// ---- Minimal DB bootstrap (makes local setup smoother) ----
function initDb() {
  const db = dbModule.getDb();
  if (!db) {
    console.error('Database not initialized');
    return;
  }
  
  // users: created by registration/login, ensure baseline columns exist
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // orders
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_no VARCHAR(32) UNIQUE NOT NULL,
      user_id INTEGER REFERENCES users(id),
      total_price REAL NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      restaurant TEXT DEFAULT 'Maison Lumière',
      rating INTEGER DEFAULT 0,
      review TEXT DEFAULT '',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // order_items
  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
      menu_item_id INTEGER,
      name VARCHAR(100) NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL
    );
  `);

  // 创建管理员账户
  try {
    db.run('INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)', ['Xlbnas', 'Xlbnas', 'admin']);
    console.log('Admin account created or already exists');
  } catch (err) {
    console.error('Error creating admin account:', err);
  }
}

// 等待数据库初始化完成后启动服务器
setTimeout(() => {
  initDb();
  const port = process.env.PORT || 964;
  server.listen(port, '0.0.0.0', () => {
    console.log(`Backend running on http://localhost:${port}`);
  });
}, 2000);