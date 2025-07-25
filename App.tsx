
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { PrayerListType, PrayerCardType, ViewType, Theme, SortKey, ArchivedCardType } from './types';
import AddListModal from './components/AddListModal';
import CardEditorModal from './components/AddCardModal';
import { PlusIcon, ColumnsIcon, ListIcon, GraphIcon, UserIcon, SunIcon, MoonIcon, PencilIcon, ChevronDoubleUpIcon, ChevronDoubleDownIcon, TrashIcon, SearchIcon, ArchiveBoxIcon, ArrowPathIcon } from './components/icons';
import PrayerList from './components/PrayerList';
import PrayerCard from './components/PrayerCard';
import Modal from './components/Modal';
import MindMapView from './components/MindMapView';
import { loadData, saveData } from './services/apiService';


// --- View Components ---

const PersonDetailsModal: React.FC<{
    person: string;
    cards: (PrayerCardType & { listId: string; listTitle: string })[];
    isOpen: boolean;
    onClose: () => void;
    handlers: any;
    onAddCardForPerson: (person: string) => void;
}> = ({ person, cards, isOpen, onClose, handlers, onAddCardForPerson }) => {
    const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set(cards.map(c => c.id)));

    const handleToggleExpandCard = (cardId: string) => {
        setExpandedCards(prev => {
            const newSet = new Set(prev);
            if (newSet.has(cardId)) newSet.delete(cardId);
            else newSet.add(cardId);
            return newSet;
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={person}>
            <div className="max-h-[60vh] overflow-y-auto -mr-3 pr-3">
                {cards.map(card => (
                     <PrayerCard 
                        key={card.id} 
                        card={card} 
                        onToggleAnswered={() => handlers.onToggleAnswered(card.listId, card.id)} 
                        onDelete={() => handlers.onDeleteCard(card.listId, card.id)}
                        onEdit={() => handlers.onEditCard(card, card.listId)}
                        onArchive={() => handlers.onArchiveCard(card.listId, card.id)}
                        isExpanded={expandedCards.has(card.id)}
                        onToggleExpand={() => handleToggleExpandCard(card.id)}
                        showListTitle={true}
                        listTitle={card.listTitle}
                    />
                ))}
            </div>
             <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
                <button
                    onClick={() => onAddCardForPerson(person)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-[var(--text-primary)] bg-[var(--bg-tertiary)] rounded-md hover:bg-[var(--accent-color)] hover:text-white focus:outline-none transition-colors"
                >
                    <PlusIcon className="w-4 h-4" />
                    Adicionar Novo Pedido para {person}
                </button>
            </div>
        </Modal>
    )
};


const PersonView: React.FC<{ lists: PrayerListType[]; handlers: any }> = ({ lists, handlers }) => {
    const [sortKey, setSortKey] = useState<SortKey>('count');
    const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const cardsByPerson = useMemo(() => {
        const groups: Record<string, (PrayerCardType & { listId: string; listTitle: string })[]> = {};
        lists.forEach(list => {
            list.cards.forEach(card => {
                const people = card.person ? card.person.split(',').map(p => p.trim()) : ['Geral'];
                people.forEach(personKey => {
                    if (!personKey) personKey = 'Geral';
                    if (!groups[personKey]) {
                        groups[personKey] = [];
                    }
                    groups[personKey].push({ ...card, listId: list.id, listTitle: list.title });
                });
            });
        });
        
        const filteredEntries = Object.entries(groups).filter(([personName]) => 
            personName.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return filteredEntries.sort(([aName, aCards], [bName, bCards]) => {
            if (sortKey === 'count') {
                const countDiff = bCards.length - aCards.length;
                if (countDiff !== 0) return countDiff;
            }
            return aName.localeCompare(bName);
        });
    }, [lists, sortKey, searchQuery]);
    
    const handleAddCardForPerson = (personName: string) => {
        setSelectedPerson(null);
        handlers.onAddCardForPerson(personName);
    }

    const selectedPersonData = useMemo(() => {
        if (!selectedPerson) return null;
        return cardsByPerson.find(([name]) => name === selectedPerson);
    }, [selectedPerson, cardsByPerson]);

    return (
        <div className="p-2 sm:p-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 px-2">
                <div className="relative w-full sm:max-w-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="w-4 h-4 text-[var(--text-secondary)]" />
                    </div>
                    <input 
                        type="text"
                        placeholder="Buscar pessoa..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-md pl-9 pr-3 py-2 text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-color)]"
                    />
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-[var(--text-secondary)]">Ordenar por:</span>
                    <button 
                        onClick={() => setSortKey('name')}
                        className={`px-3 py-1 text-xs rounded-md transition-colors ${sortKey === 'name' ? 'bg-[var(--accent-color)] text-white' : 'bg-[var(--bg-tertiary)] hover:bg-[var(--card-bg-hover)]'}`}
                    >
                        Nome
                    </button>
                    <button 
                        onClick={() => setSortKey('count')}
                        className={`px-3 py-1 text-xs rounded-md transition-colors ${sortKey === 'count' ? 'bg-[var(--accent-color)] text-white' : 'bg-[var(--bg-tertiary)] hover:bg-[var(--card-bg-hover)]'}`}
                    >
                        Pedidos
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
                 {cardsByPerson.map(([person, cards]) => (
                    <div 
                        key={person} 
                        className="bg-[var(--card-bg-color)] border border-[var(--border-color)] rounded-lg p-3 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[var(--card-bg-hover)] hover:shadow-lg transition-all hover:-translate-y-1"
                        onClick={() => setSelectedPerson(person)}
                    >
                        <UserIcon className="w-8 h-8 text-[var(--accent-color)] mb-2" />
                        <h4 className="font-bold text-sm text-[var(--text-primary)] truncate w-full">{person}</h4>
                        <p className="text-xs text-[var(--text-secondary)]">{cards.length} pedido{cards.length !== 1 ? 's' : ''}</p>
                    </div>
                 ))}
            </div>
            {cardsByPerson.length === 0 && searchQuery && (
                <div className="text-center py-10">
                    <p className="text-[var(--text-secondary)]">Nenhuma pessoa encontrada para "{searchQuery}".</p>
                </div>
            )}
            {selectedPersonData && (
                <PersonDetailsModal
                    isOpen={!!selectedPerson}
                    onClose={() => setSelectedPerson(null)}
                    person={selectedPersonData[0]}
                    cards={selectedPersonData[1]}
                    handlers={handlers}
                    onAddCardForPerson={handleAddCardForPerson}
                />
            )}
        </div>
    );
};


const ArchiveView: React.FC<{ 
    cards: ArchivedCardType[];
    onDelete: (cardId: string) => void;
}> = ({ cards, onDelete }) => {
    const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

    const handleToggleExpandCard = (cardId: string) => {
        setExpandedCards(prev => {
            const newSet = new Set(prev);
            if (newSet.has(cardId)) newSet.delete(cardId);
            else newSet.add(cardId);
            return newSet;
        });
    };

    if (cards.length === 0) {
        return (
            <div className="text-center py-20 px-4">
                <ArchiveBoxIcon className="w-16 h-16 mx-auto text-[var(--text-secondary)] mb-4" />
                <h2 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)]">Nenhum pedido arquivado</h2>
                <p className="text-sm text-[var(--text-secondary)] mt-2">Quando você arquivar um pedido, ele aparecerá aqui.</p>
            </div>
        );
    }
    
    return (
        <div className="p-2 sm:p-4 max-w-3xl mx-auto w-full">
            <h3 className="text-lg sm:text-xl font-bold px-2 mb-2 sm:mb-4">Pedidos Arquivados</h3>
            {cards.map(card => (
                 <PrayerCard 
                    key={card.id} 
                    card={card} 
                    onDelete={() => onDelete(card.id)}
                    isExpanded={expandedCards.has(card.id)}
                    onToggleExpand={() => handleToggleExpandCard(card.id)}
                    showListTitle={true}
                    listTitle={card.listTitle}
                />
            ))}
        </div>
    )
};


// --- Main App Component ---

type ActionType = 'expand-details' | 'collapse-details' | 'expand-lists' | 'collapse-lists';
type ListSortType = 'manual' | 'alphabetical' | 'count';

const ActionToolbar: React.FC<{ 
    onAction: (action: ActionType) => void;
    onClearCompleted: () => void;
    hasCompletedLists: boolean;
    listSort: ListSortType;
    onSortChange: (sort: ListSortType) => void;
}> = ({ onAction, onClearCompleted, hasCompletedLists, listSort, onSortChange }) => {
    return (
        <div className="px-2 sm:px-4 py-2 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center flex-wrap gap-4">
              <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[var(--text-secondary)]">Listas:</span>
                  <div className="flex items-center bg-[var(--bg-tertiary)] rounded-md">
                      <button onClick={() => onAction('collapse-lists')} title="Recolher Todas" className="p-1.5 text-[var(--text-secondary)] hover:bg-[var(--card-bg-hover)] hover:text-[var(--text-primary)] transition-colors rounded-l-md">
                          <ChevronDoubleUpIcon className="w-4 h-4" />
                      </button>
                      <div className="w-px h-4 bg-[var(--border-color)]"></div>
                      <button onClick={() => onAction('expand-lists')} title="Expandir Todas" className="p-1.5 text-[var(--text-secondary)] hover:bg-[var(--card-bg-hover)] hover:text-[var(--text-primary)] transition-colors rounded-r-md">
                          <ChevronDoubleDownIcon className="w-4 h-4" />
                      </button>
                  </div>
              </div>
              <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[var(--text-secondary)]">Detalhes:</span>
                  <div className="flex items-center bg-[var(--bg-tertiary)] rounded-md">
                      <button onClick={() => onAction('collapse-details')} title="Recolher Todos" className="p-1.5 text-[var(--text-secondary)] hover:bg-[var(--card-bg-hover)] hover:text-[var(--text-primary)] transition-colors rounded-l-md">
                          <ChevronDoubleUpIcon className="w-4 h-4" />
                      </button>
                      <div className="w-px h-4 bg-[var(--border-color)]"></div>
                      <button onClick={() => onAction('expand-details')} title="Expandir Todos" className="p-1.5 text-[var(--text-secondary)] hover:bg-[var(--card-bg-hover)] hover:text-[var(--text-primary)] transition-colors rounded-r-md">
                          <ChevronDoubleDownIcon className="w-4 h-4" />
                      </button>
                  </div>
              </div>
               <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-[var(--text-secondary)]">Ordenar:</span>
                     <div className="flex items-center bg-[var(--bg-tertiary)] rounded-md">
                        {(
                            [
                                { key: 'manual', label: 'Manual' },
                                { key: 'alphabetical', label: 'Nome' },
                                { key: 'count', label: 'Pedidos' },
                            ] as const
                        ).map((sort, index, arr) => (
                            <React.Fragment key={sort.key}>
                                <button
                                    onClick={() => onSortChange(sort.key)}
                                    title={sort.label}
                                    className={`px-3 py-1 text-xs transition-colors ${listSort === sort.key ? 'bg-[var(--accent-color)] text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--card-bg-hover)]'} ${index === 0 ? 'rounded-l-md' : ''} ${index === arr.length - 1 ? 'rounded-r-md' : ''}`}
                                >
                                    {sort.label}
                                </button>
                                {index < arr.length - 1 && <div className="w-px h-4 bg-[var(--border-color)]"></div>}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>
            {hasCompletedLists && (
                 <button onClick={onClearCompleted} title="Limpar Listas Concluídas" className="flex items-center gap-2 p-1.5 text-xs text-yellow-400 hover:bg-yellow-500/10 rounded-md transition-colors">
                    <TrashIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Limpar Concluídas</span>
                </button>
            )}
        </div>
    );
};

const App: React.FC = () => {
  // App State
  const [prayerLists, setPrayerLists] = useState<PrayerListType[]>([]);
  const [archivedCards, setArchivedCards] = useState<ArchivedCardType[]>([]);
  
  // UI State
  const [isAddListModalOpen, setIsAddListModalOpen] = useState(false);
  const [activeListForAddingCard, setActiveListForAddingCard] = useState<PrayerListType | null>(null);
  const [personToAddCardFor, setPersonToAddCardFor] = useState<string | null>(null);
  const [cardToEdit, setCardToEdit] = useState<(PrayerCardType & { listId: string }) | null>(null);
  
  const [activeView, setActiveView] = useState<ViewType>('list');
  const [theme, setTheme] = useState<Theme>('dark');
  const [listSort, setListSort] = useState<ListSortType>('manual');
  
  const [areAllCardsExpanded, setAreAllCardsExpanded] = useState<boolean | null>(null);
  const [collapsedLists, setCollapsedLists] = useState<Set<string>>(new Set());
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  // Carrega os dados do serviço de API ao iniciar
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await loadData();
        setPrayerLists(data.prayerLists);
        setArchivedCards(data.archivedCards);
      } catch (error) {
        console.error("Falha ao carregar dados:", error);
        // Opcional: mostrar uma mensagem de erro para o usuário
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const updateAndSaveData = useCallback((newLists: PrayerListType[], newArchived: ArchivedCardType[]) => {
    setPrayerLists(newLists);
    setArchivedCards(newArchived);
    // Operação de salvar "dispare e esqueça" para o serviço de API
    saveData({ prayerLists: newLists, archivedCards: newArchived });
  }, []);
  
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  
  const handleAction = useCallback((action: ActionType) => {
    switch (action) {
        case 'expand-details':
            setAreAllCardsExpanded(true);
            break;
        case 'collapse-details':
            setAreAllCardsExpanded(false);
            break;
        case 'expand-lists':
            setCollapsedLists(new Set());
            break;
        case 'collapse-lists':
            setCollapsedLists(new Set(prayerLists.map(l => l.id)));
            break;
    }
    setTimeout(() => setAreAllCardsExpanded(null), 100);
  }, [prayerLists]);

  const handleAddList = useCallback((title: string) => {
    const newList: PrayerListType = {
      id: `list-${Date.now()}`,
      title,
      createdAt: new Date(),
      cards: [],
      isCompleted: false,
    };
    updateAndSaveData([newList, ...prayerLists], archivedCards);
    setIsAddListModalOpen(false);
  }, [prayerLists, archivedCards, updateAndSaveData]);

  const handleDeleteList = useCallback((listId: string) => {
    const listToDelete = prayerLists.find(l => l.id === listId);
    if (listToDelete && window.confirm(`Você tem certeza que deseja deletar a lista "${listToDelete.title}" e todos os seus pedidos?`)) {
      const newLists = prayerLists.filter(list => list.id !== listId);
      updateAndSaveData(newLists, archivedCards);
    }
  }, [prayerLists, archivedCards, updateAndSaveData]);
  
  const handleToggleListCompleted = useCallback((listId: string) => {
      const newLists = prayerLists.map(list =>
        list.id === listId ? { ...list, isCompleted: !list.isCompleted } : list
      );
      updateAndSaveData(newLists, archivedCards);
  }, [prayerLists, archivedCards, updateAndSaveData]);

  const handleClearCompletedLists = useCallback(() => {
      if (window.confirm('Você tem certeza que deseja limpar todas as listas marcadas como concluídas? Esta ação não pode ser desfeita.')) {
        const newLists = prayerLists.filter(list => !list.isCompleted);
        updateAndSaveData(newLists, archivedCards);
      }
  }, [prayerLists, archivedCards, updateAndSaveData]);

  const handleAddCard = useCallback((listId: string, title: string, description: string, personString: string) => {
    const newCard: PrayerCardType = {
      id: `card-${Date.now()}`,
      title,
      description,
      person: personString.trim() || undefined,
      isAnswered: false,
      createdAt: new Date(),
    };
    const newLists = prayerLists.map(list =>
      list.id === listId ? { ...list, cards: [newCard, ...list.cards] } : list
    );
    updateAndSaveData(newLists, archivedCards);
    setActiveListForAddingCard(null);
    setPersonToAddCardFor(null);
    setCardToEdit(null);
  }, [prayerLists, archivedCards, updateAndSaveData]);


  const handleUpdateCard = useCallback((listId: string, cardId: string, updates: Partial<PrayerCardType>) => {
    const newLists = prayerLists.map(list =>
      list.id === listId
        ? { ...list, cards: list.cards.map(card => card.id === cardId ? { ...card, ...updates } : card) }
        : list
    );
    updateAndSaveData(newLists, archivedCards);
    setCardToEdit(null);
  }, [prayerLists, archivedCards, updateAndSaveData]);
  
  const handleEditCard = useCallback((card: PrayerCardType, listId: string) => {
    setCardToEdit({ ...card, listId });
  }, []);
  
  const handleDeleteCard = useCallback((listId: string, cardId: string) => {
    if (window.confirm('Você tem certeza que deseja excluir este pedido de oração?')) {
        const newLists = prayerLists.map(list =>
          list.id === listId
            ? { ...list, cards: list.cards.filter(card => card.id !== cardId) }
            : list
        );
        updateAndSaveData(newLists, archivedCards);
    }
  }, [prayerLists, archivedCards, updateAndSaveData]);

  const handleToggleAnswered = useCallback((listId: string, cardId: string) => {
    const newLists = prayerLists.map(list =>
      list.id === listId
        ? { ...list, cards: list.cards.map(card => card.id === cardId ? { ...card, isAnswered: !card.isAnswered } : card) }
        : list
    );
    updateAndSaveData(newLists, archivedCards);
  }, [prayerLists, archivedCards, updateAndSaveData]);
  
  const handleArchiveCard = useCallback((listId: string, cardId: string) => {
      let cardToArchive: (PrayerCardType & { listTitle: string }) | null = null;
      const newLists = [...prayerLists];
      const listIndex = newLists.findIndex(l => l.id === listId);
      if (listIndex === -1) return;
      const list = newLists[listIndex];
      const cardIndex = list.cards.findIndex(c => c.id === cardId);
      if (cardIndex === -1) return;
      const [foundCard] = list.cards.splice(cardIndex, 1);
      cardToArchive = { ...foundCard, listTitle: list.title };

      if (cardToArchive) {
          const newArchivedCard: ArchivedCardType = {
              ...(cardToArchive as PrayerCardType),
              isAnswered: true,
              listId: listId,
              listTitle: cardToArchive.listTitle,
              archivedAt: new Date(),
          };
          const newArchived = [newArchivedCard, ...archivedCards.filter(c => c.id !== cardId)];
          updateAndSaveData(newLists, newArchived);
      }
  }, [prayerLists, archivedCards, updateAndSaveData]);
  
  const handleDeleteArchivedCard = useCallback((cardId: string) => {
      if(window.confirm('Deseja excluir permanentemente este pedido arquivado?')) {
          const newArchived = archivedCards.filter(c => c.id !== cardId);
          updateAndSaveData(prayerLists, newArchived);
      }
  }, [prayerLists, archivedCards, updateAndSaveData]);

  const handleAddCardForPerson = useCallback((personName: string) => {
      setPersonToAddCardFor(personName === 'Geral' ? '' : personName);
      setCardToEdit(null);
      setActiveListForAddingCard(null);
  }, []);

  const handleToggleListCollapse = useCallback((listId: string) => {
    setCollapsedLists(prev => {
        const newSet = new Set(prev);
        if (newSet.has(listId)) newSet.delete(listId);
        else newSet.add(listId);
        return newSet;
    });
  }, []);

  const handleSortLists = useCallback((sourceId: string, targetId: string) => {
    const sourceIndex = prayerLists.findIndex(list => list.id === sourceId);
    const targetIndex = prayerLists.findIndex(list => list.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1) return;
    const reorderedLists = Array.from(prayerLists);
    const [movedList] = reorderedLists.splice(sourceIndex, 1);
    reorderedLists.splice(targetIndex, 0, movedList);
    updateAndSaveData(reorderedLists, archivedCards);
  }, [prayerLists, archivedCards, updateAndSaveData]);
  
  const sortedPrayerLists = useMemo(() => {
    if (listSort === 'manual') return prayerLists;
    const listsToSort = [...prayerLists];
    switch (listSort) {
      case 'alphabetical':
        return listsToSort.sort((a, b) => a.title.localeCompare(b.title));
      case 'count':
        return listsToSort.sort((a, b) => b.cards.length - a.cards.length);
      default:
        return listsToSort;
    }
  }, [prayerLists, listSort]);

  const handlers = {
      onAddListClick: () => setIsAddListModalOpen(true),
      onAddCardClick: setActiveListForAddingCard,
      onDeleteList: handleDeleteList,
      onToggleAnswered: handleToggleAnswered,
      onDeleteCard: handleDeleteCard,
      onEditCard: handleEditCard,
      onArchiveCard: handleArchiveCard,
      onAddCardForPerson: handleAddCardForPerson,
      onToggleCompleted: handleToggleListCompleted,
      onSortLists: handleSortLists,
  };
  
  const hasCompletedLists = useMemo(() => prayerLists.some(list => list.isCompleted), [prayerLists]);

  const ViewControls = () => (
    <div className="flex items-center gap-1 sm:gap-2">
      {(
        [
            { view: 'list', icon: ListIcon, label: 'Lista' },
            { view: 'columns', icon: ColumnsIcon, label: 'Colunas' },
            { view: 'person', icon: UserIcon, label: 'Pessoas' },
            { view: 'archive', icon: ArchiveBoxIcon, label: 'Arquivo' },
            { view: 'graph', icon: GraphIcon, label: 'Gráfico' },
        ] as const
      ).map(({view, icon: Icon, label}) => (
        <button
          key={view}
          onClick={() => setActiveView(view)}
          className={`px-2 sm:px-2.5 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
            activeView === view ? 'bg-[var(--accent-color)] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
          }`}
          aria-label={`Visualizar como ${label}`}
        >
          <Icon className="w-4 h-4" />
          <span className="hidden sm:inline text-xs">{label}</span>
        </button>
      ))}
       <div className="w-px h-6 bg-[var(--border-color)] mx-1"></div>
       <button onClick={toggleTheme} className="p-2 rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors" title="Alternar tema">
          {theme === 'light' ? <MoonIcon className="w-4 h-4" /> : <SunIcon className="w-4 h-4" />}
       </button>
    </div>
  );

  const renderView = () => {
    const listsToRender = (activeView === 'list' || activeView === 'columns') ? sortedPrayerLists : prayerLists;

    if (isLoading) {
      return (
          <div className="flex justify-center items-center h-full py-20">
              <ArrowPathIcon className="w-8 h-8 text-[var(--accent-color)] animate-spin" />
          </div>
      );
    }

    if (listsToRender.length === 0 && activeView !== 'archive' && !isLoading) {
       return (
          <div className="text-center py-20 px-4">
            <h2 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)]">Seu diário está vazio</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-2">Comece criando sua primeira lista de oração.</p>
            <button
              onClick={() => setIsAddListModalOpen(true)}
              className="mt-6 inline-flex items-center gap-2 px-5 py-3 bg-[var(--accent-color)] text-white font-semibold rounded-md hover:bg-[var(--accent-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-color)] focus:ring-[var(--accent-color)] transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              Criar Primeira Lista
            </button>
          </div>
        );
    }
    switch(activeView) {
        case 'columns': return (
            <div className="flex gap-4 p-4 overflow-x-auto min-h-[calc(100vh-150px)] items-start h-full">
                {listsToRender.map(list => (
                  <PrayerList
                    key={list.id}
                    list={list}
                    viewMode="column"
                    isCollapsed={collapsedLists.has(list.id)}
                    onAddCardClick={handlers.onAddCardClick}
                    onDeleteList={handlers.onDeleteList}
                    onEditCard={handlers.onEditCard}
                    onToggleAnswered={handlers.onToggleAnswered}
                    onDeleteCard={handlers.onDeleteCard}
                    onArchiveCard={handlers.onArchiveCard}
                    onToggleCollapse={() => handleToggleListCollapse(list.id)}
                    areAllCardsExpanded={areAllCardsExpanded}
                    onToggleCompleted={handlers.onToggleCompleted}
                    listSort={listSort}
                    onSort={handlers.onSortLists}
                  />
                ))}
                <div className="flex-shrink-0">
                    <button
                      onClick={handlers.onAddListClick}
                      className="w-14 h-14 flex items-center justify-center gap-2 bg-[var(--card-bg-color)] text-[var(--text-secondary)] rounded-xl hover:bg-[var(--card-bg-hover)] focus:outline-none border border-dashed border-[var(--border-color)] hover:text-[var(--text-primary)] hover:border-[var(--accent-color)] transition-all"
                    >
                      <PlusIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
        );
        case 'list': return (
            <div className="p-2 sm:p-4 max-w-3xl mx-auto">
                {listsToRender.map(list => (
                  <PrayerList
                    key={list.id}
                    list={list}
                    viewMode="list"
                    onAddCardClick={handlers.onAddCardClick}
                    onDeleteList={handlers.onDeleteList}
                    onEditCard={handlers.onEditCard}
                    onToggleAnswered={handlers.onToggleAnswered}
                    onDeleteCard={handlers.onDeleteCard}
                    onArchiveCard={handlers.onArchiveCard}
                    areAllCardsExpanded={areAllCardsExpanded}
                    isCollapsed={collapsedLists.has(list.id)}
                    onToggleCollapse={() => handleToggleListCollapse(list.id)}
                    onToggleCompleted={handlers.onToggleCompleted}
                    listSort={listSort}
                    onSort={handlers.onSortLists}
                  />
                ))}
            </div>
        );
        case 'graph': return <MindMapView lists={listsToRender} onEditCard={handleEditCard} />;
        case 'person': return <PersonView lists={listsToRender} handlers={handlers} />;
        case 'archive': return <ArchiveView cards={archivedCards} onDelete={handleDeleteArchivedCard} />;
        default: return null;
    }
  }
  
  const isModalOpen = !!activeListForAddingCard || personToAddCardFor !== null || !!cardToEdit;

  const fabConfig = useMemo(() => {
    switch (activeView) {
      case 'columns':
      case 'list':
      case 'graph':
        return [
            { label: 'Adicionar Lista', icon: ListIcon, action: () => setIsAddListModalOpen(true) },
            { label: 'Adicionar Pedido', icon: PencilIcon, action: () => handlers.onAddCardForPerson('') },
        ];
      case 'person':
        return [
            { label: 'Adicionar Pedido', icon: PencilIcon, action: () => handlers.onAddCardForPerson('') },
         ];
      case 'archive':
          return [];
      default:
        return [];
    }
  }, [activeView, handlers]);

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-primary)] font-sans flex flex-col">
      <header className="bg-[var(--bg-color)]/80 backdrop-blur-lg sticky top-0 z-40 border-b border-[var(--border-color)]">
        <div className="w-full mx-auto px-2 sm:px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-[var(--text-primary)] tracking-tight truncate">
              Diário de Oração AI
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <ViewControls />
          </div>
        </div>
        {(activeView === 'columns' || activeView === 'list') && (
            <ActionToolbar 
              onAction={handleAction} 
              onClearCompleted={handleClearCompletedLists} 
              hasCompletedLists={hasCompletedLists}
              listSort={listSort}
              onSortChange={setListSort}
            />
        )}
      </header>
      
      <main className="flex-1 w-full h-full">
        {renderView()}
      </main>

       {fabConfig.length > 0 && (prayerLists.length > 0 || isLoading === false) && (
        <div className="fixed bottom-6 right-6 z-30 flex flex-col items-center gap-3">
            {isFabMenuOpen && fabConfig.map(({ label, icon: Icon, action }, index) => (
                <div key={label} className="flex items-center gap-3 w-max animate-fade-in-up" style={{ animationDelay: `${index * 40}ms` }}>
                    <span className="bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-xs px-3 py-1.5 rounded-md shadow-lg">
                        {label}
                    </span>
                    <button
                        onClick={() => {
                            action();
                            setIsFabMenuOpen(false);
                        }}
                        className="bg-[var(--bg-secondary)] text-[var(--accent-color)] p-2.5 rounded-full shadow-lg border border-[var(--border-color)] hover:border-[var(--accent-color)] transition-all transform hover:scale-110"
                        aria-label={label}
                    >
                        <Icon className="w-4 h-4" />
                    </button>
                </div>
            ))}
            <button
                onClick={() => setIsFabMenuOpen(prev => !prev)}
                className={`bg-[var(--accent-color)] text-white p-3 rounded-full shadow-lg hover:bg-[var(--accent-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-color)] focus:ring-[var(--accent-color)] transition-transform duration-300 ${isFabMenuOpen ? 'rotate-45' : 'hover:scale-110'}`}
                aria-label="Abrir menu de ações"
            >
                <PlusIcon className="w-5 h-5" />
            </button>
        </div>
       )}

      <AddListModal 
        isOpen={isAddListModalOpen}
        onClose={() => setIsAddListModalOpen(false)}
        onAddList={handleAddList}
      />
      
      <CardEditorModal
        list={activeListForAddingCard}
        allLists={prayerLists}
        cardToEdit={cardToEdit}
        personName={personToAddCardFor ?? undefined}
        isOpen={isModalOpen}
        onClose={() => {
            setActiveListForAddingCard(null);
            setPersonToAddCardFor(null);
            setCardToEdit(null);
        }}
        onAddCard={handleAddCard}
        onUpdateCard={handleUpdateCard}
      />
    </div>
  );
};

export default App;