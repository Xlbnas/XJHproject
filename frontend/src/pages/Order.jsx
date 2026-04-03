import React, { useState, useEffect, useRef } from 'react';
import '../index.css';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Order = () => {
  const [menuData, setMenuData] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMenu, setFilteredMenu] = useState([]);
  const [isAiSearch, setIsAiSearch] = useState(true);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isSwitchingSearch, setIsSwitchingSearch] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const searchTimeoutRef = useRef(null);
  const cache = useRef(new Map());
  const { user } = useAuth();

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      // 使用相对路径
      const response = await axios.get('/api/menu');
      setMenuData(response.data);
      setFilteredMenu(response.data);
    } catch (error) {
      console.error('Failed to load menu:', error);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredMenu(menuData);
      setShowSuggestions(false);
      return;
    }

    const cacheKey = `${isAiSearch ? 'ai' : 'regular'}:${query}`;
    
    if (cache.current.has(cacheKey)) {
      const cachedSuggestions = cache.current.get(cacheKey);
      setSuggestions(cachedSuggestions);
      setShowSuggestions(true);
      return;
    }

    if (isAiSearch) {
      try {
        // 开始AI思考
        setIsAiThinking(true);
        setIsSwitchingSearch(false);
        setShowSuggestions(false); // 先隐藏推荐，避免闪烁
        
        // 调用后端推荐API - AI模式
        // 使用相对路径
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
        setSuggestions(suggestions);
        setShowSuggestions(true);
        
        // 过滤菜单显示推荐结果
        if (suggestions.length > 0) {
          const suggestionIds = new Set(suggestions.map(item => item.item.id));
          const filtered = menuData.filter(item => suggestionIds.has(item.id));
          setFilteredMenu(filtered);
        } else {
          setFilteredMenu(menuData);
        }
      } catch (error) {
        console.error('AI search failed:', error);
        setShowSuggestions(false);
        // 搜索失败时回退到原始菜单
        setFilteredMenu(menuData);
      } finally {
        setIsAiThinking(false);
      }
    } else {
      // 常规搜索 - 本地匹配
      const queryLower = query.toLowerCase();
      const filtered = menuData.filter(item => {
        return (
          item.name.toLowerCase().includes(queryLower) ||
          item.desc.toLowerCase().includes(queryLower) ||
          item.tags.some(tag => tag.toLowerCase().includes(queryLower))
        );
      });
      setFilteredMenu(filtered);
      setShowSuggestions(false);
    }
  };

  const handleSearchInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // 防抖处理
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(query);
    }, 300);
  };

  const handleSearchModeChange = (mode) => {
    setIsSwitchingSearch(true);
    setIsAiSearch(mode === 'ai');
    setShowSuggestions(false);
    
    // 延迟执行搜索，让用户看到模式切换的视觉效果
    setTimeout(() => {
      handleSearch(searchQuery);
      setIsSwitchingSearch(false);
    }, 500);
  };

  const handleAddToCart = (item) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem => 
          cartItem.id === item.id 
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  const handleRemoveFromCart = (itemId) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === itemId);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(cartItem => 
          cartItem.id === itemId 
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
      } else {
        return prevCart.filter(cartItem => cartItem.id !== itemId);
      }
    });
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    
    try {
      // 使用相对路径
      const response = await axios.post('/api/orders', { items: cart }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('Order placed:', response.data);
      setCart([]);
      alert('Order placed successfully!');
    } catch (error) {
      console.error('Failed to place order:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <div className="order-container">
      <div className="order-header">
        <h1>Order Food</h1>
        <div className="search-container">
          <div className="search-mode-buttons">
            <button 
              className={`search-mode-button ${isAiSearch ? 'active' : ''} ${isSwitchingSearch ? 'switching' : ''}`}
              onClick={() => handleSearchModeChange('ai')}
              disabled={isSwitchingSearch}
            >
              <span className="search-icon">🚀</span>
              AI Search
            </button>
            <button 
              className={`search-mode-button ${!isAiSearch ? 'active' : ''} ${isSwitchingSearch ? 'switching' : ''}`}
              onClick={() => handleSearchModeChange('regular')}
              disabled={isSwitchingSearch}
            >
              <span className="search-icon">🔍</span>
              Regular Search
            </button>
          </div>
          <div className="search-input-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder={`${isAiSearch ? 'Ask AI for food...' : 'Search for food...'}`}
              value={searchQuery}
              onChange={handleSearchInputChange}
            />
            {isAiThinking && (
              <div className="ai-thinking">
                <span className="ai-thinking-dot"></span>
                <span className="ai-thinking-dot"></span>
                <span className="ai-thinking-dot"></span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 搜索建议 */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="search-suggestions">
          <h3>AI Suggestions:</h3>
          <div className="suggestions-list">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="suggestion-item">
                <div className="suggestion-reason">{suggestion.reason}</div>
                <div className="suggestion-name">{suggestion.item.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="order-content">
        <div className="menu-section">
          <h2>Menu</h2>
          <div className="menu-grid">
            {filteredMenu.map(item => (
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
                <div className="menu-item-description">{item.desc}</div>
                <div className="menu-item-tags">
                  {item.tags.map((tag, index) => (
                    <span key={index} className="menu-item-tag">{tag}</span>
                  ))}
                </div>
                <div className="menu-item-price">¥{item.price.toFixed(2)}</div>
                <div className="menu-item-sales">{item.sales} sold/mo</div>
                <button 
                  className="add-to-cart-button" 
                  onClick={() => handleAddToCart(item)}
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="cart-section">
          <h2>Your Cart</h2>
          {cart.length === 0 ? (
            <div className="empty-cart">
              <p>Your cart is empty</p>
            </div>
          ) : (
            <>
              {cart.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-info">
                    <div className="cart-item-name">{item.name}</div>
                    <div className="cart-item-price">¥{item.price.toFixed(2)}</div>
                  </div>
                  <div className="cart-item-quantity">
                    <button 
                      className="quantity-button minus" 
                      onClick={() => handleRemoveFromCart(item.id)}
                    >
                      -
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button 
                      className="quantity-button plus" 
                      onClick={() => handleAddToCart(item)}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
              <div className="cart-total">
                <div className="total-label">Total:</div>
                <div className="total-price">¥{getTotalPrice().toFixed(2)}</div>
              </div>
              <button 
                className="place-order-button" 
                onClick={handlePlaceOrder}
                disabled={!user}
              >
                {user ? 'Place Order' : 'Login to Order'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Order;
