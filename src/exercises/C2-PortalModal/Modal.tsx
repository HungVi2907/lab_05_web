/**
 * ============================================
 * C2 — Portal-based Modal ("Trapdoor")
 * ============================================
 * 
 * WHAT: Render modal ra document.body bằng createPortal
 * 
 * WHY:
 * - Tránh overflow clipping (parent overflow: hidden)
 * - Vẫn giữ event bubbling theo React tree
 * - Z-index management dễ dàng hơn
 * - Tách UI layer khỏi component tree
 * 
 * HOW:
 * - ReactDOM.createPortal(children, document.body)
 * - Modal component với overlay và content
 */

import React, { useState, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';

// ============================================
// MODAL COMPONENT
// ============================================

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'small' | 'medium' | 'large';
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  closeOnOverlayClick = true,
  showCloseButton = true,
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeStyles = {
    small: { maxWidth: '300px' },
    medium: { maxWidth: '500px' },
    large: { maxWidth: '800px' },
  };

  const modalContent = (
    <div
      className="modal-overlay"
      onClick={closeOnOverlayClick ? onClose : undefined}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '0',
          width: '90%',
          ...sizeStyles[size],
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          animation: 'slideIn 0.2s ease-out',
        }}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div
            className="modal-header"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '15px 20px',
              borderBottom: '1px solid #eee',
            }}
          >
            <h3 style={{ margin: 0 }}>{title}</h3>
            {showCloseButton && (
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '0',
                  lineHeight: 1,
                }}
                aria-label="Close modal"
              >
                ×
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="modal-body" style={{ padding: '20px' }}>
          {children}
        </div>
      </div>
    </div>
  );

  // Create portal to modal-root or body
  const modalRoot = document.getElementById('modal-root') || document.body;
  return createPortal(modalContent, modalRoot);
};

// ============================================
// CONFIRMATION MODAL
// ============================================

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
}) => {
  const variantColors = {
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#0066cc',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="small">
      <p style={{ marginBottom: '20px' }}>{message}</p>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button className="btn btn-secondary" onClick={onClose}>
          {cancelText}
        </button>
        <button
          className="btn"
          style={{
            backgroundColor: variantColors[variant],
            color: variant === 'warning' ? '#333' : 'white',
          }}
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};

// ============================================
// DEMO COMPONENT
// ============================================

const PortalModalDemo: React.FC = () => {
  const [isBasicOpen, setIsBasicOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLargeOpen, setIsLargeOpen] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState('');

  return (
    <div className="card">
      <h2 className="section-title">C2: Portal-based Modal</h2>

      {/* Overflow demo container */}
      <div
        style={{
          overflow: 'hidden',
          border: '2px dashed #ccc',
          padding: '20px',
          marginBottom: '20px',
          borderRadius: '8px',
        }}
      >
        <p style={{ color: '#666', marginBottom: '15px' }}>
          ⚠️ This container has <code>overflow: hidden</code>
        </p>
        <p style={{ marginBottom: '15px' }}>
          Without portals, modals would be clipped by this container.
          Click the buttons below - modals render at document.body level!
        </p>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => setIsBasicOpen(true)}>
            Open Basic Modal
          </button>
          <button className="btn btn-danger" onClick={() => setIsConfirmOpen(true)}>
            Open Confirm Modal
          </button>
          <button className="btn btn-secondary" onClick={() => setIsLargeOpen(true)}>
            Open Large Modal
          </button>
        </div>
      </div>

      {/* Status Message */}
      {deleteMessage && (
        <div
          style={{
            padding: '10px 15px',
            background: '#d4edda',
            borderRadius: '4px',
            marginBottom: '20px',
            color: '#155724',
          }}
        >
          {deleteMessage}
        </div>
      )}

      {/* Basic Modal */}
      <Modal
        isOpen={isBasicOpen}
        onClose={() => setIsBasicOpen(false)}
        title="Basic Modal"
        size="medium"
      >
        <p>This is a basic modal using React Portal.</p>
        <p style={{ marginTop: '15px' }}>
          Features:
        </p>
        <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
          <li>Renders at document.body</li>
          <li>Escapes parent overflow constraints</li>
          <li>Close with ESC key</li>
          <li>Close by clicking overlay</li>
          <li>Event bubbling works normally</li>
        </ul>
      </Modal>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => setDeleteMessage('Item deleted successfully!')}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        cancelText="Keep it"
        variant="danger"
      />

      {/* Large Modal */}
      <Modal
        isOpen={isLargeOpen}
        onClose={() => setIsLargeOpen(false)}
        title="Large Modal with Form"
        size="large"
      >
        <form>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label>First Name</label>
              <input type="text" className="input-field" placeholder="John" />
            </div>
            <div>
              <label>Last Name</label>
              <input type="text" className="input-field" placeholder="Doe" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label>Email</label>
              <input type="email" className="input-field" placeholder="john@example.com" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label>Bio</label>
              <textarea
                className="input-field"
                rows={4}
                placeholder="Tell us about yourself..."
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsLargeOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" onClick={(e) => { e.preventDefault(); setIsLargeOpen(false); }}>
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Technical Info */}
      <div style={{ padding: '15px', background: '#e8f4ff', borderRadius: '8px' }}>
        <h4>📝 Portal Benefits:</h4>
        <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
          <li>Escape CSS constraints (overflow, z-index)</li>
          <li>React event bubbling still works</li>
          <li>Context API still accessible</li>
          <li>Clean DOM structure</li>
        </ul>
        <pre style={{ 
          marginTop: '15px',
          background: '#f8f8f8', 
          padding: '10px', 
          borderRadius: '4px', 
          overflow: 'auto',
          fontSize: '13px' 
        }}>
{`import { createPortal } from 'react-dom';

const Modal = ({ children }) => {
  return createPortal(
    <div className="modal">{children}</div>,
    document.body
  );
};`}
        </pre>
      </div>
    </div>
  );
};

export { Modal, ConfirmModal };
export default PortalModalDemo;
