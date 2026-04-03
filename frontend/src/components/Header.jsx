import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/order', label: 'Order' },
    { path: '/orders', label: 'My Orders' },
    { path: '/login', label: user ? (user.nickname || 'Account') : 'Account' }
  ];

  // 只有管理员才能看到Merchant页面
  if (user && user.phone === 'Xlbnas') {
    navLinks.push({ path: '/merchant', label: 'Merchant' });
  }

  return (
    <header className="header">
      <div className="header-top">
        <div className="brand">
          <div className="brand-logo-real brand-logo-local"></div>
          <div className="brand-text">
            <h1>Maison Lumière</h1>
            <p>Modern Bistro · Seasonal Menu · AI‑Powered Ordering</p>
          </div>
        </div>
        <nav className="main-nav">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${currentPath === link.path ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
