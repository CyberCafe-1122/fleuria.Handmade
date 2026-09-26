import React, { useState } from 'react';

export default function DeleteModal({
  isOpen,
  onClose,
  product,
  onConfirm
}) {
  const [deleting, setDeleting] = useState(false);

  if (!isOpen || !product) return null;

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await onConfirm(product.id);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ color: 'var(--color-danger)' }}>Delete Product</h3>
          <button className="btn-close-modal" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <p style={{ color: 'var(--color-text-main)', fontSize: '0.95rem', marginBottom: '1rem', lineHeight: '1.5' }}>
            Are you sure you want to permanently delete <strong>{product.name}</strong> from the store catalog?
          </p>
          <div style={{
            background: 'var(--color-danger-bg)',
            border: '1px solid var(--color-danger)',
            color: 'var(--color-danger)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem'
          }}>
            ⚠️ This action cannot be undone. The product will be removed from both the admin dashboard and public storefront catalog immediately.
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-outline" onClick={onClose} disabled={deleting}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            style={{ background: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Yes, Delete Product'}
          </button>
        </div>
      </div>
    </div>
  );
}
