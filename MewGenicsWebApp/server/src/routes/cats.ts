import { Router } from "express";
import { prisma } from "../prisma";
import { Cat } from "@prisma/client";

const router = Router();



// Validaciones de género para padres
const canBeMother = (cat: Cat) =>
    cat.gender === "female" || cat.gender === "unknown";

const canBeFather = (cat: Cat) =>
    cat.gender === "male" || cat.gender === "unknown";

// Crear ruta post para crear un nuevo gato
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

    // Validacion basica
    if (motherId && fatherId && motherId === fatherId) {
        return res.status(400).json({
            error: "Parents must be different"
        });
    }

    try {
        // Validacion de existencia y género de padres
        const parentIds = [motherId, fatherId].filter(Boolean);

        let mother: Cat | undefined;
        let father: Cat | undefined;

        if (parentIds.length > 0) {
            const parents = await prisma.cat.findMany({
                where: {
                    id: { in: parentIds }
                }
            });

            mother = parents.find((p: Cat) => p.id === motherId);
            father = parents.find((p: Cat) => p.id === fatherId);

            if (motherId && !mother) {
                return res.status(400).json({ error: "Mother not found" });
            }

            if (fatherId && !father) {
                return res.status(400).json({ error: "Father not found" });
            }

            if (mother && !canBeMother(mother)) {
                return res.status(400).json({
                    error: "Invalid mother"
                });
            }

            if (father && !canBeFather(father)) {
                return res.status(400).json({
                    error: "Invalid father"
                });
            }
        }

        // Crear gato
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
                stats: true,
                mother: true,
                father: true
            }
        });

        res.json(newCat);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error creating cat" });
    }
});

// Obtener todos los gatos
router.get("/", async (req, res) => {
    const cats = await prisma.cat.findMany({
        include: {
            stats: true,
            mother: true,
            father: true
        }
    });

    res.json(cats);
});

// Obtener gato por ID
router.get("/:id", async (req, res) => {
    const id = Number(req.params.id);

    const cat = await prisma.cat.findUnique({
        where: { id },
        include: {
            stats: true,
            mother: true,
            father: true
        }
    });

    if (!cat) {
        return res.status(404).json({ error: "Gato no encontrado" });
    }

    res.json(cat);
});

const getInbreedingPenalty = (a: any, b: any) => {
    // ❌ mismo gato
    if (a.id === b.id) return -100;

    // ❌ padre/hijo
    if (
        a.mother_id === b.id ||
        a.father_id === b.id ||
        b.mother_id === a.id ||
        b.father_id === a.id
    ) return -80;

    // ❌ hermanos (comparten madre o padre)
    if (
        (a.mother_id && a.mother_id === b.mother_id) ||
        (a.father_id && a.father_id === b.father_id)
    ) return -50;

    // ⚠️ abuelo/nieto (simple)
    if (
        a.mother?.mother_id === b.id ||
        a.mother?.father_id === b.id ||
        a.father?.mother_id === b.id ||
        a.father?.father_id === b.id ||
        b.mother?.mother_id === a.id ||
        b.mother?.father_id === a.id ||
        b.father?.mother_id === a.id ||
        b.father?.father_id === a.id
    ) return -30;

    return 0;
};

router.get("/matchmaking", async (req, res) => {
    try {
        const cats = await prisma.cat.findMany({
            where: {
                status: {
                    not: "dead"
                }
            },
            include: {
                stats: true,
                mother: true,
                father: true
            }
        });

        const statKeys = [
            "strength",
            "dexterity",
            "constitution",
            "intelligence",
            "agility",
            "charisma",
            "luck"
        ] as const;

        type StatKey = typeof statKeys[number];

        type Stats = {
            strength: number;
            dexterity: number;
            constitution: number;
            intelligence: number;
            agility: number;
            charisma: number;
            luck: number;
        };

        const calculateScore = (a: Stats, b: Stats) => {
            let score = 0;
            const reasons: string[] = [];

            for (const key of statKeys) {
                const statA = a[key];
                const statB = b[key];

                const avg = (statA + statB) / 2;
                const diff = Math.abs(statA - statB);

                const complementBonus = Math.min(diff, 10) * 0.5;

                const totalStatScore = avg + complementBonus;
                score += totalStatScore;

                // Generar razones para cada stat

                if (avg > 7) {
                    reasons.push(`High ${key}`);
                }

                if (diff >= 5) {
                    reasons.push(`${key} is complementary`);
                }
            }

            return { score, reasons };
        };

        const results = [];

        for (let i = 0; i < cats.length; i++) {
            for (let j = i + 1; j < cats.length; j++) {
                const catA = cats[i];
                const catB = cats[j];

                const statsA = catA.stats;
                const statsB = catB.stats;

                if (!statsA || !statsB) continue;

                // Evitar mismo genero (a menos que sea unknown)
                if (
                    catA.gender === catB.gender &&
                    catA.gender !== "unknown"
                ) continue;

                // Evitar parentesco cercano
                if (
                    catA.id === catB.id ||
                    catA.motherId === catB.id ||
                    catA.fatherId === catB.id ||
                    catB.motherId === catA.id ||
                    catB.fatherId === catA.id
                ) continue;

                const result = calculateScore(statsA as Stats, statsB as Stats);
                const penalty = getInbreedingPenalty(catA, catB);

                const score = result.score + penalty;

                let reasons = [...result.reasons];

                if (penalty === 0) {
                    reasons.push("No close relation");
                } else if (penalty <= -80) {
                    reasons.push("Direct relation (bad)");
                } else if (penalty <= -50) {
                    reasons.push("Sibling relation");
                } else if (penalty <= -30) {
                    reasons.push("Distant relation");
                }

                //Eliminar duplicados en razones
                reasons = [...new Set(reasons)];

                results.push({
                    cat1: { id: catA.id, name: catA.name, gender: catA.gender },
                    cat2: { id: catB.id, name: catB.name, gender: catB.gender },
                    score,
                    reasons
                });
            }
        }

        results.sort((a, b) => b.score - a.score);

        res.json(results.slice(0, 10));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Matchmaking failed" });
    }
});


export default router;