/**
 * ============================================
 * E8 — Portal Delete Confirmation Modal
 * ============================================
 * 
 * WHAT: Modal xác nhận xoá sản phẩm
 * 
 * WHY: Tránh clipping + UX chuẩn enterprise
 * 
 * HOW: ReactDOM.createPortal(modal, modalRoot)
 */

import React, { useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';

// ============================================
// TYPE DEFINITIONS
// ============================================

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  itemName?: string;
  loading?: boolean;
}

// ============================================
// DELETE CONFIRMATION MODAL
// ============================================

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Delete',
  itemName = 'this item',
  loading = false,
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, loading]);

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

  const modalContent = (
    <div
      className="modal-overlay"
      onClick={loading ? undefined : onClose}
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
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '0',
          width: '90%',
          maxWidth: '400px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '15px 20px',
            borderBottom: '1px solid #eee',
            background: '#fff5f5',
          }}
        >
          <span style={{ fontSize: '24px', marginRight: '10px' }}>⚠️</span>
          <h3 id="modal-title" style={{ margin: 0, color: '#dc3545' }}>
            {title}
          </h3>
        </div>

        {/* Body */}
        <div style={{ padding: '20px' }}>
          <p style={{ marginBottom: '15px' }}>
            Are you sure you want to delete <strong>{itemName}</strong>?
          </p>
          <p style={{ color: '#666', fontSize: '14px' }}>
            This action cannot be undone. All data associated with this item will be permanently removed.
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            padding: '15px 20px',
            borderTop: '1px solid #eee',
            background: '#f8f9fa',
          }}
        >
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={loading}
            style={{ minWidth: '100px' }}
          >
            {loading ? (
              <>
                <span className="loading-spinner" style={{ marginRight: '8px' }}></span>
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // Create portal to modal-root or body
  const modalRoot = document.getElementById('modal-root') || document.body;
  return createPortal(modalContent, modalRoot);
};

// ============================================
// GENERIC CONFIRMATION MODAL
// ============================================

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  loading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  loading = false,
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, loading]);

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

  const variantConfig = {
    danger: { color: '#dc3545', icon: '⚠️', bg: '#fff5f5' },
    warning: { color: '#ffc107', icon: '⚡', bg: '#fff8e1' },
    info: { color: '#0066cc', icon: 'ℹ️', bg: '#e8f4ff' },
    success: { color: '#28a745', icon: '✓', bg: '#e8f5e9' },
  };

  const config = variantConfig[variant];

  const modalContent = (
    <div
      className="modal-overlay"
      onClick={loading ? undefined : onClose}
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
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          width: '90%',
          maxWidth: '450px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '15px 20px',
            borderBottom: '1px solid #eee',
            background: config.bg,
          }}
        >
          <span style={{ fontSize: '24px', marginRight: '10px' }}>{config.icon}</span>
          <h3 style={{ margin: 0, color: config.color }}>{title}</h3>
        </div>

        <div style={{ padding: '20px' }}>
          {typeof message === 'string' ? <p>{message}</p> : message}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            padding: '15px 20px',
            borderTop: '1px solid #eee',
          }}
        >
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            {cancelText}
          </button>
          <button
            className="btn"
            onClick={onConfirm}
            disabled={loading}
            style={{ backgroundColor: config.color, color: variant === 'warning' ? '#333' : 'white' }}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  const modalRoot = document.getElementById('modal-root') || document.body;
  return createPortal(modalContent, modalRoot);
};

export default DeleteConfirmModal;
