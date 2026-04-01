const express = require('express');
const dbModule = require('../../config/db');
const { authRequired } = require('../../middleware/auth');

const router = express.Router();

const generateOrderNo = () => {
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(
    d.getDate()
  ).padStart(2, '0')}`;
  const r = Math.floor(Math.random() * 9000 + 1000);
  return `ORD${date}${r}`;
};

// POST /api/orders  (demo: trust client prices; later can join menu table)
router.post('/', authRequired, (req, res) => {
  try {
    const { items } = req.body; // [{ name, price, quantity }]
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'items required' });
    }
    const total = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const orderNo = generateOrderNo();

    const db = dbModule.getDb();
    if (!db) {
      return res.status(500).json({ message: 'Database not initialized' });
    }

    // 插入订单
    db.run('INSERT INTO orders (order_no, user_id, total_price, status) VALUES (?, ?, ?, ?)', [orderNo, req.user.id, total, 'pending']);
    
    // 获取插入的订单ID
    const orderResult = db.exec('SELECT id FROM orders WHERE order_no = ?', [orderNo]);
    if (orderResult.length === 0 || orderResult[0].values.length === 0) {
      return res.status(500).json({ message: 'Create order failed' });
    }
    
    const orderId = orderResult[0].values[0][0];
    
    // 插入订单项
    for (const it of items) {
      db.run('INSERT INTO order_items (order_id, name, price, quantity) VALUES (?, ?, ?, ?)', [orderId, it.name, it.price, it.quantity]);
    }
    
    // Emit order created event
    global.io.emit('order:created', { order_no: orderNo, status: 'pending' });

    res.status(201).json({ order_no: orderNo, total_price: total, status: 'pending' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Create order failed' });
  }
});

// GET /api/orders  当前用户订单列表
router.get('/', authRequired, (req, res) => {
  try {
    const { status } = req.query;
    let sql = 'SELECT * FROM orders WHERE user_id = ?';
    let params = [req.user.id];
    
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    sql += ' ORDER BY created_at DESC';
    
    const db = dbModule.getDb();
    if (!db) {
      return res.status(500).json({ message: 'Database not initialized' });
    }
    
    const result = db.exec(sql, params);
    if (result.length === 0) {
      return res.json({ orders: [] });
    }
    
    const columns = result[0].columns;
    const rows = result[0].values;
    const orders = rows.map(row => {
      const order = {};
      columns.forEach((column, index) => {
        order[column] = row[index];
      });
      return order;
    });
    
    res.json({ orders });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Fetch orders failed' });
  }
});

// PATCH /api/orders/:orderNo/status  更新订单状态（用于前端进度模拟）
router.patch('/:orderNo/status', authRequired, (req, res) => {
  try {
    const { orderNo } = req.params;
    const { status } = req.body || {};
    const allowed = ['pending', 'preparing', 'delivering', 'completed'];
    if (!orderNo || !status || !allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const db = dbModule.getDb();
    if (!db) {
      return res.status(500).json({ message: 'Database not initialized' });
    }
    
    // 执行更新
    db.run('UPDATE orders SET status = ? WHERE order_no = ? AND user_id = ?', [status, orderNo, req.user.id]);
    
    // 检查是否有记录被更新
    const result = db.exec('SELECT id FROM orders WHERE order_no = ? AND user_id = ? AND status = ?', [orderNo, req.user.id, status]);
    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Emit order status updated event
    global.io.emit('order:statusUpdated', { order_no: orderNo, status });

    res.json({ order_no: orderNo, status });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Update status failed' });
  }
});

// POST /api/orders/:orderNo/review  提交订单评价（写入 orders.rating / orders.review）
router.post('/:orderNo/review', authRequired, (req, res) => {
  try {
    const { orderNo } = req.params;
    const { rating, comment } = req.body || {};
    const r = parseInt(rating, 10);
    if (!orderNo || !Number.isFinite(r) || r < 1 || r > 5) {
      return res.status(400).json({ message: 'Invalid rating' });
    }

    const db = dbModule.getDb();
    if (!db) {
      return res.status(500).json({ message: 'Database not initialized' });
    }
    
    // 执行更新
    db.run('UPDATE orders SET rating = ?, review = ? WHERE order_no = ? AND user_id = ?', [r, comment || '', orderNo, req.user.id]);
    
    // 检查是否有记录被更新
    const result = db.exec('SELECT id FROM orders WHERE order_no = ? AND user_id = ? AND rating = ?', [orderNo, req.user.id, r]);
    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json({ order_no: orderNo, rating: r });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Submit review failed' });
  }
});

module.exports = router;