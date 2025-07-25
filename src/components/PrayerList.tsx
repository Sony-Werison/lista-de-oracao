

import React, { useState, useEffect } from 'react';
import { PrayerListType, PrayerCardType } from '../types';
import PrayerCard from './PrayerCard';
import { TrashIcon, ChevronDownIcon, PlusIcon, ChevronLeftIcon, ChevronRightIcon, CheckCircleIcon, GripVerticalIcon } from './icons';

type ListSortType = 'manual' | 'alphabetical' | 'count';

interface PrayerListProps {
  list: PrayerListType;
  viewMode: 'list' | 'column';
  isCollapsed?: boolean;
  onAddCardClick: (list: PrayerListType) => void;
  onDeleteList: (listId: string) => void;
  onEditCard: (card: PrayerCardType, listId: string) => void;
  onToggleAnswered: (listId: string, cardId: string) => void;
  onDeleteCard: (listId: string, cardId: string) => void;
  onArchiveCard: (listId: string, cardId: string) => void;
  onToggleCollapse?: () => void;
  areAllCardsExpanded: boolean | null;
  onToggleCompleted: (listId: string) => void;
  listSort: ListSortType;
  onSort: (sourceId: string, targetId: string) => void;
}

const PrayerList: React.FC<PrayerListProps> = ({ 
    list, viewMode, isCollapsed, onAddCardClick, onDeleteList, onEditCard,
    onToggleAnswered, onDeleteCard, onArchiveCard, onToggleCollapse, areAllCardsExpanded, 
    onToggleCompleted, listSort, onSort
}) => {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  useEffect(() => {
    if (areAllCardsExpanded === true) {
      const expandableCardIds = list.cards.filter(c => c.description && c.description.trim() !== '').map(c => c.id);
      setExpandedCards(new Set(expandableCardIds));
    } else if (areAllCardsExpanded === false) {
      setExpandedCards(new Set());
    }
  }, [areAllCardsExpanded, list.cards]);

  const handleToggleExpandCard = (cardId: string) => {
    setExpandedCards(prev => {
        const newSet = new Set(prev);
        if (newSet.has(cardId)) {
            newSet.delete(cardId);
        } else {
            newSet.add(cardId);
        }
        return newSet;
    });
  };

  const handleDeleteList = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteList(list.id);
  };
  
  const handleHeaderClick = () => {
      if (viewMode === 'list') {
          onToggleCollapse?.();
      }
  }

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('listId', list.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('listId');
    if (sourceId && sourceId !== list.id) {
      onSort(sourceId, list.id);
    }
    setIsDraggingOver(false);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes('listid')) {
      setIsDraggingOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDraggingOver(false);
  };


  if (viewMode === 'column' && isCollapsed) {
    return (
        <div 
            className={`bg-[var(--card-bg-color)] rounded-xl shadow-lg h-full w-14 flex-shrink-0 flex items-center justify-center cursor-pointer border border-[var(--border-color)] hover:bg-[var(--card-bg-hover)] transition-all duration-300 group ${list.isCompleted ? 'opacity-60' : ''}`}
            onClick={onToggleCollapse}
        >
            <div className="h-full flex flex-col justify-between items-center py-4 px-1 text-center">
                 <ChevronRightIcon className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--accent-color)] transition-colors"/>
                 <div className="flex flex-col items-center gap-3">
                    <h3 className="writing-mode-vertical font-bold text-lg text-[var(--text-primary)] whitespace-nowrap">
                        {list.title}
                    </h3>
                    <span className="text-sm font-mono text-white bg-[var(--accent-color)] px-1.5 py-0.5 rounded">{list.cards.length}</span>
                 </div>
                 <div className="w-5 h-5" />
            </div>
        </div>
    );
  }

  const isDraggable = listSort === 'manual';
  const containerBaseClasses = `bg-[var(--card-bg-color)] rounded-xl shadow-lg overflow-hidden transition-all duration-300 border ${list.isCompleted ? 'opacity-60' : ''}`;
  const viewSpecificClasses = viewMode === 'list' ? 'w-full mb-4' : 'h-full w-80 flex-shrink-0 flex flex-col';
  const dragOverClasses = isDraggingOver ? 'border-[var(--accent-color)] ring-2 ring-[var(--accent-color)]' : 'border-[var(--border-color)]';
  
  const containerClasses = `${containerBaseClasses} ${viewSpecificClasses} ${dragOverClasses}`;

  return (
    <div 
      className={containerClasses}
      draggable={isDraggable}
      onDragStart={isDraggable ? handleDragStart : undefined}
      onDrop={isDraggable ? handleDrop : undefined}
      onDragOver={isDraggable ? handleDragOver : undefined}
      onDragLeave={isDraggable ? handleDragLeave : undefined}
    >
      <header
        className={`flex items-center justify-between p-3 flex-shrink-0 ${viewMode === 'list' ? 'hover:bg-[var(--card-bg-hover)]' : ''} ${isDraggable ? 'cursor-grab' : viewMode === 'list' ? 'cursor-pointer' : 'cursor-default'}`}
        onClick={handleHeaderClick}
      >
        <div className="flex items-center gap-2 min-w-0">
          {isDraggable && <GripVerticalIcon className="w-5 h-5 text-[var(--text-secondary)] cursor-grab" />}
          {viewMode === 'list' && <ChevronDownIcon className={`w-5 h-5 text-[var(--text-secondary)] transition-transform duration-300 ${!isCollapsed ? 'rotate-0' : '-rotate-90'}`} />}
          <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] truncate">{list.title}</h3>
          <span className="text-sm font-mono text-[var(--text-secondary)] bg-[var(--bg-tertiary)] px-1.5 py-0.5 rounded">{list.cards.length}</span>
        </div>
        <div className="flex items-center gap-1">
            {viewMode === 'column' && (
                 <button
                    onClick={(e) => { e.stopPropagation(); onToggleCollapse?.(); }}
                    className="p-1 text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-tertiary)] rounded-full transition-colors"
                    aria-label="Recolher lista"
                 >
                     <ChevronLeftIcon className="w-5 h-5" />
                 </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onToggleCompleted(list.id); }}
              className={`p-1 rounded-full transition-colors ${
                list.isCompleted
                ? 'text-green-400 hover:bg-green-500/20'
                : 'text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-tertiary)]'
              }`}
              aria-label={list.isCompleted ? 'Marcar lista como não concluída' : 'Marcar lista como concluída'}
            >
              <CheckCircleIcon className="w-5 h-5" />
            </button>
            <button
              onClick={handleDeleteList}
              className="p-1 text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
              aria-label="Deletar lista"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
        </div>
      </header>
      
      {(!isCollapsed || viewMode === 'column') && (
        <div className={`px-2 pb-2 flex-1 overflow-y-auto`}>
          {list.cards.map((card) => (
            <PrayerCard
              key={card.id}
              card={card}
              onToggleAnswered={(cardId) => onToggleAnswered(list.id, cardId)}
              onDelete={(cardId) => onDeleteCard(list.id, cardId)}
              onEdit={(c) => onEditCard(c, list.id)}
              onArchive={(cardId) => onArchiveCard(list.id, cardId)}
              isExpanded={expandedCards.has(card.id)}
              onToggleExpand={() => handleToggleExpandCard(card.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PrayerList;