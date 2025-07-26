import { PrayerListType, ArchivedCardType, AppData } from '../types';

// --- Helper para converter strings de data do JSON para objetos Date ---
const parseDates = (data: AppData): AppData => {
    const lists = data.prayerLists || [];
    const archived = data.archivedCards || [];

    const parsedLists = lists.map((list: any) => ({
        ...list,
        createdAt: new Date(list.createdAt),
        cards: (list.cards || []).map((card: any) => ({
            ...card,
            createdAt: new Date(card.createdAt),
        }))
    }));

    const parsedArchived = archived.map((card: any) => ({
        ...card,
        createdAt: new Date(card.createdAt),
        archivedAt: new Date(card.archivedAt),
    }));

    return { prayerLists: parsedLists, archivedCards: parsedArchived };
};


/**
 * Carrega os dados da aplicação a partir do backend da Vercel.
 *
 * @returns Uma promessa que resolve com os dados da aplicação.
 */
export const loadData = async (): Promise<AppData> => {
    console.log("ApiService: Carregando dados do backend Vercel...");
    try {
        const response = await fetch('/api/data');
        if (!response.ok) {
            throw new Error(`A requisição da API falhou com status ${response.status}`);
        }
        const data = await response.json();
        return parseDates(data);
    } catch (e) {
        console.error("Falha ao carregar dados do backend:", e);
        // Retorna um estado vazio em caso de erro para não quebrar a aplicação
        return { prayerLists: [], archivedCards: [] };
    }
};

/**
 * Salva os dados da aplicação no backend da Vercel.
 *
 * @param data Os dados completos da aplicação para salvar.
 * @returns Uma promessa que resolve quando a operação de salvar for concluída.
 */
export const saveData = async (data: AppData): Promise<void> => {
    console.log("ApiService: Salvando dados no backend Vercel...");
    try {
        const response = await fetch('/api/data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`Falha ao salvar dados no backend. Status: ${response.status}`, errorBody);
        }
    } catch (e) {
        console.error("Falha de rede ao salvar dados no backend:", e);
        // A falha aqui é tratada silenciosamente para não interromper a UX,
        // mas em um app de produção, seria bom ter um sistema de retry ou notificação.
    }
};
