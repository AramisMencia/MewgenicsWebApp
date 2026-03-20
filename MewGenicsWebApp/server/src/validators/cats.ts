import { z } from "zod";

export const statsSchema = z.object({
  strength: z.number().int().min(-10).max(100),
  dexterity: z.number().int().min(-10).max(100),
  constitution: z.number().int().min(-10).max(100),
  intelligence: z.number().int().min(-10).max(100),
  agility: z.number().int().min(-10).max(100),
  charisma: z.number().int().min(-10).max(100),
  luck: z.number().int().min(-10).max(100),
});

export const catCreateSchema = z.object({
  name: z.string().min(1).max(50),
  gender: z.enum(["male", "female", "unknown"]),
  orientation: z.enum(["hetero", "homo", "bi"]),
  color: z.string().regex(/^#([0-9a-fA-F]{6})$/),
  worldId: z.string(),
  motherId: z.number().int().optional().nullable(),
  fatherId: z.number().int().optional().nullable(),
  stats: statsSchema
});