import React from 'react';
import { LIVE_STORE_URL } from '../api';

export default function OrdersView() {
  return (
    <div className="orders-view">
      <div className="content-panel">
        <div className="orders-placeholder">
          <div className="orders-icon">📦 💬</div>
          <h3>WhatsApp Order Dispatch Engine</h3>
          <p>
            Fleuria Handmade currently captures all customer orders, custom commission briefs, and gift card messages directly through our <strong>WhatsApp Direct Selling Engine</strong>.
          </p>

          <div style={{
            maxWidth: '560px',
            margin: '0 auto 2rem',
            textAlign: 'left',
            background: 'var(--color-cream)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem 1.5rem'
          }}>
            <h4 style={{ color: 'var(--color-forest)', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
              ✨ How Orders Flow Right Now:
            </h4>
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
              <li>Customer selects products & customizes ribbon colors/scents in the slide-over cart drawer.</li>
              <li>Customer fills their name, delivery address, and personal gift note.</li>
              <li>System builds a formatted WhatsApp order string and connects directly to the artisan's WhatsApp Business app.</li>
              <li>Order pipeline is ready for direct order management and shipping label printing in upcoming phase.</li>
            </ul>
          </div>

          <a 
            href={`${LIVE_STORE_URL}#catalogSection`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn-primary"
            style={{ display: 'inline-flex' }}
          >
            <span>Preview Cart & Checkout on Storefront →</span>
          </a>
        </div>
      </div>
    </div>
  );
}
