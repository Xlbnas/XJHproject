import React, { useEffect, useState } from 'react';

const Home = () => {
  const [menuData, setMenuData] = useState([]);

  useEffect(() => {
    // 模拟菜单数据
    const mockMenuData = [
      { id: 1, name: 'Kung Pao Chicken', price: 38, sales: 186, image: 'https://images.unsplash.com/photo-1604908176997-1251884b08a5?auto=format&fit=crop&w=800&q=80' },
      { id: 2, name: 'Mapo Tofu', price: 28, sales: 152, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80' },
      { id: 3, name: 'Sweet & Sour Pork', price: 42, sales: 134, image: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=800&q=80' },
      { id: 4, name: 'Braised Pork Belly', price: 48, sales: 167, image: 'https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?auto=format&fit=crop&w=800&q=80' },
      { id: 5, name: 'Steamed Sea Bass', price: 58, sales: 98, image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=80' },
      { id: 6, name: 'Garlic Broccoli', price: 22, sales: 121, image: 'https://images.unsplash.com/photo-1505575967455-40e256f73376?auto=format&fit=crop&w=800&q=80' }
    ];
    setMenuData(mockMenuData);
  }, []);

  return (
    <div>
      {/* 1. Restaurant hero: big cover + brief intro + booking / order entry */}
      <section className="restaurant-hero">
        <div className="restaurant-hero-image">
          <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80" alt="Maison Lumière main dining room" />
        </div>
        <div className="restaurant-hero-info">
          <h2>Contemporary Bistro in the Heart of the City</h2>
          <p className="restaurant-hero-desc">
            Maison Lumière focuses on seasonal ingredients, refined techniques and a relaxed dining room.
            Our online ordering is tailored for this single restaurant, with AI helping you choose dishes
            that fit your taste and budget.
          </p>
          <div className="restaurant-meta-row">
            <div className="restaurant-meta-item">
              <span className="meta-label">Cuisine</span>
              <span className="meta-value">Modern European · Seasonal</span>
            </div>
            <div className="restaurant-meta-item">
              <span className="meta-label">Service Hours</span>
              <span className="meta-value">Mon–Sun 11:30–14:30 · 17:30–22:00</span>
            </div>
            <div className="restaurant-meta-item">
              <span className="meta-label">Rating</span>
              <span className="meta-value">4.9 · Chef’s picks</span>
            </div>
          </div>
          <div className="home-hero-actions">
            <a href="/order" className="primary-btn">Order Takeout</a>
            <a href="#signature" className="secondary-btn">View Signature Dishes</a>
          </div>
        </div>
      </section>

      {/* 2. Signature dishes (single-restaurant focus, layout inspired by Michelin-style cards) */}
      <section id="signature" className="signature-section">
        <header className="section-header-wide">
          <h2>Signature Dishes</h2>
          <p>Each plate is designed by our chef team, balancing texture, temperature and flavor.</p>
        </header>
        <div className="signature-grid">
          <article className="signature-card">
            <div className="signature-image-wrap">
              <img src="https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?auto=format&fit=crop&w=800&q=80" alt="Slow-braised beef with red wine jus" />
            </div>
            <div className="signature-body">
              <h3>Slow-Braised Beef · Red Wine Jus</h3>
              <p>A 48‑hour braise with layered aromatics, served with root vegetables and a glossy jus.</p>
              <div className="signature-meta">
                <span>Recommended with: Red wine, roasted potatoes</span>
              </div>
            </div>
          </article>
          <article className="signature-card">
            <div className="signature-image-wrap">
              <img src="https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=80" alt="Pan-seared sea bass with citrus fennel salad" />
            </div>
            <div className="signature-body">
              <h3>Pan-Seared Sea Bass · Citrus Fennel</h3>
              <p>Crispy skin sea bass over a light citrus fennel salad, highlighting clean ocean flavors.</p>
              <div className="signature-meta">
                <span>Light & refreshing · Perfect for lunch</span>
              </div>
            </div>
          </article>
          <article className="signature-card">
            <div className="signature-image-wrap">
              <img src="https://images.unsplash.com/photo-1505575967455-40e256f73376?auto=format&fit=crop&w=800&q=80" alt="Seasonal vegetable tart with herb emulsion" />
            </div>
            <div className="signature-body">
              <h3>Seasonal Vegetable Tart · Herb Emulsion</h3>
              <p>A crisp tart shell filled with roasted seasonal vegetables and a bright herb emulsion.</p>
              <div className="signature-meta">
                <span>Vegetarian friendly · Pairs well with white wine</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* 3. Chef & space: simple two-column layout, not crowded */}
      <section className="story-section">
        <div className="story-text">
          <h2>The Kitchen Behind the Plate</h2>
          <p>
            Our chef team draws inspiration from both classic French bistros and modern Nordic cuisine.
            The online smart ordering system is built only for Maison Lumière, so every recommendation
            comes from our own menu and past guests’ favorites.
          </p>
          <p>
            Describe your cravings in natural language, and AI will suggest a balanced set of dishes –
            from appetizers to dessert – that match your mood for the day.
          </p>
        </div>
        <div className="story-gallery">
          <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80" alt="Dining room detail" />
          <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80" alt="Open kitchen pass" />
        </div>
      </section>

      {/* 4. Hot dishes from actual menu data (JS-driven, ready for future DB/API) */}
      <section className="home-recommend">
        <h3>Popular Online Orders</h3>
        <div id="homeRecommendGrid" className="home-recommend-grid">
          {menuData.map(item => (
            <div key={item.id} className="home-recommend-card" onClick={() => window.location.href='/order'}>
              <div className="home-recommend-thumb"><img src={item.image} alt={item.name}></img></div>
              <div>
                <div className="home-recommend-info-title">{item.name}</div>
                <div className="home-recommend-info-meta">¥{item.price.toFixed(2)} · {item.sales} sold/mo</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Simple footer */}
      <footer className="home-footer">
        <div className="footer-left">
          <div className="footer-brand">Maison Lumière · Smart Ordering</div>
          <p>Single-restaurant online ordering experience, ready for future database and deployment integration.</p>
        </div>
        <div className="footer-links">
          <a href="/order">Order</a>
          <a href="/orders">Orders</a>
          <a href="/merchant">Merchant</a>
          <a href="/login">Account</a>
        </div>
      </footer>
    </div>
  );
};

export default Home;