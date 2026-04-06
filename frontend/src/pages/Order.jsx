import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const Order = () => {
  const { currentUser } = useContext(AuthContext);
  const [menuData, setMenuData] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isSwitchingSearch, setIsSwitchingSearch] = useState(false);
  const [isAiSearch, setIsAiSearch] = useState(true); // 默认使用AI搜索

  useEffect(() => {
    // 从后端API获取菜单数据
    const fetchMenuData = async () => {
      try {
        // 先检查本地存储是否有最新数据
        const savedMenuData = localStorage.getItem('menu_data');
        if (savedMenuData) {
          setMenuData(JSON.parse(savedMenuData));
          console.log('Loaded menu data from localStorage');
        }
        
        // 然后尝试从后端获取最新数据
        const response = await axios.get('/api/menu');
        // 只有当后端数据与本地存储不同时才更新
        if (!savedMenuData || JSON.stringify(response.data) !== savedMenuData) {
          setMenuData(response.data);
          // 缓存到本地存储，作为后备
          localStorage.setItem('menu_data', JSON.stringify(response.data));
          console.log('Loaded menu data from API');
        }
      } catch (error) {
        console.error('Error fetching menu data:', error);
        // 失败时使用本地存储的缓存数据
        const savedMenuData = localStorage.getItem('menu_data');
        if (savedMenuData) {
          setMenuData(JSON.parse(savedMenuData));
          console.log('Loaded menu data from localStorage (fallback)');
        } else {
          // 最后使用默认数据
          const defaultMenuData = [
            { id: 1, name: 'Kung Pao Chicken', category: 'Mains', price: 38, desc: 'Classic Sichuan dish — tender chicken with crunchy peanuts', image: 'https://images.unsplash.com/photo-1604908176997-1251884b08a5?auto=format&fit=crop&w=800&q=80', tags: ['Spicy', 'Sichuan', 'Chicken', 'Hearty'], sales: 186 },
            { id: 2, name: 'Mapo Tofu', category: 'Mains', price: 28, desc: 'Silky tofu with spicy minced meat — perfect with rice', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80', tags: ['Spicy', 'Sichuan', 'Tofu', 'Vegetarian'], sales: 152 }
          ];
          setMenuData(defaultMenuData);
          localStorage.setItem('menu_data', JSON.stringify(defaultMenuData));
          console.log('Loaded menu data from default (fallback)');
        }
      }
    };

    fetchMenuData();
  }, []);

  const categories = ['all', 'Mains', 'Sides', 'Drinks', 'Desserts'];

  const filteredMenu = selectedCategory === 'all' ? menuData : menuData.filter(item => item.category === selectedCategory);

  const addToCart = (item) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(i => i.id === item.id);
      if (existingItem) {
        return prevCart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const changeQuantity = (itemId, delta) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === itemId) {
          const newQuantity = item.quantity + delta;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      });
    });
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  // 客户端缓存
  const [cache, setCache] = useState(new Map());

  // 搜索函数
  const handleSearch = useCallback(async () => {
    if (!searchQuery) {
      setShowSuggestions(false);
      setIsAiThinking(false);
      setIsSwitchingSearch(false);
      return;
    }

    // 为不同搜索模式使用不同的缓存键
    const cacheKey = `${isAiSearch ? 'ai:' : 'regular:'}${searchQuery}`;

    // 检查缓存
    if (cache.has(cacheKey)) {
      setAiSuggestions(cache.get(cacheKey));
      setShowSuggestions(true);
      setIsAiThinking(false);
      setIsSwitchingSearch(false);
      return;
    }

    try {
      if (isAiSearch) {
        // 开始AI思考
        setIsAiThinking(true);
        setIsSwitchingSearch(false);
        setShowSuggestions(false); // 先隐藏推荐，避免闪烁
        
        // 调用后端推荐API - AI模式
        const response = await axios.get('/api/recommendations/recommend', {
          params: { query: searchQuery, mode: 'ai' }
        });
        
        const suggestions = response.data.suggestions;
        // 缓存结果
        setCache(prevCache => {
          const newCache = new Map(prevCache);
          newCache.set(cacheKey, suggestions);
          // 限制缓存大小
          if (newCache.size > 50) {
            const firstKey = newCache.keys().next().value;
            newCache.delete(firstKey);
          }
          return newCache;
        });
        
        setAiSuggestions(suggestions);
        setShowSuggestions(true);
        setIsAiThinking(false);
        setIsSwitchingSearch(false);
      } else {
        // 使用自然语言搜索
        setIsAiThinking(false);
        setIsSwitchingSearch(false);
        setShowSuggestions(false); // 先隐藏推荐，避免闪烁
        
        // 本地搜索
        const query = searchQuery.toLowerCase();
        const suggestions = menuData
          .filter(item => 
            item.name.toLowerCase().includes(query) || 
            item.desc.toLowerCase().includes(query) || 
            item.tags.some(tag => tag.toLowerCase().includes(query))
          )
          .slice(0, 6)
          .map(item => ({ item, reason: 'Match found' }));

        // 缓存本地结果
        setCache(prevCache => {
          const newCache = new Map(prevCache);
          newCache.set(cacheKey, suggestions);
          if (newCache.size > 50) {
            const firstKey = newCache.keys().next().value;
            newCache.delete(firstKey);
          }
          return newCache;
        });

        setAiSuggestions(suggestions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      // 切换到自然语言搜索
      setIsSwitchingSearch(true);
      setIsAiThinking(false);
      setShowSuggestions(false); // 先隐藏推荐，避免闪烁
      
      // 失败时使用本地模拟数据
      const query = searchQuery.toLowerCase();
      const suggestions = menuData
        .filter(item => 
          item.name.toLowerCase().includes(query) || 
          item.desc.toLowerCase().includes(query) || 
          item.tags.some(tag => tag.toLowerCase().includes(query))
        )
        .slice(0, 6)
        .map(item => ({ item, reason: 'Match found' }));

      // 缓存本地结果
      setCache(prevCache => {
        const newCache = new Map(prevCache);
        newCache.set(cacheKey, suggestions);
        if (newCache.size > 50) {
          const firstKey = newCache.keys().next().value;
          newCache.delete(firstKey);
        }
        return newCache;
      });

      setAiSuggestions(suggestions);
      setShowSuggestions(true);
      setIsSwitchingSearch(false);
    }
  }, [searchQuery, menuData, cache, isAiSearch]);

  // 监听搜索输入变化，实时触发推荐
  useEffect(() => {
    // 防抖处理
    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 300);

    // 清除定时器
    return () => clearTimeout(timeoutId);
  }, [searchQuery, handleSearch]);

  const selectSuggestion = (item) => {
    addToCart(item);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const handleCheckout = async () => {
    if (!currentUser) {
      alert('Please login first');
      return;
    }

    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }

    try {
      const items = cart.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }));

      const response = await axios.post('/api/orders', { items }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('smartorder_token')}`
        }
      });

      alert(`Order ${response.data.order_no} placed successfully!`);
      setCart([]);
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Checkout failed, please try again');
    }
  };

  return (
    <div className="main-content">
      {/* 菜单区域 */}
      <div className="menu-section">
        <div className="menu-header">
          <div>
            <h2>Menu</h2>
            <p className="menu-subtitle">Explore our seasonal offerings and chef's specials</p>
          </div>
        </div>

        <div className="search-container">
          <input
            type="text"
            id="searchInput"
            placeholder="Search dishes or describe your cravings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <div className="search-mode-buttons">
            <button 
              className={`search-mode-btn ai-search-btn ${isAiSearch ? 'active' : ''}`}
              onClick={() => {
                setIsAiSearch(true);
                handleSearch();
              }}
            >
              AI Search
            </button>
            <button 
              className={`search-mode-btn regular-search-btn ${!isAiSearch ? 'active' : ''}`}
              onClick={() => {
                setIsAiSearch(false);
                handleSearch();
              }}
            >
              Regular Search
            </button>
          </div>
          
          {isAiThinking && (
            <div className="ai-progress-container">
              <div className="ai-progress-bar"></div>
            </div>
          )}
          
          {isSwitchingSearch && (
            <div className="ai-switching">
              正在切换智能搜索方式...
            </div>
          )}
          
          {showSuggestions && (
            <div className="ai-suggestions show">
              <div className="suggestions-header">
                {isAiSearch ? 'AI Recommendations' : 'Search Results'} (for "{searchQuery}")
              </div>
              {aiSuggestions.length > 0 ? (
                aiSuggestions.map(({ item, reason }) => (
                  <div key={item.id} className="suggestion-item" onClick={() => selectSuggestion(item)}>
                    <div className="suggestion-content">
                      <div className="suggestion-name-price">
                        <h4>{item.name}</h4>
                        <p className="suggestion-price">¥{item.price.toFixed(2)}</p>
                      </div>
                      <p className="suggestion-reason">💡 {reason}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p>No matching dishes found. Try searching with different keywords!</p>
              )}
            </div>
          )}
        </div>

        <div className="category-tabs">
          {categories.map(category => (
            <button
              key={category}
              className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'all' ? 'All' : category}
            </button>
          ))}
        </div>

        <div className="menu-grid">
          {filteredMenu.map(item => (
            <div key={item.id} className="menu-item">
              <div className="menu-item-image">
                {item.image ? (
                  <img src={item.image} alt={item.name} onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#f3f4f6;color:#9ca3af;font-size:48px;">🍽️</div>'; }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', color: '#9ca3af', fontSize: '48px' }}>🍽️</div>
                )}
              </div>
              <div className="menu-item-name">{item.name}</div>
              <div className="menu-item-desc">{item.desc}</div>
              <div className="menu-item-tags">
                {item.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="menu-tag">{tag}</span>
                ))}
              </div>
              <div className="menu-item-footer">
                <div>
                  <span className="menu-item-price">¥{item.price.toFixed(2)}</span>
                  <span className="menu-item-sales">{item.sales} sold/mo</span>
                </div>
                <button className="add-to-cart-btn" onClick={() => addToCart(item)}>Add to Cart</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 购物车区域 */}
      <div className="cart-section">
        <h2>Cart</h2>
        <div id="cartItems" className="cart-items">
          {cart.length === 0 ? (
            <p className="empty-cart">Your cart is empty</p>
          ) : (
            cart.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">¥{item.price.toFixed(2)} × {item.quantity}</div>
                </div>
                <div className="cart-item-controls">
                  <button className="quantity-btn" onClick={() => changeQuantity(item.id, -1)}>−</button>
                  <span className="quantity">{item.quantity}</span>
                  <button className="quantity-btn" onClick={() => changeQuantity(item.id, 1)}>+</button>
                  <button className="remove-btn" onClick={() => removeFromCart(item.id)}>Remove</button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="cart-summary">
          <div className="total">
            <span>Total:</span>
            <span id="totalPrice">¥{getTotal().toFixed(2)}</span>
          </div>
          <button 
            id="checkoutBtn" 
            className="checkout-btn" 
            onClick={handleCheckout}
            disabled={cart.length === 0}
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Order;