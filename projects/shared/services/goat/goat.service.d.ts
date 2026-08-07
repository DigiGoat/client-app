import type { LAClassifications } from 'adga';

export interface GoatService {
  getDoes: () => Promise<Record<string, unknown>[]>;
  setDoes: (does: Record<string, unknown>[]) => Promise<void>;
  onDoesChange: (callback: (does: Record<string, unknown>[]) => void) => void;
  getBucks: () => Promise<Record<string, unknown>[]>;
  setBucks: (bucks: Record<string, unknown>[]) => Promise<void>;
  onBucksChange: (callback: (bucks: Record<string, unknown>[]) => void) => void;
  getReferences: () => Promise<Record<string, unknown>[]>;
  setReferences: (references: Record<string, unknown>[]) => Promise<void>;
  onReferencesChange: (callback: (references: Record<string, unknown>[]) => void) => void;
  getForSale: () => Promise<Record<string, unknown>[]>;
  setForSale: (forSale: Record<string, unknown>[]) => Promise<void>;
  onForSaleChange: (callback: (forSale: Record<string, unknown>[]) => void) => void;
  getRelated: () => Promise<Record<string, unknown>[]>;
  setRelated: (related: Record<string, unknown>[]) => Promise<void>;
  onRelatedChange: (callback: (related: Record<string, unknown>[]) => void) => void;
  getKiddingSchedule: () => Promise<Record<string, unknown>[]>;
  setKiddingSchedule: (kiddingSchedule: Record<string, unknown>[]) => Promise<void>;
  onKiddingScheduleChange: (callback: (kiddingSchedule: Record<string, unknown>[]) => void) => void;
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
