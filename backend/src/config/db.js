const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// 数据库文件路径
const DB_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DB_DIR, 'smart_order.db');

// 确保数据目录存在
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// 创建数据库连接
const db = new Database(DB_FILE);

// 启用 WAL 模式以提高性能
db.pragma('journal_mode = WAL');

// 初始化数据库表
function initDatabase() {
  // 创建用户表
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      nickname TEXT,
      role TEXT DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 创建菜单表
  db.exec(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'Mains',
      price REAL NOT NULL,
      desc TEXT,
      image TEXT,
      tags TEXT,
      sales INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 创建订单表
  db.exec(`
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
    )
  `);

  // 创建订单项表
  db.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
      menu_item_id INTEGER,
      name VARCHAR(100) NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL
    )
  `);

  // 插入管理员用户
  const hashedPassword = bcrypt.hashSync('Xlbnas', 10);
  const insertAdmin = db.prepare(`
    INSERT OR IGNORE INTO users (phone, password_hash, role) VALUES (?, ?, ?)
  `);
  insertAdmin.run('Xlbnas', hashedPassword, 'admin');

  // 检查是否需要插入默认菜单数据
  const count = db.prepare('SELECT COUNT(*) as count FROM menu_items').get();
  if (count.count === 0) {
    console.log('Inserting default menu data...');
    const defaultMenuData = [
      { id: 1, name: 'Kung Pao Chicken', category: 'Mains', price: 38, desc: 'Classic Sichuan dish — tender chicken with crunchy peanuts', image: 'https://images.unsplash.com/photo-1604908176997-1251884b08a5?auto=format&fit=crop&w=800&q=80', tags: 'Spicy,Sichuan,Chicken,Hearty', sales: 186 },
      { id: 2, name: 'Mapo Tofu', category: 'Mains', price: 32, desc: 'Soft tofu in spicy Sichuan sauce with minced meat', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80', tags: 'Spicy,Sichuan,Tofu,Vegetarian', sales: 152 },
      { id: 3, name: 'Sweet and Sour Pork', category: 'Mains', price: 36, desc: 'Crispy pork with tangy sweet and sour sauce', image: 'https://images.unsplash.com/photo-1564936829992-9f38b51f0564?auto=format&fit=crop&w=800&q=80', tags: 'Sweet,Sour,Pork,Crispy', sales: 128 },
      { id: 4, name: 'Braised Pork', category: 'Mains', price: 42, desc: 'Slow-cooked pork belly with soy sauce and spices', image: 'https://images.unsplash.com/photo-1564936829992-9f38b51f0564?auto=format&fit=crop&w=800&q=80', tags: 'Pork,Braised,Traditional,Hearty', sales: 98 },
      { id: 5, name: 'Steamed Sea Bass', category: 'Mains', price: 58, desc: 'Fresh sea bass steamed with ginger and scallions', image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=80', tags: 'Fish,Steamed,Seafood,Fresh', sales: 86 },
      { id: 6, name: 'Garlic Broccoli', category: 'Vegetables', price: 22, desc: 'Fresh broccoli stir-fried with garlic', image: 'https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=800&q=80', tags: 'Vegetarian,Healthy,Green,Light', sales: 112 },
      { id: 7, name: 'Fried Rice', category: 'Rice & Noodles', price: 28, desc: 'Classic fried rice with eggs, vegetables and shrimp', image: 'https://images.unsplash.com/photo-1529042410759-bff31c812dba?auto=format&fit=crop&w=800&q=80', tags: 'Rice,Seafood,Classic,Hearty', sales: 145 },
      { id: 8, name: 'Noodles in Soup', category: 'Rice & Noodles', price: 30, desc: 'Hand-pulled noodles in savory broth with meat and vegetables', image: 'https://images.unsplash.com/photo-1563379617071-fb1a474b23d3?auto=format&fit=crop&w=800&q=80', tags: 'Noodles,Soup,Hearty,Traditional', sales: 132 },
      { id: 9, name: 'Spring Rolls', category: 'Appetizers', price: 18, desc: 'Crispy rolls filled with vegetables and shrimp', image: 'https://images.unsplash.com/photo-1563245372-f7216b524901?auto=format&fit=crop&w=800&q=80', tags: 'Appetizer,Crispy,Seafood,Vegetarian', sales: 178 },
      { id: 10, name: 'Dumplings', category: 'Appetizers', price: 20, desc: 'Steamed dumplings with pork and vegetables', image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80', tags: 'Appetizer,Steamed,Pork,Traditional', sales: 165 },
      { id: 11, name: 'Egg Drop Soup', category: 'Soups', price: 12, desc: 'Light soup with eggs and scallions', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80', tags: 'Soup,Light,Classic,Comfort', sales: 95 },
      { id: 12, name: 'Hot and Sour Soup', category: 'Soups', price: 14, desc: 'Spicy and tangy soup with tofu and vegetables', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80', tags: 'Soup,Spicy,Sour,Hearty', sales: 88 },
      { id: 13, name: 'Green Tea', category: 'Drinks', price: 8, desc: 'Traditional Chinese green tea', image: 'https://images.unsplash.com/photo-1559056199-58995227520e?auto=format&fit=crop&w=800&q=80', tags: 'Drink,Tea,Traditional,Healthy', sales: 192 },
      { id: 14, name: 'Soy Milk', category: 'Drinks', price: 6, desc: 'Freshly made soy milk', image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80', tags: 'Drink,Vegan,Healthy,Traditional', sales: 143 },
      { id: 15, name: 'Orange Juice', category: 'Drinks', price: 10, desc: 'Freshly squeezed orange juice', image: 'https://images.unsplash.com/photo-1592845348565-4585b8569a29?auto=format&fit=crop&w=800&q=80', tags: 'Drink,Fruit,Fresh,Healthy', sales: 126 },
      { id: 16, name: 'Apple Juice', category: 'Drinks', price: 10, desc: 'Freshly squeezed apple juice', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80', tags: 'Drink,Fruit,Fresh,Healthy', sales: 118 },
      { id: 17, name: 'Banana Milkshake', category: 'Drinks', price: 12, desc: 'Creamy banana milkshake', image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80', tags: 'Drink,Fruit,Creamy,Sweet', sales: 96 },
      { id: 18, name: 'Mango Pudding', category: 'Desserts', price: 20, desc: 'Sweet and creamy mango pudding', image: 'https://images.unsplash.com/photo-1599784129161-887e227b9b3a?auto=format&fit=crop&w=800&q=80', tags: 'Dessert,Sweet,Fruit,Creamy', sales: 85 },
      { id: 19, name: 'Red Bean Paste', category: 'Desserts', price: 18, desc: 'Sweet and soft, traditional classic', image: 'https://images.unsplash.com/photo-1563245372-f7216b524901?auto=format&fit=crop&w=800&q=80', tags: 'Dessert,Sweet,Traditional,Red Bean', sales: 76 },
      { id: 20, name: 'Ice Cream', category: 'Desserts', price: 15, desc: 'Cool and sweet, multiple flavors', image: 'https://images.unsplash.com/photo-1543363102-28c713943584?auto=format&fit=crop&w=800&q=80', tags: 'Dessert,Sweet,Icy,Classic', sales: 156 }
    ];

    const insertMenu = db.prepare(`
      INSERT OR IGNORE INTO menu_items (id, name, category, price, desc, image, tags, sales)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    defaultMenuData.forEach(item => {
      insertMenu.run(item.id, item.name, item.category, item.price, item.desc, item.image, item.tags, item.sales);
    });
  }

  console.log('Connected to SQLite database (better-sqlite3)');
}

// 初始化数据库
initDatabase();

// 导出数据库连接
module.exports = {
  getDb: () => db
};
