import React, { useState, useEffect, useMemo } from 'react';
import { PrayerListType, PrayerCardType } from '../types';
import Modal from './Modal';

interface CardEditorModalProps {
  list: PrayerListType | null;
  allLists: PrayerListType[];
  cardToEdit: (PrayerCardType & { listId: string }) | null;
  personName?: string;
  isOpen: boolean;
  onClose: () => void;
  onAddCard: (listId: string, title: string, description: string, person: string) => void;
  onUpdateCard: (listId: string, cardId: string, updates: Partial<PrayerCardType>) => void;
}

const CardEditorModal: React.FC<CardEditorModalProps> = ({ list, allLists, cardToEdit, personName, isOpen, onClose, onAddCard, onUpdateCard }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [person, setPerson] = useState('');
  const [selectedListId, setSelectedListId] = useState<string>('');
  
  const mode = cardToEdit ? 'edit' : 'add';

  const allPeople = useMemo(() => {
    const peopleSet = new Set<string>();
    allLists.forEach(list => {
        list.cards.forEach(card => {
            if (card.person) {
                card.person.split(',').forEach(p => {
                    const trimmed = p.trim();
                    if (trimmed) peopleSet.add(trimmed);
                });
            }
        });
    });
    return Array.from(peopleSet).sort();
  }, [allLists]);
  
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && cardToEdit) {
        setTitle(cardToEdit.title);
        setDescription(cardToEdit.description);
        setPerson(cardToEdit.person || '');
        setSelectedListId(cardToEdit.listId);
      } else {
        setTitle('');
        setDescription('');
        setPerson(personName || '');
        if (list) {
          setSelectedListId(list.id);
        } else if (allLists.length > 0) {
          setSelectedListId(allLists[0].id);
        }
      }
    }
  }, [isOpen, mode, cardToEdit, list, allLists, personName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListId || !title.trim()) return;

    if (mode === 'edit' && cardToEdit) {
      onUpdateCard(cardToEdit.listId, cardToEdit.id, {
        title: title.trim(),
        description: description.trim(),
        person: person.trim() || undefined
      });
    } else {
      onAddCard(selectedListId, title.trim(), description.trim(), person.trim());
    }
    onClose();
  };

  const currentList = allLists.find(l => l.id === selectedListId);
  const modalTitle = mode === 'edit' ? "Editar Pedido de Oração" : (currentList ? `Adicionar a "${currentList?.title}"` : "Adicionar Pedido de Oração");

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'add' && !list && allLists.length > 0 && (
          <div>
            <label htmlFor="listSelector" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Lista
            </label>
            <select
              id="listSelector"
              value={selectedListId}
              onChange={(e) => setSelectedListId(e.target.value)}
              className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-md p-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-color)]"
            >
              {allLists.map(l => (
                <option key={l.id} value={l.id}>{l.title}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="cardTitle" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Título do Pedido
          </label>
          <input
            id="cardTitle"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Pela saúde da minha família"
            className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-md p-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-color)]"
            required
            autoFocus
          />
        </div>
        <div>
          <label htmlFor="cardPerson" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Pessoa (Opcional)
          </label>
          <input
            id="cardPerson"
            type="text"
            value={person}
            onChange={(e) => setPerson(e.target.value)}
            placeholder="Ex: João, Maria (separados por vírgula)"
            className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-md p-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-color)]"
            list="people-suggestions"
          />
           <datalist id="people-suggestions">
            {allPeople.map(p => <option key={p} value={p} />)}
          </datalist>
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="cardDescription" className="block text-sm font-medium text-[var(--text-secondary)]">
              Descrição / Oração
            </label>
          </div>
          <div className="relative">
             <textarea
              id="cardDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva seu pedido ou oração aqui."
              rows={5}
              className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-md p-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-color)]"
            />
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={!title.trim() || !selectedListId}
            className="px-6 py-2 bg-[var(--accent-color)] text-white font-semibold rounded-md hover:bg-[var(--accent-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--modal-bg)] focus:ring-[var(--accent-color)] disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors"
          >
            {mode === 'edit' ? 'Salvar Alterações' : 'Adicionar Pedido'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CardEditorModal;