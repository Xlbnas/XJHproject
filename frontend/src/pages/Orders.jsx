import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import io from 'socket.io-client';

const Orders = () => {
  const { currentUser } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    if (currentUser) {
      fetchOrders();
    }
  }, [currentUser, selectedFilter]);

  useEffect(() => {
    // 初始化WebSocket连接
    const socket = io(window.location.origin);

    // 监听订单状态更新
    socket.on('order:statusUpdated', (data) => {
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.order_no === data.order_no ? { ...order, status: data.status } : order
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`/api/orders${selectedFilter !== 'all' ? `?status=${selectedFilter}` : ''}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('smartorder_token')}`
        }
      });
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const statusLabels = {
    pending: 'Pending',
    preparing: 'Preparing',
    delivering: 'Delivering',
    completed: 'Completed'
  };

  const statusColors = {
    pending: '#f59e0b',
    preparing: '#2563eb',
    delivering: '#10b981',
    completed: '#6b7280'
  };

  const renderOrderTimeline = (status) => {
    const statusSteps = ['pending', 'preparing', 'delivering', 'completed'];
    const currentStepIdx = statusSteps.indexOf(status);

    return (
      <div className="order-timeline">
        {statusSteps.map((step, idx) => {
          const done = idx <= currentStepIdx ? 'done' : '';
          const active = idx === currentStepIdx ? 'active' : '';
          return (
            <>
              <div className={`timeline-step ${done} ${active}`}>
                <div className="timeline-dot"></div>
                <span>{statusLabels[step]}</span>
              </div>
              {idx < statusSteps.length - 1 && (
                <div className={`timeline-line ${idx < currentStepIdx ? 'done' : ''}`}></div>
              )}
            </>
          );
        })}
      </div>
    );
  };

  const handleRateOrder = (orderId) => {
    // 这里可以实现评价功能
    console.log('Rate order:', orderId);
  };

  const handleReorder = (order) => {
    // 这里可以实现重新下单功能
    console.log('Reorder:', order);
  };

  return (
    <div>
      <div className="orders-page-header">
        <div>
          <h2>My Orders</h2>
          <p className="orders-subtitle">Track your order status and history</p>
        </div>
      </div>

      <div className="orders-tabs">
        {['all', 'pending', 'preparing', 'delivering', 'completed'].map(filter => (
          <button
            key={filter}
            className={`orders-tab ${selectedFilter === filter ? 'active' : ''}`}
            onClick={() => setSelectedFilter(filter)}
          >
            {filter === 'all' ? 'All' : statusLabels[filter]}
          </button>
        ))}
      </div>

      <div className="orders-list">
        {orders.length === 0 ? (
          <div className="orders-empty">
            <p>No orders found</p>
            <a href="/order" className="primary-btn">Start Ordering</a>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.order_no} className="order-card">
              <div className="order-card-header">
                <div>
                  <span className="order-id">{order.order_no}</span>
                  <span className="order-date">{new Date(order.created_at).toLocaleString()}</span>
                </div>
                <span 
                  className="order-status-badge" 
                  style={{ backgroundColor: statusColors[order.status] }}
                >
                  {statusLabels[order.status]}
                </span>
              </div>
              <div className="order-restaurant-name">🏪 {order.restaurant}</div>
              <div className="order-card-items">
                {/* 这里可以从order_items表中获取订单商品信息 */}
                <div className="order-item-row">
                  <span className="order-item-name">{order.order_no} items</span>
                  <span className="order-item-price">¥{order.total_price.toFixed(2)}</span>
                </div>
              </div>
              {renderOrderTimeline(order.status)}
              <div className="order-card-footer">
                <span className="order-total">Total: <strong>¥{order.total_price.toFixed(2)}</strong></span>
                <div className="order-actions">
                  {order.status === 'completed' && (
                    <>
                      {order.rating > 0 ? (
                        <span className="order-rated">Rated {'★'.repeat(order.rating)}{'☆'.repeat(5 - order.rating)}</span>
                      ) : (
                        <button className="primary-btn btn-sm" onClick={() => handleRateOrder(order.order_no)}>Rate</button>
                      )}
                      <button className="secondary-btn btn-sm" onClick={() => handleReorder(order)}>Reorder</button>
                    </>
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