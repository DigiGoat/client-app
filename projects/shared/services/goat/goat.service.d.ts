export interface GoatService {
  getDoes: () => Promise<Goat[]>;
  setDoes: (does: Goat[]) => Promise<void>;
  onDoesChange: (callback: (does: Goat[]) => void) => void;
  getBucks: () => Promise<Goat[]>;
  setBucks: (bucks: Goat[]) => Promise<void>;
  onBucksChange: (callback: (bucks: Goat[]) => void) => void;
  getRelated: () => Promise<Goat[]>;
  setRelated: (related: Goat[]) => Promise<void>;
  onRelatedChange: (callback: (related: Goat[]) => void) => void;
}
export type Goat = Partial<{
  nickname: string;
  name: string;
  description: string;
  normalizeId: string;
  dateOfBirth: string;
  colorAndMarking: string;
  animalTattoo: { tattoo?: string; tattooLocation?: { name?: string; }; }[];
  id: number;
  sex: 'Female' | 'Male';
  damId?: number;
  sireId?: number;
}>;
export type GoatType = 'doe' | 'buck';
