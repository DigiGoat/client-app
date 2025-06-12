import type { LAClassifications } from 'adga';

export interface GoatService {
  getDoes: () => Promise<Goat[]>;
  setDoes: (does: Goat[]) => Promise<void>;
  onDoesChange: (callback: (does: Goat[]) => void) => void;
  getBucks: () => Promise<Goat[]>;
  setBucks: (bucks: Goat[]) => Promise<void>;
  onBucksChange: (callback: (bucks: Goat[]) => void) => void;
  getReferences: () => Promise<Goat[]>;
  setReferences: (references: Goat[]) => Promise<void>;
  onReferencesChange: (callback: (references: Goat[]) => void) => void;
  getForSale: () => Promise<Goat[]>;
  setForSale: (forSale: Goat[]) => Promise<void>;
  onForSaleChange: (callback: (forSale: Goat[]) => void) => void;
  getRelated: () => Promise<Goat[]>;
  setRelated: (related: Goat[]) => Promise<void>;
  onRelatedChange: (callback: (related: Goat[]) => void) => void;
  getKiddingSchedule: () => Promise<Kidding[]>;
  setKiddingSchedule: (kiddingSchedule: Kidding[]) => Promise<void>;
  onKiddingScheduleChange: (callback: (kiddingSchedule: Kidding[]) => void) => void;
}
export type Goat = Partial<{
  nickname: string;
  name: string;
  description: string;
  normalizeId: string;
  dateOfBirth: string;
  dateOfDeath: string | null;
  colorAndMarking: string;
  animalTattoo: { tattoo?: string; tattooLocation?: { name?: string; }; }[];
  id: number;
  sex: 'Female' | 'Male';
  damId: number;
  sireId: number;
  ownerAccount: {
    displayName?: string;
  } | null;
  linearAppraisals: Partial<{
    lactationNumber: number;
    appraisalDate: string;
    generalAppearance: LAClassifications;
    dairyStrength: LAClassifications;
    bodyCapacity: LAClassifications;
    mammarySystem: LAClassifications;
    finalScore: number;
    isPermanent: boolean;
    id: number;
  }>[];
  pet: boolean;
  price: number | string;
  awards: Partial<{
    awardCode: string;
    awardDescription: string;
    awardYear: number;
    awardCount: number;
  }>[];
  usdaId: string;
  usdaKey: number;
  lactationRecords: LactationRecord[];
}>;
export type LactationRecord = Partial<{
  startDate: string;
  isCurrent: boolean;
  daysInMilk: string;
  lactationNumber: string;
  stats: Partial<{
    milk: Partial<{
      achieved: string;
      projected: string;
    }>;
    butterfat: Partial<{
      achieved: string;
      projected: string;
    }>;
    protein: Partial<{
      achieved: string;
      projected: string;
    }>;
  }>;
  tests: Partial<{
    testNumber: number;
    daysInMilk: string;
    milk: string;
    butterfatPct: string;
    proteinPct: string;
    testDate: string;
  }>[];
}>;

export type GoatType = 'doe' | 'buck' | 'reference' | 'related' | 'for-sale';
export type Kidding = Partial<{
  dam: string;
  sire: string;
  exposed: string;
  due: string;
  kidded: string;
  description: string;
}>;
