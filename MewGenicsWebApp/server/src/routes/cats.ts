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

const getInbreedingPenalty = (a: any, b: any) => {
    // mismo gato
    if (a.id === b.id) return -100;

    // padre/hijo
    if (
        a.motherId === b.id ||
        a.fatherId === b.id ||
        b.motherId === a.id ||
        b.fatherId === a.id
    ) return -80;

    // hermanos
    if (
        (a.motherId && a.motherId === b.motherId) ||
        (a.fatherId && a.fatherId === b.fatherId)
    ) return -50;

    // abuelos
    if (
        a.mother?.motherId === b.id ||
        a.mother?.fatherId === b.id ||
        a.father?.motherId === b.id ||
        a.father?.fatherId === b.id ||
        b.mother?.motherId === a.id ||
        b.mother?.fatherId === a.id ||
        b.father?.motherId === a.id ||
        b.father?.fatherId === a.id
    ) return -30;

    return 0;
};


router.get("/matchmaking", async (req, res) => {

    //Inicio del endpoint de matchmaking
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

    // Dentro del endpoint de matchmaking

    const allowInbreeding = req.query.allowInbreeding === "true";

    const priorityParams = req.query.priority as string | undefined;

    const validStats = statKeys as readonly string[];

    const priorities = priorityParams ? priorityParams.split(",").filter(p => validStats.includes(p)) : [];


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

        type Stats = {
            strength: number;
            dexterity: number;
            constitution: number;
            intelligence: number;
            agility: number;
            charisma: number;
            luck: number;
        };

        const BASELINE = 5;

        const calculateScore = (
            a: Stats,
            b: Stats,
            priorities: readonly string[]
        ) => {
            let score = 0;
            const reasons: string[] = [];

            for (const key of statKeys) {
                const statA = a[key];
                const statB = b[key];

                const max = Math.max(statA, statB);
                const min = Math.min(statA, statB);

                const improvement = max - 5;
                const boost = max - min;

                // multiplicador si es prioridad
                const isPriority = priorities.includes(key);
                const multiplier = isPriority ? 2 : 1;

                // score de base
                if (max > 5) {
                    score += improvement * 2 * multiplier;
                }

                score += boost * 1.5 * multiplier;

                if (max < 5) {
                    score -= (5 - max) * 2;
                }

                // razones para el matchmaking

                if (boost >= 1) {
                    reasons.push(
                        isPriority
                            ? `${key} improves by +${boost} (PRIORITY)`
                            : `${key} improves by +${boost}`
                    );
                }

                if (max >= 6) {
                    reasons.push(
                        isPriority
                            ? `${key} reaches strong value (${max}) (PRIORITY)`
                            : `${key} reaches strong value (${max})`
                    );
                }

                if (max < 5) {
                    reasons.push(`${key} is weak in both parents`);
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


                const penalty = getInbreedingPenalty(catA, catB);

                if (!allowInbreeding && penalty < 0) continue;

                const result = calculateScore(statsA as Stats, statsB as Stats, priorities);

                const score = result.score + penalty;

                let reasons = [...result.reasons];

                const predictChild = (a: Stats, b: Stats): Stats => {
                    const result = {} as Stats;

                    for (const key of statKeys) {
                        result[key] = Math.max(a[key], b[key]);
                    }

                    return result;
                };

                const predictedChild = predictChild(statsA as Stats, statsB as Stats);

                const improvements = statKeys
                    .filter(key => {
                        const max = Math.max(statsA[key], statsB[key]);
                        const min = Math.min(statsA[key], statsB[key]);

                        return max > min; // hay mejora genética
                    })
                    .map(key => {
                        const max = Math.max(statsA[key], statsB[key]);
                        const min = Math.min(statsA[key], statsB[key]);

                        return {
                            stat: key,
                            improvement: max - min
                        };
                    });

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
                    penalty,
                    reasons,
                    predictedChild,
                    improvements
                });
            }
        }

        results.sort((a, b) => b.score - a.score);

        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Matchmaking failed" });
    }
});


// Obtener el json exportado
router.get("/export", async (req, res) => {
    const cats = await prisma.cat.findMany({
        include: {
            stats: true,
            mother: true,
            father: true,
            abilities: true
        }
    });

    res.json(cats);
});

// Subir Json valido
router.post("/import", async (req, res) => {
    const data = req.body;

    try {
        // Borrar todo lo existente
        await prisma.catAbility.deleteMany();
        await prisma.catStats.deleteMany();
        await prisma.cat.deleteMany();

        // Crear nuevos registros

        const idMap = new Map<number, number>();


        for (const cat of data) {
            const created = await prisma.cat.create({
                data: {
                    name: cat.name,
                    gender: cat.gender,
                    orientation: cat.orientation,
                    color: cat.color,
                    status: cat.status,
                    inbreeding_level: cat.inbreeding_level,
                    stats: {
                        create: {
                            strength: cat.stats.strength,
                            dexterity: cat.stats.dexterity,
                            constitution: cat.stats.constitution,
                            intelligence: cat.stats.intelligence,
                            agility: cat.stats.agility,
                            charisma: cat.stats.charisma,
                            luck: cat.stats.luck
                        }
                    }
                }
            });
            idMap.set(cat.id, created.id);
        }
        // Actualizar relaciones de padres e hijos
        for (const cat of data) {
            const newId = idMap.get(cat.id);

            await prisma.cat.update({
                where: { id: newId },
                data: {
                    motherId: cat.motherId ? idMap.get(cat.motherId) : null,
                    fatherId: cat.fatherId ? idMap.get(cat.fatherId) : null
                }
            });
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Import failed" });
    }
});

// Obtener gato por ID
router.get("/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
    }

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

// Actualizar estado de un gato
router.put("/:id", async (req, res) => {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (!["alive", "retired", "dead"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
    }

    try {
        const updatedCat = await prisma.cat.update({
            where: { id },
            data: { status },
        });

        res.json(updatedCat);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update cat" });
    }
});

export default router;