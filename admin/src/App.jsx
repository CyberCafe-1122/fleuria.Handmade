import React, { useState, useEffect, useCallback } from 'react';
import './Admin.css';
import { api, getAuthToken, getStoredUser, setAuthToken, setStoredUser } from './api';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import DashboardView from './components/DashboardView';
import ProductsView from './components/ProductsView';
import OrdersView from './components/OrdersView';
import AddProductView from './components/AddProductView';
import ProductModal from './components/ProductModal';
import DeleteModal from './components/DeleteModal';
import LoginView from './components/LoginView';

export default function App() {
  const [token, setToken] = useState(() => getAuthToken());
  const [user, setUser] = useState(() => getStoredUser());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Data states
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Toasts
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  };

  // Check auth validity on mount
  useEffect(() => {
    if (token) {
      api.getMe()
        .then(res => {
          if (res.user) {
            setUser(res.user);
            setStoredUser(res.user);
          }
        })
        .catch(() => {
          handleLogout();
        });
    }

    const handleUnauthorized = () => {
      handleLogout();
      addToast('Session expired. Please log in again.', 'warning');
    };

    window.addEventListener('fleuria_unauthorized', handleUnauthorized);
    return () => window.removeEventListener('fleuria_unauthorized', handleUnauthorized);
  }, [token]);

  // Load products & stats
  const refreshData = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [prodRes, statsRes] = await Promise.all([
        api.getProducts(),
        api.getStats().catch(() => ({ stats: null }))
      ]);

      if (prodRes.success && Array.isArray(prodRes.products)) {
        setProducts(prodRes.products);
      }
      if (statsRes.success && statsRes.stats) {
        setStats(statsRes.stats);
      }
    } catch (err) {
      console.error('Error refreshing admin data:', err);
      addToast('Failed to sync latest product catalog.', 'error');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      refreshData();
    }
  }, [token, refreshData]);

  // Auth Handlers
  const handleLoginSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    addToast(`Welcome back, ${newUser.username || 'Admin'}! 👋`);
  };

  const handleLogout = () => {
    api.logout();
    setToken(null);
    setUser(null);
    setActiveTab('dashboard');
  };

  // Product Actions
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleSaveProduct = async (payload, id) => {
    if (id) {
      // Edit existing product
      const res = await api.updateProduct(id, payload);
      if (res.success) {
        addToast(`"${payload.name}" updated successfully! ✨`);
        refreshData();
      }
    } else {
      // Create new product
      const res = await api.createProduct(payload);
      if (res.success) {
        addToast(`New product "${payload.name}" added to catalog! 🌸`);
        refreshData();
      }
    }
  };

  const handleOpenDelete = (product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (id) => {
    try {
      const res = await api.deleteProduct(id);
      if (res.success) {
        addToast('Product permanently deleted from catalog.', 'success');
        refreshData();
      }
    } catch (err) {
      addToast(err.message || 'Failed to delete product.', 'error');
    }
  };

  // Quick toggle availability directly from table
  const handleToggleStatus = async (product) => {
    try {
      const newStatus = !product.available;
      const res = await api.updateProduct(product.id, {
        ...product,
        available: newStatus
      });
      if (res.success) {
        addToast(`"${product.name}" marked as ${newStatus ? 'Available' : 'Unavailable'}.`);
        refreshData();
      }
    } catch (err) {
      addToast('Could not update status: ' + err.message, 'error');
    }
  };

  // Handle tab switching
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // If not logged in, show Login view
  if (!token) {
    return (
      <>
        <LoginView onLoginSuccess={handleLoginSuccess} />
        {/* Toast Container */}
        <div className="toast-container">
          {toasts.map(t => (
            <div key={t.id} className={`toast ${t.type}`}>
              <span>{t.type === 'error' ? '❌' : t.type === 'warning' ? '⚠️' : '✅'}</span>
              <span>{t.message}</span>
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        user={user}
        onLogout={handleLogout}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
        productsCount={products.length}
      />

      {/* Main Container */}
      <div className="admin-main">
        {/* Topbar */}
        <Topbar
          activeTab={activeTab}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          storeStatus={stats?.status}
        />

        {/* Dynamic Views */}
        <main className="admin-content">
          {activeTab === 'dashboard' && (
            <DashboardView
              stats={stats}
              products={products}
              onEditProduct={handleOpenEdit}
              onToggleStatus={handleToggleStatus}
              onNavigate={handleTabChange}
            />
          )}

          {activeTab === 'products' && (
            <ProductsView
              products={products}
              onEditProduct={handleOpenEdit}
              onDeleteProduct={handleOpenDelete}
              onToggleStatus={handleToggleStatus}
              onAddProduct={handleOpenAdd}
            />
          )}

          {activeTab === 'add-product' && (
            <AddProductView
              onSave={handleSaveProduct}
              onCancel={() => setActiveTab('products')}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersView />
          )}
        </main>
      </div>

      {/* Add / Edit Product Modal */}
      <ProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        product={editingProduct}
        onSave={handleSaveProduct}
      />

      {/* Delete Product Confirmation Modal */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        product={productToDelete}
        onConfirm={handleConfirmDelete}
      />

      {/* Floating Toast Alerts */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            <span>{t.type === 'error' ? '❌' : t.type === 'warning' ? '⚠️' : '🌸'}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
