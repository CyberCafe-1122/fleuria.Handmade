import React, { useState } from 'react';
import { api, LIVE_STORE_URL } from '../api';

export default function LoginView({ onLoginSuccess }) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!login.trim() || !password) {
      setError('Please enter both your email/username and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await api.login(login.trim(), password);
      if (res.success && res.token) {
        onLoginSuccess(res.token, res.user);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setLogin('Iness@fleuria.com');
    setPassword('Iness2131');
    setError('');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Brand Header */}
        <div className="login-header">
          <div className="login-logo">🌸</div>
          <h2>Fleuria Handmade</h2>
          <p>Artisan Studio • Admin Portal</p>
        </div>

        {/* 1-Click Demo Fill for Non-Technical Clients */}
        <div className="login-demo-box">
          <div className="login-demo-text">
            <strong>Default Admin:</strong> Iness@fleuria.com / Iness2131
          </div>
          <button 
            type="button" 
            className="btn-fill-demo"
            onClick={handleFillDemo}
          >
            Auto Fill
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert-danger">
            ⚠️ {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Admin Email or Username</label>
            <input
              type="text"
              placeholder="e.g. admin@fleuria.com or admin"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)',
                  fontSize: '0.85rem'
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', padding: '0.8rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <a
            href={LIVE_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '0.82rem',
              color: 'var(--color-sage)',
              textDecoration: 'none',
              fontWeight: 600
            }}
          >
            ← Return to Fleuria Public Storefront
          </a>
        </div>
      </div>
    </div>
  );
}
