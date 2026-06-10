import React, { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      // Focus first element logic would go here for robust a11y trap
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/80 backdrop-blur-sm transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        ref={modalRef}
        className="bg-forest-800 border border-forest-400/20 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in"
      >
        <div className="flex items-center justify-between p-6 border-b border-forest-400/10">
          <h2 id="modal-title" className="text-xl font-bold text-cream-100">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-forest-300 hover:text-cream-100 transition-colors p-3 min-w-[48px] min-h-[48px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          {children}
        </div>

        {footer && (
          <div className="p-6 bg-forest-900/50 border-t border-forest-400/10 flex justify-end space-x-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
