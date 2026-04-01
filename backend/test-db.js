// 测试数据库查询
const dbModule = require('./src/config/db');

// 等待数据库初始化
setTimeout(() => {
  const db = dbModule.getDb();
  
  if (!db) {
    console.log('Database not initialized');
    return;
  }
  
  const stmt = db.prepare(`
    SELECT id, name, category, price, desc, image, tags, sales 
    FROM menu_items
  `);
  
  const menuData = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    console.log('Raw row:', row);
    console.log('Tags before split:', row.tags);
    console.log('Tags after split:', row.tags ? row.tags.split(',') : []);
    menuData.push({
      ...row,
      tags: row.tags ? row.tags.split(',') : []
    });
  }
  
  console.log('\nTotal items:', menuData.length);
  console.log('\nFirst item:', menuData[0]);
}, 1000);
