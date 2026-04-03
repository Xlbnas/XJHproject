import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../index.css';

const Merchant = () => {
  const [menuData, setMenuData] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', price: '', desc: 'Popular dish', image: '' });
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // 加载菜单数据
  useEffect(() => {
    loadMenu();
  }, []);
  
  const loadMenu = async () => {
    try {
      // 使用相对路径
      const response = await axios.get('/api/menu');
      setMenuData(response.data);
    } catch (error) {
      console.error('Failed to load menu:', error);
    }
  };
  
  // 添加菜品到后端
  const addItemToBackend = async (item) => {
    try {
      // 使用相对路径
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
    }

    setNewItem({ name: '', price: '', desc: 'Popular dish', image: '' });
    setIsAddingItem(false);
  };
  
  // 编辑菜品
  const handleEditItem = (item) => {
    setEditingItem(item);
  };
  
  // 保存编辑
  const handleSaveEdit = async () => {
    if (!editingItem || !editingItem.name || !editingItem.price) return;
    
    try {
      // 使用相对路径
      const response = await axios.put(`/api/menu/${editingItem.id}`, editingItem);
      console.log('Item updated:', response.data);
      
      const updatedMenu = menuData.map(item => 
        item.id === editingItem.id 
          ? { ...response.data, tags: response.data.tags || [] }
          : item
      );
      setMenuData(updatedMenu);
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };
  
  // 删除菜品
  const handleDeleteItem = async (id) => {
    if (!id) return;
    
    try {
      // 使用相对路径
      await axios.delete(`/api/menu/${id}`);
      console.log('Item deleted:', id);
      
      const updatedMenu = menuData.filter(item => item.id !== id);
      setMenuData(updatedMenu);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };
  
  // 同步菜单数据（本地存储）
  const syncMenuData = (data) => {
    try {
      localStorage.setItem('menuData', JSON.stringify(data));
      console.log('Menu data synced to localStorage');
    } catch (error) {
      console.error('Failed to sync menu data:', error);
    }
  };
  
  return (
    <div className="merchant-container">
      <div className="merchant-header">
        <h1>Merchant Dashboard</h1>
        <button 
          className="add-item-button" 
          onClick={() => setIsAddingItem(true)}
        >
          Add New Item
        </button>
      </div>
      
      {/* 添加菜品表单 */}
      {isAddingItem && (
        <div className="add-item-form">
          <h2>Add New Menu Item</h2>
          <div className="form-group">
            <label>Name:</label>
            <input 
              type="text" 
              value={newItem.name} 
              onChange={(e) => setNewItem({...newItem, name: e.target.value})}
              placeholder="Item name"
            />
          </div>
          <div className="form-group">
            <label>Price:</label>
            <input 
              type="number" 
              value={newItem.price} 
              onChange={(e) => setNewItem({...newItem, price: e.target.value})}
              placeholder="Price"
            />
          </div>
          <div className="form-group">
            <label>Description:</label>
            <input 
              type="text" 
              value={newItem.desc} 
              onChange={(e) => setNewItem({...newItem, desc: e.target.value})}
              placeholder="Description"
            />
          </div>
          <div className="form-group">
            <label>Image URL:</label>
            <input 
              type="text" 
              value={newItem.image} 
              onChange={(e) => setNewItem({...newItem, image: e.target.value})}
              placeholder="Image URL"
            />
          </div>
          <div className="form-actions">
            <button onClick={handleAddItem}>Save</button>
            <button onClick={() => setIsAddingItem(false)}>Cancel</button>
          </div>
        </div>
      )}
      
      {/* 编辑菜品表单 */}
      {editingItem && (
        <div className="edit-item-form">
          <h2>Edit Menu Item</h2>
          <div className="form-group">
            <label>Name:</label>
            <input 
              type="text" 
              value={editingItem.name} 
              onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Price:</label>
            <input 
              type="number" 
              value={editingItem.price} 
              onChange={(e) => setEditingItem({...editingItem, price: parseFloat(e.target.value)})}
            />
          </div>
          <div className="form-group">
            <label>Description:</label>
            <input 
              type="text" 
              value={editingItem.desc} 
              onChange={(e) => setEditingItem({...editingItem, desc: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Image URL:</label>
            <input 
              type="text" 
              value={editingItem.image} 
              onChange={(e) => setEditingItem({...editingItem, image: e.target.value})}
            />
          </div>
          <div className="form-actions">
            <button onClick={handleSaveEdit}>Save</button>
            <button onClick={() => setEditingItem(null)}>Cancel</button>
          </div>
        </div>
      )}
      
      {/* 菜单列表 */}
      <div className="menu-list">
        <h2>Menu Items</h2>
        <div className="menu-grid">
          {menuData.map(item => (
            <div key={item.id} className="menu-item">
              <div className="menu-item-image">
                {item.image ? (
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#f3f4f6;color:#9ca3af;font-size:48px;">🍽️</div>';
                    }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', color: '#9ca3af', fontSize: '48px' }}>🍽️</div>
                )}
              </div>
              <div className="menu-item-name">{item.name}</div>
              <div className="menu-item-price">¥{item.price.toFixed(2)}</div>
              <div className="menu-item-sales">{item.sales} sold</div>
              <div className="menu-item-actions">
                <button className="edit-button" onClick={() => handleEditItem(item)}>Edit</button>
                <button className="delete-button" onClick={() => handleDeleteItem(item.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Merchant;
