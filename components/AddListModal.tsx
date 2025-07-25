import React, { useState, useEffect } from 'react';
import Modal from './Modal';

interface AddListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddList: (title: string) => void;
}

const AddListModal: React.FC<AddListModalProps> = ({ isOpen, onClose, onAddList }) => {
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setTitle('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAddList(title.trim());
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Criar Nova Lista de Oração">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="listTitle" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Título da Lista
          </label>
          <input
            id="listTitle"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Família, Amigos, Trabalho"
            className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-md p-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-color)]"
            required
            autoFocus
          />
        </div>
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={!title.trim()}
            className="px-6 py-2 bg-[var(--accent-color)] text-white font-semibold rounded-md hover:bg-[var(--accent-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--modal-bg)] focus:ring-[var(--accent-color)] disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors"
          >
            Criar Lista
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddListModal;