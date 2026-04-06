import React, { useState, useEffect } from 'react';
import axios from 'axios';

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

  // 从后端获取菜单数据
  const fetchMenuData = async () => {
    try {
      const response = await axios.get('/api/menu');
      setMenuData(response.data);
      // 缓存到本地存储
      localStorage.setItem('menu_data', JSON.stringify(response.data));
    } catch (error) {
      console.error('Error fetching menu data:', error);
      // 失败时使用本地存储的缓存数据
      const savedMenuData = localStorage.getItem('menu_data');
      if (savedMenuData) {
        setMenuData(JSON.parse(savedMenuData));
      } else {
        // 最后使用默认数据
        const defaultMenuData = [
          { id: 1, name: 'Kung Pao Chicken', category: 'Mains', price: 38, desc: 'Classic Sichuan dish — tender chicken with crunchy peanuts', image: 'https://images.unsplash.com/photo-1604908176997-1251884b08a5?auto=format&fit=crop&w=800&q=80', tags: ['Spicy', 'Sichuan', 'Chicken', 'Hearty'], sales: 186, rating: '98.5%' },
          { id: 2, name: 'Mapo Tofu', category: 'Mains', price: 28, desc: 'Silky tofu with spicy minced meat — perfect with rice', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80', tags: ['Spicy', 'Sichuan', 'Tofu', 'Vegetarian'], sales: 152, rating: '96.2%' }
        ];
        setMenuData(defaultMenuData);
        localStorage.setItem('menu_data', JSON.stringify(defaultMenuData));
      }
    }
  };

  useEffect(() => {
    fetchMenuData();

    // 模拟订单统计数据
    setOrderStats({
      totalOrders: 1250,
      totalRevenue: 48500,
      averageOrderValue: 38.8
    });
  }, []);

  // 同步菜单数据到后端
  const syncMenuData = async (updatedMenu) => {
    try {
      // 先更新本地存储
      localStorage.setItem('menu_data', JSON.stringify(updatedMenu));
      console.log('Menu data synced to localStorage');
    } catch (error) {
      console.error('Error syncing menu data to localStorage:', error);
    }
  };

  // 添加菜品到后端
  const addItemToBackend = async (item) => {
    try {
      const response = await axios.post('/api/menu', item);
      console.log('Item added to backend:', response.data);
      // 确保返回的数据包含必要的字段
      return {
        ...response.data,
        sales: response.data.sales || 0,
        rating: '0%',
        tags: response.data.tags || []
      };
    } catch (error) {
      console.error('Error adding item to backend:', error);
      return null;
    }
  };

  // 更新菜品到后端
  const updateItemToBackend = async (item) => {
    try {
      const response = await axios.put(`/api/menu/${item.id}`, item);
      console.log('Item updated in backend:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating item in backend:', error);
      return null;
    }
  };

  // 从后端删除菜品
  const deleteItemFromBackend = async (id) => {
    try {
      const response = await axios.delete(`/api/menu/${id}`);
      console.log('Item deleted from backend:', response.data);
      return true;
    } catch (error) {
      console.error('Error deleting item from backend:', error);
      return false;
    }
  };

  // 编辑菜品
  const handleEdit = (item) => {
    setEditingItemId(item.id);
    setEditingItem(item);
  };

  // 保存编辑
  const handleSaveEdit = async () => {
    if (!editingItem) return;
    
    // 调用后端API更新菜品
    await updateItemToBackend(editingItem);
    
    const updatedMenu = menuData.map(item => 
      item.id === editingItem.id ? editingItem : item
    );
    setMenuData(updatedMenu);
    syncMenuData(updatedMenu);
    setEditingItemId(null);
    setEditingItem(null);
  };

  // 删除菜品
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      // 调用后端API删除菜品
      await deleteItemFromBackend(id);
      
      const updatedMenu = menuData.filter(item => item.id !== id);
      setMenuData(updatedMenu);
      syncMenuData(updatedMenu);
    }
  };

  // 添加菜品
  const handleAddItem = async () => {
    if (!newItem.name || !newItem.price) return;

    const item = {
      name: newItem.name,
      price: parseFloat(newItem.price),
      desc: newItem.desc,
      category: 'Mains',
      image: newItem.image || 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80',
      tags: []
    };

    // 调用后端API添加菜品
    const savedItem = await addItemToBackend(item);

    if (savedItem) {
      // 使用后端返回的数据（包含正确的ID）
      const updatedMenu = [...menuData, savedItem];
      setMenuData(updatedMenu);
      syncMenuData(updatedMenu);
    }

    setNewItem({ name: '', price: '', desc: 'Popular dish', image: '' });
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