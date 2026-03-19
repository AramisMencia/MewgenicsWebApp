import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

export type CatStatus = "alive" | "retired" | "dead";

export interface Cat {
    id: number;
    name: string;
    motherId?: number | null;
    fatherId?: number | null;
    status: CatStatus;
    mother?: Cat | null;
    father?: Cat | null;
}

// Tipo extendido para D3 con children
interface CatWithChildren extends Cat {
    children?: CatWithChildren[];
}

type CatNode = d3.HierarchyNode<CatWithChildren>;

const Genealogy: React.FC = () => {
    const [cats, setCats] = useState<Cat[]>([]);
    const svgRef = useRef<SVGSVGElement | null>(null);

    // Fetch gatos desde backend
    useEffect(() => {
        const fetchCats = async () => {
            try {
                const res = await fetch("/api/cats");
                const data: Cat[] = await res.json();
                setCats(data);
            } catch (error) {
                console.error("Error fetching cats:", error);
            }
        };
        fetchCats();
    }, []);

    // Actualizar estado de gato en backend
    const updateCatStatus = async (catId: number, newStatus: CatStatus) => {
        try {
            const res = await fetch(`/api/cats/${catId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) throw new Error("Failed to update cat");

            setCats(prev =>
                prev.map(cat => (cat.id === catId ? { ...cat, status: newStatus } : cat))
            );
        } catch (error) {
            console.error(error);
        }
    };

    // D3 tree render
    useEffect(() => {
        if (!cats.length || !svgRef.current) return;

        const width = 900;
        const height = 600;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove(); // Limpiar antes de render

        // Convertir lista plana a jerarquía
        const root: CatWithChildren = { id: 0, name: "Raíz", status: "alive", children: [] };
        const idToNode: Record<number, CatWithChildren> = {};

        cats.forEach(cat => {
            idToNode[cat.id] = { ...cat, children: [] };
        });

        cats.forEach(cat => {
            const parentId = cat.motherId ?? cat.fatherId;
            if (parentId && idToNode[parentId]) {
                idToNode[parentId].children!.push(idToNode[cat.id]);
            } else {
                root.children!.push(idToNode[cat.id]);
            }
        });

        const d3Root = d3.hierarchy<CatWithChildren>(root, d => d.children);
        const treeLayout = d3.tree<CatWithChildren>().size([width - 100, height - 100]);
        treeLayout(d3Root);

        // Links
        svg
            .append("g")
            .selectAll("line")
            .data(d3Root.links())
            .join("line")
            .attr("x1", d => (d.source.x ?? 0) + 50)  // fallback 0 si undefined
            .attr("y1", d => (d.source.y ?? 0) + 50)
            .attr("x2", d => (d.target.x ?? 0) + 50)
            .attr("y2", d => (d.target.y ?? 0) + 50)
            .attr("stroke", "#999");

        // Nodos
        const nodes = svg
            .append("g")
            .selectAll("g")
            .data(d3Root.descendants())
            .join("g")
            .attr("transform", d => `translate(${d.x ?? 0 + 50},${d.y ?? 0 + 50})`);

        nodes
            .append("circle")
            .attr("r", 20)
            .attr("fill", d => {
                if (d.data.status === "retired") return "#a0aec0"; // gris
                if (d.data.status === "dead") return "#e53e3e"; // rojo
                return "#48bb78"; // verde
            })
            .attr("stroke", "#333");

        // Corona si retired
        nodes
            .filter(d => d.data.status === "retired")
            .append("text")
            .text("👑")
            .attr("y", -30)
            .attr("text-anchor", "middle");

        // Nombre del gato
        nodes
            .append("text")
            .text(d => d.data.name)
            .attr("y", 5)
            .attr("text-anchor", "middle")
            .attr("fill", "#000");

        // Dropdown para cambiar estado
        nodes
            .append("foreignObject")
            .attr("x", -40)
            .attr("y", 25)
            .attr("width", 80)
            .attr("height", 30)
            .append("xhtml:select")
            .on("change", (event: Event, d: CatNode) => {
                const target = event.target as HTMLSelectElement;
                const newStatus = target.value as CatStatus;
                updateCatStatus(d.data.id, newStatus);
            })
            .selectAll("option")
            .data(["alive", "retired", "dead"])
            .join("option")
            .attr("value", d => d)
            .text(d => d)
            .property("selected", d => d === d3Root.data.status);

    }, [cats]);

    return (
        <div className="overflow-auto">
            <svg ref={svgRef} width={900} height={600} className="border" />
        </div>
    );
};

export default Genealogy;