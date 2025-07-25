import React from 'react';
import { XCircleIcon } from './icons';

const FirebaseConfigNotice: React.FC = () => {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[var(--bg-color)] p-4">
            <div className="w-full max-w-2xl mx-auto bg-[var(--bg-secondary)] shadow-2xl rounded-lg p-6 sm:p-8 border border-red-500/50 animate-fade-in-up">
                <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                    <XCircleIcon className="w-12 h-12 text-red-500 flex-shrink-0" />
                    <div>
                        <h1 className="text-xl font-bold text-red-400">Erro de Configuração do Firebase</h1>
                        <p className="text-sm text-[var(--text-secondary)] mt-2">
                            As credenciais do Firebase parecem estar ausentes ou incorretas.
                        </p>
                    </div>
                </div>
                <div className="mt-6 pt-6 border-t border-[var(--border-color)] text-sm text-[var(--text-primary)] space-y-3">
                    <p className="font-medium">Para corrigir este problema, por favor:</p>
                    <ol className="list-decimal list-inside space-y-2 text-[var(--text-secondary)]">
                        <li>Abra o arquivo <code className="bg-[var(--bg-tertiary)] text-[var(--accent-color)] px-1.5 py-0.5 rounded-md text-xs">firebaseConfig.ts</code> no seu editor de código.</li>
                        <li>Substitua os valores de placeholder (ex: <code className="bg-[var(--bg-tertiary)]/50 px-1 py-0.5 rounded-md text-xs">"YOUR_API_KEY"</code>) pelas credenciais reais do seu projeto Firebase.</li>
                        <li>Você pode encontrar essas credenciais nas "Configurações do Projeto" no <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-color)] underline hover:text-[var(--accent-hover)]">Console do Firebase</a>.</li>
                    </ol>
                     <p className="text-xs text-[var(--text-secondary)] pt-2">
                        Após atualizar o arquivo, salve e a página será recarregada automaticamente.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FirebaseConfigNotice;
