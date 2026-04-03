import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../index.css';

const Orders = () => {
  const { user, isLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  // 使用相对路径
  const socket = io('/');
  
  useEffect(() => {
    if (!isLoading && user) {
      loadOrders();
    }
  }, [user, isLoading, selectedFilter]);
  
  useEffect(() => {
    // 监听订单状态更新
    socket.on('order:statusUpdated', (data) => {
      console.log('Order status updated:', data);
      loadOrders();
    });
    
    return () => {
      socket.off('order:statusUpdated');
    };
  }, [user, selectedFilter]);
  
  const loadOrders = async () => {
    try {
      // 使用相对路径
      const response = await axios.get(`/api/orders${selectedFilter !== 'all' ? `?status=${selectedFilter}` : ''}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  };
  
  const handleStatusUpdate = async (orderNo, newStatus) => {
    try {
      // 使用相对路径
      await axios.patch(`/api/orders/${orderNo}/status`, { status: newStatus }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      loadOrders();
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };
  
  const handleSubmitReview = async (orderNo, rating, comment) => {
    try {
      // 使用相对路径
      await axios.post(`/api/orders/${orderNo}/review`, { rating, comment }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      loadOrders();
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'preparing': return '#3b82f6';
      case 'delivering': return '#10b981';
      case 'completed': return '#14b8a6';
      default: return '#6b7280';
    }
  };
  
  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'preparing': return 'Preparing';
      case 'delivering': return 'Delivering';
      case 'completed': return 'Completed';
      default: return status;
    }
  };
  
  const getNextStatus = (status) => {
    const statuses = ['pending', 'preparing', 'delivering', 'completed'];
    const currentIndex = statuses.indexOf(status);
    return currentIndex < statuses.length - 1 ? statuses[currentIndex + 1] : null;
  };

  if (isLoading) {
    return (
      <div className="orders-empty">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="orders-empty">
        <p>Please login to view your orders</p>
        <a href="/login" className="primary-btn">Login</a>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h1>Your Orders</h1>
        <div className="order-filters">
          <button 
            className={selectedFilter === 'all' ? 'active' : ''}
            onClick={() => setSelectedFilter('all')}
          >
            All
          </button>
          <button 
            className={selectedFilter === 'pending' ? 'active' : ''}
            onClick={() => setSelectedFilter('pending')}
          >
            Pending
          </button>
          <button 
            className={selectedFilter === 'preparing' ? 'active' : ''}
            onClick={() => setSelectedFilter('preparing')}
          >
            Preparing
          </button>
          <button 
            className={selectedFilter === 'delivering' ? 'active' : ''}
            onClick={() => setSelectedFilter('delivering')}
          >
            Delivering
          </button>
          <button 
            className={selectedFilter === 'completed' ? 'active' : ''}
            onClick={() => setSelectedFilter('completed')}
          >
            Completed
          </button>
        </div>
      </div>
      
      <div className="orders-list">
        {orders.length === 0 ? (
          <div className="empty-orders">
            <p>No orders found</p>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.order_no} className="order-card">
              <div className="order-header-info">
                <div className="order-number">Order #{order.order_no}</div>
                <div className="order-status" style={{ color: getStatusColor(order.status) }}>
                  {getStatusText(order.status)}
                </div>
              </div>
              
              <div className="order-items">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <div className="order-item-name">{item.name}</div>
                    <div className="order-item-details">
                      ¥{item.price.toFixed(2)} x {item.quantity}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="order-footer">
                <div className="order-total">
                  Total: ¥{order.total_price.toFixed(2)}
                </div>
                <div className="order-actions">
                  {getNextStatus(order.status) && (
                    <button 
                      className="status-button"
                      onClick={() => handleStatusUpdate(order.order_no, getNextStatus(order.status))}
                    >
                      Mark as {getStatusText(getNextStatus(order.status))}
                    </button>
                  )}
                  {order.status === 'completed' && !order.rating && (
                    <button 
                      className="review-button"
                      onClick={() => {
                        const rating = prompt('Rate this order (1-5):');
                        const comment = prompt('Add a comment:');
                        if (rating && parseInt(rating) >= 1 && parseInt(rating) <= 5) {
                          handleSubmitReview(order.order_no, parseInt(rating), comment);
                        }
                      }}
                    >
                      Leave Review
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;
