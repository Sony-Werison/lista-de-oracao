export interface PrayerCardType {
  id: string;
  title: string;
  description: string;
  isAnswered: boolean;
  createdAt: Date;
  person?: string;
}

export interface ArchivedCardType extends PrayerCardType {
  listId: string;
  listTitle: string;
  archivedAt: Date;
}

export interface PrayerListType {
  id: string;
  title: string;
  createdAt: Date;
  cards: PrayerCardType[];
  isCompleted: boolean;
}

export interface Diary {
  id: string;
  name: string;
  type: 'personal' | 'shared';
}

export interface User {
  uid: string;
  email: string | null;
  diaries: Diary[];
}

export type ViewType = 'columns' | 'list' | 'graph' | 'person' | 'archive';

export type Theme = 'light' | 'dark';

export type SortKey = 'name' | 'count';

export interface AppData {
    prayerLists: PrayerListType[];
    archivedCards: ArchivedCardType[];
}