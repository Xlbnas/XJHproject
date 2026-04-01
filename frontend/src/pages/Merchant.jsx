import React, { useState, useEffect } from 'react';

const Merchant = () => {
  const [menuData, setMenuData] = useState([]);
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0
  });
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    desc: 'Popular dish',
    image: ''
  });

  useEffect(() => {
    // 使用与Order页面相同的菜单数据
    const mockMenuData = [
      { id: 1, name: 'Kung Pao Chicken', category: 'Mains', price: 38, desc: 'Classic Sichuan dish — tender chicken with crunchy peanuts', image: 'https://images.unsplash.com/photo-1604908176997-1251884b08a5?auto=format&fit=crop&w=800&q=80', tags: ['Spicy', 'Sichuan', 'Chicken', 'Hearty'], sales: 186, rating: '98.5%' },
      { id: 2, name: 'Mapo Tofu', category: 'Mains', price: 28, desc: 'Silky tofu with spicy minced meat — perfect with rice', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80', tags: ['Spicy', 'Sichuan', 'Tofu', 'Vegetarian'], sales: 152, rating: '96.2%' },
      { id: 3, name: 'Sweet & Sour Pork', category: 'Mains', price: 42, desc: 'Tangy and sweet, crispy outside, tender inside', image: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=800&q=80', tags: ['Sweet & Sour', 'Pork', 'Classic'], sales: 134, rating: '94.8%' },
      { id: 4, name: 'Braised Pork Belly', category: 'Mains', price: 48, desc: 'Rich but not greasy, melts in your mouth', image: 'https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?auto=format&fit=crop&w=800&q=80', tags: ['Pork', 'Classic', 'Hearty'], sales: 167, rating: '97.3%' },
      { id: 5, name: 'Steamed Sea Bass', category: 'Mains', price: 58, desc: 'Delicate, fresh, and nutritious', image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=80', tags: ['Light', 'Seafood', 'Healthy'], sales: 98, rating: '95.6%' },
      { id: 6, name: 'Garlic Broccoli', category: 'Mains', price: 22, desc: 'Fresh and healthy, packed with nutrients', image: 'https://images.unsplash.com/photo-1505575967455-40e256f73376?auto=format&fit=crop&w=800&q=80', tags: ['Light', 'Vegetarian', 'Healthy'], sales: 121, rating: '93.1%' },
      { id: 7, name: 'Boiled Fish in Chili Oil', category: 'Mains', price: 52, desc: 'Fiery and aromatic, silky tender fish', image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=800&q=80', tags: ['Spicy', 'Sichuan', 'Seafood'], sales: 143, rating: '96.8%' },
      { id: 8, name: 'Yu Xiang Shredded Pork', category: 'Mains', price: 35, desc: 'Sweet, sour & mildly spicy — a Sichuan classic', image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=800&q=80', tags: ['Sweet & Sour', 'Sichuan', 'Pork'], sales: 128, rating: '95.2%' },
      { id: 9, name: 'Fried Chicken Wings', category: 'Sides', price: 32, desc: 'Golden crispy outside, juicy inside', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80', tags: ['Fried', 'Chicken', 'Snack'], sales: 156, rating: '94.5%' },
      { id: 10, name: 'Spring Rolls', category: 'Sides', price: 18, desc: 'Crispy shell, savory filling', image: 'https://images.unsplash.com/photo-1455853739633-8c94c03d8127?auto=format&fit=crop&w=800&q=80', tags: ['Fried', 'Vegetarian', 'Snack'], sales: 98, rating: '93.8%' },
      { id: 11, name: 'Soup Dumplings', category: 'Sides', price: 28, desc: 'Thin wrapper, generous filling, rich broth', image: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?auto=format&fit=crop&w=800&q=80', tags: ['Classic', 'Snack', 'Pork'], sales: 187, rating: '97.5%' },
      { id: 12, name: 'Pan-Fried Dumplings', category: 'Sides', price: 24, desc: 'Golden bottom, loaded with filling', image: 'https://images.unsplash.com/photo-1541450864946-90cbb9c0e7c7?auto=format&fit=crop&w=800&q=80', tags: ['Pan-Fried', 'Snack', 'Classic'], sales: 134, rating: '94.2%' },
      { id: 13, name: 'Cola', category: 'Drinks', price: 8, desc: 'Ice-cold cola, crisp and refreshing', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80', tags: ['Carbonated', 'Cold', 'Classic'], sales: 234, rating: '92.5%' },
      { id: 14, name: 'Lemon Honey Tea', category: 'Drinks', price: 15, desc: 'Sweet & tangy, soothes the throat', image: 'https://images.unsplash.com/photo-1509043759401-136742328bb3?auto=format&fit=crop&w=800&q=80', tags: ['Tea', 'Healthy', 'Sweet & Sour'], sales: 112, rating: '93.6%' },
      { id: 15, name: 'Fresh Orange Juice', category: 'Drinks', price: 18, desc: 'Freshly squeezed, rich in Vitamin C', image: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=800&q=80', tags: ['Juice', 'Healthy', 'Vitamin C'], sales: 98, rating: '94.8%' },
      { id: 16, name: 'Milk Tea', category: 'Drinks', price: 20, desc: 'Rich and silky, perfectly sweetened', image: 'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=800&q=80', tags: ['Tea', 'Classic', 'Sweet'], sales: 189, rating: '95.9%' },
      { id: 17, name: 'Tiramisu', category: 'Desserts', price: 35, desc: 'Italian classic, layers of rich flavor', image: 'https://images.unsplash.com/photo-1601972599720-36938d4ecd31?auto=format&fit=crop&w=800&q=80', tags: ['Sweet', 'Classic', 'Italian'], sales: 123, rating: '96.4%' },
      { id: 18, name: 'Mango Pudding', category: 'Desserts', price: 22, desc: 'Bouncy and smooth, sweet mango flavor', image: 'https://images.unsplash.com/photo-1525253086316-d0c936c814f8?auto=format&fit=crop&w=800&q=80', tags: ['Sweet', 'Fruit', 'Chewy'], sales: 98, rating: '93.2%' },
      { id: 19, name: 'Red Bean Paste', category: 'Desserts', price: 18, desc: 'Sweet and soft, traditional classic', image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80', tags: ['Sweet', 'Traditional', 'Red Bean'], sales: 76, rating: '92.8%' },
      { id: 20, name: 'Ice Cream', category: 'Desserts', price: 15, desc: 'Cool and sweet, multiple flavors', image: 'https://images.unsplash.com/photo-1570197571499-166b36435e9f?auto=format&fit=crop&w=800&q=80', tags: ['Icy', 'Sweet', 'Classic'], sales: 156, rating: '94.7%' }
    ];
    setMenuData(mockMenuData);

    // 模拟订单统计数据
    setOrderStats({
      totalOrders: 1250,
      totalRevenue: 48500,
      averageOrderValue: 38.8
    });
  }, []);

  // 编辑菜品
  const handleEdit = (item) => {
    setEditingItemId(item.id);
    setEditingItem(item);
  };

  // 保存编辑
  const handleSaveEdit = () => {
    if (!editingItem) return;
    
    const updatedMenu = menuData.map(item => 
      item.id === editingItem.id ? editingItem : item
    );
    setMenuData(updatedMenu);
    localStorage.setItem('menu_data', JSON.stringify(updatedMenu));
    setEditingItemId(null);
    setEditingItem(null);
  };

  // 删除菜品
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      const updatedMenu = menuData.filter(item => item.id !== id);
      setMenuData(updatedMenu);
      localStorage.setItem('menu_data', JSON.stringify(updatedMenu));
    }
  };

  // 添加菜品
  const handleAddItem = () => {
    if (!newItem.name || !newItem.price) return;
    
    const newId = Math.max(...menuData.map(item => item.id)) + 1;
    const item = {
      id: newId,
      name: newItem.name,
      price: parseFloat(newItem.price),
      desc: newItem.desc,
      sales: 0,
      rating: '0%',
      category: 'Mains',
      image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80',
      tags: []
    };
    
    const updatedMenu = [...menuData, item];
    setMenuData(updatedMenu);
    localStorage.setItem('menu_data', JSON.stringify(updatedMenu));
    setNewItem({ name: '', price: '', desc: 'Popular dish' });
    setIsAddingItem(false);
  };

  return (
    <div>
      <div className="merchant-header">
        <div>
          <h2>Merchant Dashboard</h2>
          <p className="merchant-subtitle">Manage your restaurant operations</p>
        </div>
      </div>

      <div className="merchant-grid">
        <div className="merchant-card merchant-card-full">
          <h3>Business Overview</h3>
          <div className="merchant-stats">
            <div className="stat-item">
              <div className="stat-label">Total Orders</div>
              <div className="stat-value">{orderStats.totalOrders}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Total Revenue</div>
              <div className="stat-value">¥{orderStats.totalRevenue.toFixed(2)}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Avg. Order Value</div>
              <div className="stat-value">¥{orderStats.averageOrderValue.toFixed(2)}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Order Completion Rate</div>
              <div className="stat-value">98.5%</div>
            </div>
          </div>
        </div>

        <div className="merchant-card">
          <h3>Top Selling Items</h3>
          <table className="merchant-table" id="merchantHotTable">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Item</th>
                <th>Sales</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {menuData.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.name}</td>
                  <td>{item.sales}</td>
                  <td>{item.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="merchant-card">
          <h3>Menu Management</h3>
          <div className="merchant-menu-tools">
            <input type="text" placeholder="Search menu items" />
            <button className="primary-btn btn-sm" onClick={() => setIsAddingItem(true)}>Add Item</button>
          </div>
          
          {/* 添加菜品表单 */}
          {isAddingItem && (
            <div className="merchant-add-form">
              <h4>Add New Item</h4>
              <div className="form-group">
                <label>Name</label>
                <input type="text" value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})} placeholder="Item name" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #e5e7eb', backgroundColor: 'white', color: '#111827' }} />
              </div>
              <div className="form-group">
                <label>Price</label>
                <input type="number" value={newItem.price} onChange={(e) => setNewItem({...newItem, price: e.target.value})} placeholder="Item price" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #e5e7eb', backgroundColor: 'white', color: '#111827' }} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input type="text" value={newItem.desc} onChange={(e) => setNewItem({...newItem, desc: e.target.value})} placeholder="Item description" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #e5e7eb', backgroundColor: 'white', color: '#111827' }} />
              </div>
              <div className="form-group">
                <label>Image</label>
                <input type="text" value={newItem.image || ''} onChange={(e) => setNewItem({...newItem, image: e.target.value})} placeholder="Enter image URL" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #e5e7eb', backgroundColor: 'white', color: '#111827' }} />
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>You can use a URL from Unsplash or other image sources</div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button className="primary-btn btn-sm" onClick={handleAddItem}>Save</button>
                <button className="secondary-btn btn-sm" onClick={() => setIsAddingItem(false)}>Cancel</button>
              </div>
            </div>
          )}
          
          <div className="merchant-menu-list" id="merchantMenuList">
            {menuData.map(item => (
              <div key={item.id} className="merchant-menu-item-container">
                <div className="merchant-menu-item">
                  <div className="merchant-menu-item-left">
                    <div className="merchant-item-thumb">
                      {item.image && (
                        <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
                      )}
                    </div>
                    <div>
                      <div className="merchant-item-name">{item.name}</div>
                      <div className="merchant-item-desc">{item.desc || 'Popular dish'}</div>
                    </div>
                  </div>
                  <div className="merchant-menu-item-right">
                    <div className="merchant-item-price">¥{item.price.toFixed(2)}</div>
                    <div className="merchant-item-actions">
                      <button className="btn-edit" onClick={() => handleEdit(item)}>Edit</button>
                      <button className="btn-delete" onClick={() => handleDelete(item.id)}>Delete</button>
                    </div>
                  </div>
                </div>
                
                {/* 编辑菜品表单 */}
                {editingItemId === item.id && editingItem && (
                  <div className="merchant-add-form">
                    <h4>Edit Item</h4>
                    <div className="form-group">
                      <label>Name</label>
                      <input type="text" value={editingItem.name} onChange={(e) => setEditingItem({...editingItem, name: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #e5e7eb', backgroundColor: 'white', color: '#111827' }} />
                    </div>
                    <div className="form-group">
                      <label>Price</label>
                      <input type="number" value={editingItem.price} onChange={(e) => setEditingItem({...editingItem, price: parseFloat(e.target.value)})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #e5e7eb', backgroundColor: 'white', color: '#111827' }} />
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <input type="text" value={editingItem.desc} onChange={(e) => setEditingItem({...editingItem, desc: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #e5e7eb', backgroundColor: 'white', color: '#111827' }} />
                    </div>
                    <div className="form-group">
                      <label>Image</label>
                      <input type="text" value={editingItem.image || ''} onChange={(e) => setEditingItem({...editingItem, image: e.target.value})} placeholder="Enter image URL" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #e5e7eb', backgroundColor: 'white', color: '#111827' }} />
                      <div style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>You can also upload an image or use a URL from Unsplash</div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                      <button className="primary-btn btn-sm" onClick={handleSaveEdit}>Save</button>
                      <button className="secondary-btn btn-sm" onClick={() => { setEditingItemId(null); setEditingItem(null); }}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Merchant;