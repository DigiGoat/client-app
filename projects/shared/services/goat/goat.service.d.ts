export interface GoatService {
  getDoes: () => Promise<Goat[]>;
  setDoes: (does: Goat[]) => Promise<void>;
  onDoesChange: (callback: (does: Goat[]) => void) => void;
}
export type Goat = Partial<{
  nickname: string;
  name: string;
  description: string;
  normalizeId: string;
  dateOfBirth: string;
  colorAndMarking: string;
  animalTattoo: { tattoo?: string; tattooLocation?: { name?: string; }; }[];
}>;
export type GoatType = 'doe' | 'buck';
