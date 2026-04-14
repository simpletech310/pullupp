'use client';

import { useEffect, useRef } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function Modal({ open, onClose, children, title, className = '' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className={`
        relative bg-bg-elevated rounded-t-2xl sm:rounded-2xl
        w-full sm:max-w-md max-h-[85dvh] overflow-y-auto
        border border-border animate-slide-up
        ${className}
      `}>
        {title && (
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h3 className="font-display font-bold text-lg">{title}</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-surface-hover transition-colors text-text-muted"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}
        <div className={title ? 'px-5 pb-5' : 'p-5'}>
          {children}
        </div>
      </div>
    </div>
  );
}
