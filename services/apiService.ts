import { PrayerListType, ArchivedCardType } from '../types';

// Esta interface define a forma dos dados que seu backend irá gerenciar.
export interface AppData {
    prayerLists: PrayerListType[];
    archivedCards: ArchivedCardType[];
}

const MOCK_STORAGE_KEY = 'prayer-journal-backend-mock-v1';

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
 * Carrega os dados da aplicação.
 *
 * NOTA PARA O DESENVOLVEDOR:
 * Esta é uma implementação MOCK usando localStorage para permitir que o app funcione sem um backend real.
 * Para conectar ao seu backend, substitua a lógica nesta função por uma chamada `fetch` ao seu endpoint GET.
 *
 * @returns Uma promessa que resolve com os dados da aplicação.
 */
export const loadData = async (): Promise<AppData> => {
    console.log("ApiService: Carregando dados (mock com localStorage)");
    // Simula um atraso de rede para uma experiência mais realista
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
        const rawData = localStorage.getItem(MOCK_STORAGE_KEY);
        if (!rawData) {
            return { prayerLists: [], archivedCards: [] };
        }
        const data = JSON.parse(rawData);
        return parseDates(data);
    } catch (e) {
        console.error("Falha ao carregar dados mockados do localStorage", e);
        return { prayerLists: [], archivedCards: [] };
    }
};

/**
 * Salva os dados da aplicação.
 *
 * NOTA PARA O DESENVOLVEDOR:
 * Esta é uma implementação MOCK usando localStorage.
 * Para conectar ao seu backend, substitua a lógica nesta função por uma chamada `fetch`
 * para o seu endpoint POST/PUT, enviando o objeto `data` no corpo da requisição.
 *
 * @param data Os dados completos da aplicação para salvar.
 * @returns Uma promessa que resolve quando a operação de salvar for concluída.
 */
export const saveData = async (data: AppData): Promise<void> => {
    console.log("ApiService: Salvando dados (mock com localStorage)");

    try {
        const storableData = JSON.stringify(data);
        localStorage.setItem(MOCK_STORAGE_KEY, storableData);
    } catch (e) {
        console.error("Falha ao salvar dados mockados no localStorage", e);
    }
};
