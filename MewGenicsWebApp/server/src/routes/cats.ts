import { Router } from "express";
import { prisma } from "../prisma";

const router = Router();

// Crear gato
router.post("/", async (req, res) => {
  const {
    name,
    gender,
    orientation,
    color,
    motherId,
    fatherId,
    stats
  } = req.body;

  try {
    const newCat = await prisma.cat.create({
      data: {
        name,
        gender,
        orientation,
        color,
        inbreeding_level: 0,
        status: "alive",

        mother: motherId
          ? { connect: { id: motherId } }
          : undefined,

        father: fatherId
          ? { connect: { id: fatherId } }
          : undefined,

        stats: {
          create: {
            strength: stats.strength,
            dexterity: stats.dexterity,
            constitution: stats.constitution,
            intelligence: stats.intelligence,
            agility: stats.agility,
            charisma: stats.charisma,
            luck: stats.luck
          }
        }
      },
      include: {
        mother: true,
        father: true,
        stats: true
      }
    });

    res.json(newCat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating cat" });
  }
});

// get todos los gatos
router.get("/", async (req, res) => {
  const cats = await prisma.cat.findMany({
    include: {
      stats: true
    }
  });

  res.json(cats);
});

// get gato por id
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);

  const cat = await prisma.cat.findUnique({
    where: { id },
    include: {
      stats: true
    }
  });

  if (!cat) {
    return res.status(404).json({ error: "Gato no encontrado" });
  }

  res.json(cat);
});

export default router;