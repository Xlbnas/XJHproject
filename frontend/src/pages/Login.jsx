import React, { useState, useContext, useEffect } from 'react';
import AuthContext from '../context/AuthContext';

const Login = () => {
  const { currentUser, login, register, logout } = useContext(AuthContext);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    cuisineTypes: [],
    spiceLevel: 'Any',
    budgetRange: {
      min: '',
      max: ''
    },
    allergens: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isRegistering) {
      if (!phone || !password || !nickname) {
        setError('Please fill in all fields');
        return;
      }
      const result = await register(phone, password, nickname);
      if (!result.success) {
        setError(result.message);
      }
    } else {
      if (!phone || !password) {
        setError('Please fill in all fields');
        return;
      }
      const result = await login(phone, password);
      if (!result.success) {
        setError(result.message);
      }
    }
  };

  // 加载偏好设置
  useEffect(() => {
    const savedPreferences = localStorage.getItem('user_preferences');
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  const handleSavePreferences = () => {
    // 获取用户偏好设置
    const cuisineTypes = [];
    document.querySelectorAll('.pref-cuisine-checkbox:checked').forEach(checkbox => {
      cuisineTypes.push(checkbox.value);
    });
    
    const spiceLevel = document.getElementById('prefSpice').value;
    const budgetMin = document.getElementById('prefBudgetMin').value;
    const budgetMax = document.getElementById('prefBudgetMax').value;
    const allergens = document.getElementById('prefAllergens').value;
    
    // 构建偏好设置对象
    const newPreferences = {
      cuisineTypes,
      spiceLevel,
      budgetRange: {
        min: budgetMin,
        max: budgetMax
      },
      allergens
    };
    
    // 保存到localStorage
    localStorage.setItem('user_preferences', JSON.stringify(newPreferences));
    
    // 更新状态
    setPreferences(newPreferences);
    
    // 切换到显示模式
    setIsEditingPreferences(false);
    
    // 显示保存成功提示
    alert('Preferences saved successfully!');
  };

  return (
    <div>
      {currentUser ? (
        <div className="profile-section">
          <div className="profile-card">
            <div className="profile-avatar">
              {currentUser.nickname ? currentUser.nickname[0].toUpperCase() : 'U'}
            </div>
            <div className="profile-info">
              <h2>{currentUser.nickname}</h2>
              <p>Phone: {currentUser.phone}</p>
              <p>Joined: {new Date(currentUser.created_at).toLocaleDateString()}</p>
            </div>
            <div className="profile-actions">
              <button className="primary-btn" onClick={logout}>Logout</button>
            </div>
          </div>
          <div className="preference-card">
            <h3>My Preferences</h3>
            <p className="pref-subtitle">Customize your ordering experience</p>
            
            {isEditingPreferences ? (
              <>
                <div className="pref-group">
                  <label className="pref-label">Cuisine Types</label>
                  <div className="pref-checkbox-grid">
                    <label><input type="checkbox" className="pref-cuisine-checkbox" value="Sichuan" defaultChecked={preferences.cuisineTypes.includes('Sichuan')} /> Sichuan</label>
                    <label><input type="checkbox" className="pref-cuisine-checkbox" value="Jiangnan" defaultChecked={preferences.cuisineTypes.includes('Jiangnan')} /> Jiangnan</label>
                    <label><input type="checkbox" className="pref-cuisine-checkbox" value="Korean" defaultChecked={preferences.cuisineTypes.includes('Korean')} /> Korean</label>
                    <label><input type="checkbox" className="pref-cuisine-checkbox" value="Healthy" defaultChecked={preferences.cuisineTypes.includes('Healthy')} /> Healthy</label>
                  </div>
                </div>
                <div className="pref-group">
                  <label className="pref-label">Spice Level</label>
                  <select id="prefSpice" className="pref-select" defaultValue={preferences.spiceLevel}>
                    <option value="Any">Any</option>
                    <option value="Non-spicy">Non-spicy</option>
                    <option value="Mild">Mild</option>
                    <option value="Spicy">Spicy</option>
                  </select>
                </div>
                <div className="pref-group">
                  <label className="pref-label">Budget Range</label>
                  <div className="pref-budget-row">
                    <input type="number" id="prefBudgetMin" className="pref-input" placeholder="Min" defaultValue={preferences.budgetRange.min} />
                    <span>to</span>
                    <input type="number" id="prefBudgetMax" className="pref-input" placeholder="Max" defaultValue={preferences.budgetRange.max} />
                  </div>
                </div>
                <div className="pref-group">
                  <label className="pref-label">Allergens</label>
                  <input type="text" id="prefAllergens" className="pref-input-wide" placeholder="e.g. peanuts, gluten" defaultValue={preferences.allergens} />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                  <button className="primary-btn" onClick={handleSavePreferences}>Save Preferences</button>
                  <button className="secondary-btn" onClick={() => setIsEditingPreferences(false)}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                <div className="pref-group">
                  <label className="pref-label">Cuisine Types</label>
                  <div className="pref-display-value">
                    {preferences.cuisineTypes.length > 0 ? preferences.cuisineTypes.join(', ') : 'None'}
                  </div>
                </div>
                <div className="pref-group">
                  <label className="pref-label">Spice Level</label>
                  <div className="pref-display-value">{preferences.spiceLevel}</div>
                </div>
                <div className="pref-group">
                  <label className="pref-label">Budget Range</label>
                  <div className="pref-display-value">
                    {preferences.budgetRange.min && preferences.budgetRange.max 
                      ? `¥${preferences.budgetRange.min} to ¥${preferences.budgetRange.max}` 
                      : 'Not set'}
                  </div>
                </div>
                <div className="pref-group">
                  <label className="pref-label">Allergens</label>
                  <div className="pref-display-value">
                    {preferences.allergens || 'None'}
                  </div>
                </div>
                <button className="primary-btn" style={{ marginTop: '16px' }} onClick={() => setIsEditingPreferences(true)}>Edit Preferences</button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="auth-section">
          <div className="auth-card">
            <h2>{isRegistering ? 'Register' : 'Login'}</h2>
            <p className="auth-subtitle">{isRegistering ? 'Create a new account' : 'Welcome back'}</p>
            {error && <div className="auth-tip" style={{ color: 'red' }}>{error}</div>}
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="loginPhone">Phone</label>
                <input
                  type="tel"
                  id="loginPhone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>
              {isRegistering && (
                <div className="form-group">
                  <label htmlFor="nickname">Nickname</label>
                  <input
                    type="text"
                    id="nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Enter your nickname"
                  />
                </div>
              )}
              <div className="form-group">
                <label htmlFor="loginPassword">Password</label>
                <input
                  type="password"
                  id="loginPassword"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </div>
              <div className="form-row">
                <div className="remember-me">
                  <input type="checkbox" id="rememberMe" />
                  <label htmlFor="rememberMe">Remember me</label>
                </div>
                <button type="button" className="link-btn" onClick={() => setIsRegistering(!isRegistering)}>
                  {isRegistering ? 'Already have an account? Login' : 'Don\'t have an account? Register'}
                </button>
              </div>
              <button type="submit" className="primary-btn" style={{ width: '100%', marginTop: '16px' }}>
                {isRegistering ? 'Register' : 'Login'}
              </button>
            </form>
          </div>
          <div className="auth-benefits">
            <h3>Why join us?</h3>
            <ul>
              <li>🚀 Fast and secure checkout</li>
              <li>📱 Real-time order tracking</li>
              <li>🎁 Exclusive promotions</li>
              <li>⭐ Earn rewards with every order</li>
              <li>💬 Personalized recommendations</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;