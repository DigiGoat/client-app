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
}>;
export type GoatType = 'doe' | 'buck' | 'related';
export type Kidding = Partial<{
  dam: string;
  sire: string;
  exposed: string;
  due: string;
  kidded: string;
  description: string;
}>;
