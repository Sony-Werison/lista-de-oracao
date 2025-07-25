import React from 'react';
import { XCircleIcon } from './icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-[var(--modal-bg)] rounded-lg shadow-2xl w-full max-w-md p-6 relative animate-fade-in-up border border-[var(--border-color)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">{title}</h2>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" aria-label="Fechar modal">
            <XCircleIcon className="w-6 h-6 sm:w-7 h-7" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;