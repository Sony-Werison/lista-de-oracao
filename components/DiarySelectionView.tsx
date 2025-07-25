import React, { useState, useMemo } from 'react';
import { User, Diary } from '../types';
import { UserIcon, UsersIcon } from './icons';

interface DiarySelectionViewProps {
  user: User;
  onSelectDiary: (diaryOrCode: Diary | string) => void;
}

const DiarySelectionView: React.FC<DiarySelectionViewProps> = ({ user, onSelectDiary }) => {
  const [sharedCode, setSharedCode] = useState('');

  const personalDiary = useMemo(() => {
    return user.diaries.find(d => d.type === 'personal');
  }, [user.diaries]);

  const handleSharedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sharedCode.trim()) {
      onSelectDiary(sharedCode.trim().toLowerCase());
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--bg-color)] p-4">
      <div className="w-full max-w-md mx-auto animate-fade-in-up space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Escolha seu Diário</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Olá, <span className="font-medium text-[var(--text-primary)]">{user.email}</span>!</p>
        </div>

        <div className="space-y-4">
          {personalDiary && (
            <button
              onClick={() => onSelectDiary(personalDiary)}
              className="w-full flex flex-col items-center justify-center p-8 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-center hover:border-[var(--accent-color)] hover:bg-[var(--card-bg-hover)] transition-all duration-200 group"
            >
              <UserIcon className="w-10 h-10 text-[var(--text-secondary)] group-hover:text-[var(--accent-color)] transition-colors" />
              <h2 className="mt-4 font-bold text-lg text-[var(--text-primary)]">{personalDiary.name}</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Seus pedidos de oração privados.</p>
            </button>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-[var(--border-color)]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[var(--bg-color)] px-2 text-xs text-[var(--text-secondary)]">OU</span>
            </div>
          </div>

          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-6 text-center">
             <UsersIcon className="w-10 h-10 text-[var(--text-secondary)] mx-auto" />
            <h2 className="mt-4 font-bold text-lg text-[var(--text-primary)]">Diário Compartilhado</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1">Acesse um diário com um código.</p>
            <form onSubmit={handleSharedSubmit} className="mt-4 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={sharedCode}
                onChange={(e) => setSharedCode(e.target.value)}
                placeholder="Código de Compartilhamento"
                className="flex-grow w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-md p-2.5 text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-color)]"
                required
              />
              <button
                type="submit"
                disabled={!sharedCode.trim()}
                className="px-5 py-2.5 bg-[var(--accent-color)] text-white font-semibold rounded-md hover:bg-[var(--accent-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)] focus:ring-[var(--accent-color)] disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors"
              >
                Acessar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiarySelectionView;