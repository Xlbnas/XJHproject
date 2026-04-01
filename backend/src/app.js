const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const bcrypt = require('bcryptjs');
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
    const rows = db.prepare(`
      SELECT id, name, category, price, desc, image, tags, sales
      FROM menu_items
    `).all();

    const menuData = rows.map(row => {
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
              imageUrl = 'https://images.unsplash.com/photo-1529042410759-bff31c812dba?auto=format&fit=crop&w=800&q=80';
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

      return {
        ...row,
        image: imageUrl,
        tags: row.tags ? row.tags.split(',') : []
      };
    });

    res.json(menuData);
  } catch (error) {
    console.error('Menu API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add new menu item
app.post('/api/menu', (req, res) => {
  try {
    const db = dbModule.getDb();
    const { name, price, desc, category, image, tags } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    const tagsString = tags ? tags.join(',') : '';

    const result = db.prepare(
      'INSERT INTO menu_items (name, category, price, desc, image, tags, sales) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(name, category || 'Mains', price, desc || '', image || '', tagsString, 0);

    // Get the newly added item
    const newItem = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      ...newItem,
      tags: newItem.tags ? newItem.tags.split(',') : []
    });
  } catch (error) {
    console.error('Add menu item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update menu item
app.put('/api/menu/:id', (req, res) => {
  try {
    const db = dbModule.getDb();
    const { id } = req.params;
    const { name, price, desc, category, image, tags } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    const tagsString = tags ? tags.join(',') : '';

    const result = db.prepare(
      'UPDATE menu_items SET name = ?, category = ?, price = ?, desc = ?, image = ?, tags = ? WHERE id = ?'
    ).run(name, category || 'Mains', price, desc || '', image || '', tagsString, id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    // Get the updated item
    const updatedItem = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(id);

    res.json({
      ...updatedItem,
      tags: updatedItem.tags ? updatedItem.tags.split(',') : []
    });
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete menu item
app.delete('/api/menu/:id', (req, res) => {
  try {
    const db = dbModule.getDb();
    const { id } = req.params;

    const result = db.prepare('DELETE FROM menu_items WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Delete menu item error:', error);
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

// 启动服务器
const port = process.env.PORT || 964;
server.listen(port, '0.0.0.0', () => {
  console.log(`Backend running on http://localhost:${port}`);
});
