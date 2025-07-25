
import React, { useState, useRef } from 'react';
import { PrayerCardType } from '../types';
import { CheckCircleIcon, TrashIcon, XCircleIcon, ChevronDownIcon, PencilIcon, ArchiveBoxIcon } from './icons';

interface PrayerCardProps {
  card: PrayerCardType;
  onToggleAnswered?: (cardId: string) => void;
  onDelete: (cardId: string) => void;
  onEdit?: (card: PrayerCardType) => void;
  onArchive?: (cardId: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  showListTitle?: boolean;
  listTitle?: string;
}

const PrayerCard: React.FC<PrayerCardProps> = ({ card, onToggleAnswered, onDelete, onEdit, onArchive, isExpanded, onToggleExpand, showListTitle, listTitle }) => {
  const [actionsVisible, setActionsVisible] = useState(false);
  const longPressTimer = useRef<number | null>(null);
  const wasLongPress = useRef(false);
  
  const canExpand = card.description && card.description.trim() !== '';

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') {
      wasLongPress.current = false;
      // Set a timer for long press
      longPressTimer.current = window.setTimeout(() => {
        setActionsVisible(true);
        wasLongPress.current = true;
      }, 500);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    // Clear the timer if the press is released
    if (e.pointerType === 'touch') {
      clearTimeout(longPressTimer.current ?? undefined);
    }
  };
  
  const handlePointerEnter = (e: React.PointerEvent) => {
    // Show actions on mouse hover
    if (e.pointerType === 'mouse') {
      setActionsVisible(true);
    }
  };

  const handlePointerLeave = (e: React.PointerEvent) => {
    // Hide actions when mouse leaves
    if (e.pointerType === 'mouse') {
      setActionsVisible(false);
    }
    // Also clear timer if finger slides off the element
    clearTimeout(longPressTimer.current ?? undefined);
  };
  
  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent click from toggling expand if it was a long press
    if (wasLongPress.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (canExpand) {
        onToggleExpand();
    }
  };
  
  const createActionHandler = (originalHandler?: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    originalHandler?.();
    setActionsVisible(false); // Hide actions after one is clicked
  }

  const handleToggle = createActionHandler(() => onToggleAnswered?.(card.id));
  const handleDelete = createActionHandler(() => onDelete(card.id));
  const handleEdit = createActionHandler(() => onEdit?.(card));
  const handleArchive = createActionHandler(() => onArchive?.(card.id));


  return (
    <div
      className={`
        relative bg-[var(--bg-tertiary)]/50 rounded-md my-2 border-l-4 transition-all duration-300 hover:bg-[var(--bg-tertiary)]
        ${card.isAnswered ? 'border-green-500 opacity-70' : 'border-[var(--accent-color)]'}
      `}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onClick={handleCardClick}
      style={{ cursor: canExpand ? 'pointer' : 'default', touchAction: 'pan-y' }}
    >
      <div className="p-3">
        <div className="flex items-start gap-3">
          <div 
            className="flex-1 min-w-0 flex items-center gap-2"
          >
            {canExpand ? (
                <ChevronDownIcon className={`w-4 h-4 text-[var(--text-secondary)] transition-transform duration-300 flex-shrink-0 ${isExpanded ? 'rotate-0' : '-rotate-90'}`} />
            ) : (
                <div className="w-4 h-4 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
                <h4 className={`text-xs sm:text-sm font-medium text-[var(--text-primary)] ${card.isAnswered ? 'line-through text-[var(--text-secondary)]' : ''}`}>
                  {card.title}
                </h4>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="pl-6 pt-2 mt-2 border-t border-[var(--border-color)]/50 animate-fade-in">
            {card.person && (
              <div className="text-xs text-[var(--text-secondary)] mb-2">
                  <span className="font-semibold text-[var(--accent-color)]/80">Pessoa(s): </span>{card.person}
              </div>
            )}
            {showListTitle && listTitle && (
              <div className="text-xs text-[var(--text-secondary)] mb-2">
                  <span className="font-semibold text-[var(--accent-color)]/80">Lista: </span>{listTitle}
              </div>
            )}
            {card.description ? (
              <p className="text-xs text-[var(--text-primary)]/90 whitespace-pre-wrap">{card.description}</p>
            ) : (
               <p className="text-xs text-[var(--text-secondary)] italic">Nenhuma descrição.</p>
            )}
          </div>
        )}
      </div>
      <div className={`
        absolute top-1/2 -translate-y-1/2 right-2 flex items-center gap-1 
        bg-[var(--bg-tertiary)] rounded-lg p-1 z-20 transition-opacity duration-300
        ${actionsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}>
         {onArchive && (
            <button
              onClick={handleArchive}
              className="p-1 text-[var(--text-secondary)] hover:text-indigo-400 hover:bg-indigo-500/10 rounded-full transition-colors"
              aria-label="Arquivar pedido"
            >
              <ArchiveBoxIcon className="w-5 h-5" />
            </button>
         )}
         {onEdit && (
            <button
              onClick={handleEdit}
              className="p-1 text-[var(--text-secondary)] hover:text-white hover:bg-white/10 rounded-full transition-colors"
              aria-label="Editar pedido"
            >
              <PencilIcon className="w-5 h-5" />
            </button>
         )}
        {onToggleAnswered && (
            <button
              onClick={handleToggle}
              className={`p-1 rounded-full transition-colors ${
                card.isAnswered
                  ? 'text-yellow-400 hover:bg-yellow-500/20'
                  : 'text-green-400 hover:bg-green-500/20'
              }`}
              aria-label={card.isAnswered ? 'Marcar como não respondido' : 'Marcar como respondido'}
            >
              {card.isAnswered ? <XCircleIcon className="w-5 h-5" /> : <CheckCircleIcon className="w-5 h-5" />}
            </button>
        )}
        <button
          onClick={handleDelete}
          className="p-1 text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
          aria-label="Deletar pedido"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default PrayerCard;