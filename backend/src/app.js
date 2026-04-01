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

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Smart Order System Backend',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      menu: '/api/menu',
      recommendations: '/api/recommendations/recommend',
      auth: '/api/auth',
      orders: '/api/orders'
    }
  });
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
      // 为不同类别的菜品使用不同的有效图片链接
      let imageUrl = row.image;
      if (!imageUrl || imageUrl.includes('1563245372-f7216b524901')) {
        switch (row.category) {
          case 'Mains':
            if (row.name.includes('Chicken')) {
              imageUrl = 'https://images.unsplash.com/photo-1604908176997-1251884b08a5?auto=format&fit=crop&w=800&q=80';
            } else if (row.name.includes('Tofu')) {
              imageUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
            } else if (row.name.includes('Pork')) {
              imageUrl = 'https://images.unsplash.com/photo-1564936829992-9f38b51f0564?auto=format&fit=crop&w=800&q=80';
            } else if (row.name.includes('Fish') || row.name.includes('Bass')) {
              imageUrl = 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=80';
            } else {
              imageUrl = 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=800&q=80';
            }
            break;
          case 'Vegetables':
            imageUrl = 'https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=800&q=80';
            break;
          case 'Rice & Noodles':
            if (row.name.includes('Rice')) {
              imageUrl = 'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=800&q=80';
            } else {
              imageUrl = 'https://images.unsplash.com/photo-1563379617071-fb1a474b23d3?auto=format&fit=crop&w=800&q=80';
            }
            break;
          case 'Appetizers':
            if (row.name.includes('Rolls')) {
              imageUrl = 'https://images.unsplash.com/photo-1563245372-f7216b524901?auto=format&fit=crop&w=800&q=80';
            } else {
              imageUrl = 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80';
            }
            break;
          case 'Soups':
            imageUrl = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80';
            break;
          case 'Drinks':
            if (row.name.includes('Tea')) {
              imageUrl = 'https://images.unsplash.com/photo-1559056199-58995227520e?auto=format&fit=crop&w=800&q=80';
            } else if (row.name.includes('Milk')) {
              imageUrl = 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80';
            } else if (row.name.includes('Juice')) {
              imageUrl = 'https://images.unsplash.com/photo-1592845348565-4585b8569a29?auto=format&fit=crop&w=800&q=80';
            } else {
              imageUrl = 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80';
            }
            break;
          case 'Desserts':
            if (row.name.includes('Pudding')) {
              imageUrl = 'https://images.unsplash.com/photo-1599784129161-887e227b9b3a?auto=format&fit=crop&w=800&q=80';
            } else if (row.name.includes('Bean')) {
              imageUrl = 'https://images.unsplash.com/photo-1563245372-f7216b524901?auto=format&fit=crop&w=800&q=80';
            } else {
              imageUrl = 'https://images.unsplash.com/photo-1543363102-28c713943584?auto=format&fit=crop&w=800&q=80';
            }
            break;
          default:
            imageUrl = 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=800&q=80';
        }
      }
      
      menuData.push({
        ...row,
        image: imageUrl,
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