const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

// 创建SQLite数据库连接
let db;

async function initDatabase() {
  const SQL = await initSqlJs({
    locateFile: file => path.join(__dirname, '../../node_modules/sql.js/dist/', file)
  });
  
  const dbPath = path.join(__dirname, '../../smart_order.db');
  let database;
  
  // 检查数据库文件是否存在
  if (fs.existsSync(dbPath)) {
    // 读取现有数据库
    const data = fs.readFileSync(dbPath);
    database = new SQL.Database(data);
  } else {
    // 创建新数据库
    database = new SQL.Database();
  }
  
  db = database;
  console.log('Connected to SQLite database');
  
  // 创建用户表
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // 创建菜单表
  db.run(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      desc TEXT,
      image TEXT,
      tags TEXT,
      sales INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // 插入管理员用户
  db.run(`
    INSERT OR IGNORE INTO users (username, password, role) 
    VALUES ('Xlbnas', 'Xlbnas', 'admin')
  `);
  
  // 插入示例菜单数据
  const menuData = [
    { id: 1, name: 'Kung Pao Chicken', category: 'Mains', price: 38, desc: 'Classic Sichuan dish — tender chicken with crunchy peanuts', image: 'https://images.unsplash.com/photo-1604908176997-1251884b08a5?auto=format&fit=crop&w=800&q=80', tags: 'Spicy,Sichuan,Chicken,Hearty', sales: 186 },
    { id: 2, name: 'Mapo Tofu', category: 'Mains', price: 32, desc: 'Soft tofu in spicy Sichuan sauce with minced meat', image: 'https://images.unsplash.com/photo-1563245372-f7216b524901?auto=format&fit=crop&w=800&q=80', tags: 'Spicy,Sichuan,Tofu,Vegetarian', sales: 152 },
    { id: 3, name: 'Sweet and Sour Pork', category: 'Mains', price: 36, desc: 'Crispy pork with tangy sweet and sour sauce', image: 'https://images.unsplash.com/photo-1563245372-f7216b524901?auto=format&fit=crop&w=800&q=80', tags: 'Sweet,Sour,Pork,Crispy', sales: 128 },
    { id: 4, name: 'Braised Pork', category: 'Mains', price: 42, desc: 'Slow-cooked pork belly with soy sauce and spices', image: 'https://images.unsplash.com/photo-1563245372-f7216b524901?auto=format&fit=crop&w=800&q=80', tags: 'Pork,Braised,Traditional,Hearty', sales: 98 },
    { id: 5, name: 'Steamed Sea Bass', category: 'Mains', price: 58, desc: 'Fresh sea bass steamed with ginger and scallions', image: 'https://images.unsplash.com/photo-1563245372-f7216b524901?auto=format&fit=crop&w=800&q=80', tags: 'Fish,Steamed,Seafood,Fresh', sales: 86 },
    { id: 6, name: 'Garlic Broccoli', category: 'Vegetables', price: 22, desc: 'Fresh broccoli stir-fried with garlic', image: 'https://images.unsplash.com/photo-1563245372-f7216b524901?auto=format&fit=crop&w=800&q=80', tags: 'Vegetarian,Healthy,Green,Light', sales: 112 },
    { id: 7, name: 'Fried Rice', category: 'Rice & Noodles', price: 28, desc: 'Classic fried rice with eggs, vegetables and shrimp', image: 'https://images.unsplash.com/photo-1563245372-f7216b524901?auto=format&fit=crop&w=800&q=80', tags: 'Rice,Seafood,Classic,Hearty', sales: 145 },
    { id: 8, name: 'Noodles in Soup', category: 'Rice & Noodles', price: 30, desc: 'Hand-pulled noodles in savory broth with meat and vegetables', image: 'https://images.unsplash.com/photo-1563245372-f7216b524901?auto=format&fit=crop&w=800&q=80', tags: 'Noodles,Soup,Hearty,Traditional', sales: 132 },
    { id: 9, name: 'Spring Rolls', category: 'Appetizers', price: 18, desc: 'Crispy rolls filled with vegetables and shrimp', image: 'https://images.unsplash.com/photo-1563245372-f7216b524901?auto=format&fit=crop&w=800&q=80', tags: 'Appetizer,Crispy,Seafood,Vegetarian', sales: 178 },
    { id: 10, name: 'Dumplings', category: 'Appetizers', price: 20, desc: 'Steamed dumplings with pork and vegetables', image: 'https://images.unsplash.com/photo-1563245372-f7216b524901?auto=format&fit=crop&w=800&q=80', tags: 'Appetizer,Steamed,Pork,Traditional', sales: 165 },
    { id: 11, name: 'Egg Drop Soup', category: 'Soups', price: 12, desc: 'Light soup with eggs and scallions', image: 'https://images.unsplash.com/photo-1563245372-f7216b524901?auto=format&fit=crop&w=800&q=80', tags: 'Soup,Light,Classic,Comfort', sales: 95 },
    { id: 12, name: 'Hot and Sour Soup', category: 'Soups', price: 14, desc: 'Spicy and tangy soup with tofu and vegetables', image: 'https://images.unsplash.com/photo-1563245372-f7216b524901?auto=format&fit=crop&w=800&q=80', tags: 'Soup,Spicy,Sour,Hearty', sales: 88 },
    { id: 13, name: 'Green Tea', category: 'Drinks', price: 8, desc: 'Traditional Chinese green tea', image: 'https://images.unsplash.com/photo-1563245372-f7216b524901?auto=format&fit=crop&w=800&q=80', tags: 'Drink,Tea,Traditional,Healthy', sales: 192 },
    { id: 14, name: 'Soy Milk', category: 'Drinks', price: 6, desc: 'Freshly made soy milk', image: 'https://images.unsplash.com/photo-1563245372-f7216b524901?auto=format&fit=crop&w=800&q=80', tags: 'Drink,Vegan,Healthy,Traditional', sales: 143 },
    { id: 15, name: 'Orange Juice', category: 'Drinks', price: 10, desc: 'Freshly squeezed orange juice', image: 'https://images.unsplash.com/photo-1563245372-f7216b524901?auto=format&fit=crop&w=800&q=80', tags: 'Drink,Fruit,Fresh,Healthy', sales: 126 },
    { id: 16, name: 'Apple Juice', category: 'Drinks', price: 10, desc: 'Freshly squeezed apple juice', image: 'https://images.unsplash.com/photo-1563245372-f7216b524901?auto=format&fit=crop&w=800&q=80', tags: 'Drink,Fruit,Fresh,Healthy', sales: 118 },
    { id: 17, name: 'Banana Milkshake', category: 'Drinks', price: 12, desc: 'Creamy banana milkshake', image: 'https://images.unsplash.com/photo-1563245372-f7216b524901?auto=format&fit=crop&w=800&q=80', tags: 'Drink,Fruit,Creamy,Sweet', sales: 96 },
    { id: 18, name: 'Mango Pudding', category: 'Desserts', price: 20, desc: 'Sweet and creamy mango pudding', image: 'https://images.unsplash.com/photo-1563245372-f7216b524901?auto=format&fit=crop&w=800&q=80', tags: 'Dessert,Sweet,Fruit,Creamy', sales: 85 },
    { id: 19, name: 'Red Bean Paste', category: 'Desserts', price: 18, desc: 'Sweet and soft, traditional classic', image: 'https://images.unsplash.com/photo-1563245372-f7216b524901?auto=format&fit=crop&w=800&q=80', tags: 'Dessert,Sweet,Traditional,Red Bean', sales: 76 },
    { id: 20, name: 'Ice Cream', category: 'Desserts', price: 15, desc: 'Cool and sweet, multiple flavors', image: 'https://images.unsplash.com/photo-1563245372-f7216b524901?auto=format&fit=crop&w=800&q=80', tags: 'Dessert,Sweet,Icy,Classic', sales: 156 }
  ];
  
  // 插入菜单数据
  menuData.forEach(item => {
    db.run(`
      INSERT OR IGNORE INTO menu_items (id, name, category, price, desc, image, tags, sales) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [item.id, item.name, item.category, item.price, item.desc, item.image, item.tags, item.sales]);
  });
  
  // 保存数据库到文件
  setInterval(() => {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }, 5000); // 每5秒保存一次
}

// 初始化数据库
initDatabase().catch(err => {
  console.error('Error initializing database:', err);
});

// 导出数据库连接
module.exports = {
  getDb: () => db
};