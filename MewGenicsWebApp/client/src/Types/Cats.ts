export type CatStatus = "alive" | "retired" | "dead";

export interface CatStats {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  agility: number;
  charisma: number;
  luck: number;
}

export interface Cat {
  id: number;
  name: string;
  gender: "male" | "female" | "unknown";
  orientation: "hetero" | "homo" | "bi";
  color: string;
  status: CatStatus;
  motherId?: number | null;
  fatherId?: number | null;
  stats?: CatStats;
  mother?: Cat | null;
  father?: Cat | null;
}

export interface Match {
  cat1: { id: number; name: string; gender: string };
  cat2: { id: number; name: string; gender: string };
  score: number;
  penalty: number;
  reasons: string[];
  predictedChild: CatStats;
  improvements: { stat: keyof CatStats; improvement: number }[];
}