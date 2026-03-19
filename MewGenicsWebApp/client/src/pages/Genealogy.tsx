import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import type { Cat, CatStatus } from "../Types/Cats";

interface CatWithChildren extends Cat {
    children?: CatWithChildren[];
}

type CatNode = d3.HierarchyNode<CatWithChildren>;

const Genealogy: React.FC = () => {
    const [cats, setCats] = useState<Cat[]>([]);
    const svgRef = useRef<SVGSVGElement | null>(null);
    const gRef = useRef<SVGGElement | null>(null);

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

    // D3 tree render con zoom y drag
    useEffect(() => {
        if (!cats.length || !svgRef.current) return;

        const width = svgRef.current.clientWidth;
        const height = svgRef.current.clientHeight;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove(); // limpiar

        // Grupo para zoom
        const g = svg.append("g");
        gRef.current = g.node() as SVGGElement; // opcional si quieres guardar la referencia en React

        // Convertir lista plana a jerarquía
        const root: CatWithChildren = {
            id: 0,
            name: "Raíz",
            gender: "unknown",
            orientation: "hetero",
            color: "#ffffff",
            status: "alive",
            children: []
        };
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
        const treeLayout = d3.tree<CatWithChildren>().size([width, height]);
        treeLayout(d3Root);

        // Links
        g.append("g")
            .selectAll("line")
            .data(d3Root.links())
            .join("line")
            .attr("x1", d => d.source.x ?? 0)
            .attr("y1", d => d.source.y ?? 0)
            .attr("x2", d => d.target.x ?? 0)
            .attr("y2", d => d.target.y ?? 0)
            .attr("stroke", "#999");

        // Nodos
        const nodes = g.append("g")
            .selectAll("g")
            .data(d3Root.descendants())
            .join("g")
            .attr("transform", d => `translate(${d.x},${d.y})`);

        const nodeWidth = 80;
        const nodeHeight = 40;

        // Rectángulos
        nodes.append("rect")
            .attr("x", -nodeWidth / 2)
            .attr("y", -nodeHeight / 2)
            .attr("width", nodeWidth)
            .attr("height", nodeHeight)
            .attr("rx", 8)
            .attr("ry", 8)
            .attr("fill", d => {
                if (d.data.status === "alive") return "#48bb78";   // verde
                if (d.data.status === "retired") return "#ffffff"; // blanco
                return "#4a5568"; // gris oscuro
            })
            .attr("stroke", "#333");

        // Nombre
        nodes.append("text")
            .text(d => d.data.name)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("fill", d => d.data.status === "retired" ? "#333" : "#fff")
            .attr("font-size", "12px")
            .style("pointer-events", "none"); // evitar bloquear el dropdown

        // Dropdown
        nodes.append("foreignObject")
            .attr("x", -40)
            .attr("y", 25)
            .attr("width", 80)
            .attr("height", 30)
            .append("xhtml:select")
            .attr("class", "w-full bg-gray-800 text-white rounded p-1 border border-gray-600")
            .on("change", (event: Event, nodeData: CatNode) => {
                const target = event.target as HTMLSelectElement;
                const newStatus = target.value as CatStatus;
                updateCatStatus(nodeData.data.id, newStatus);
            })
            .each(function (nodeData: CatNode) {
                // 'nodeData' es el nodo del gato actual
                const select = d3.select(this);
                const options = ["alive", "retired", "dead"];
                select
                    .selectAll("option")
                    .data(options)
                    .join("option")
                    .attr("value", d => d)
                    .text(d => d)
                    .property("selected", d => d === nodeData.data.status);
            });

        // Zoom + Drag
        const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.5, 3])
            .on("zoom", (event) => {
                g.attr("transform", event.transform.toString());
            });


        svg.call(zoomBehavior);

    }, [cats]);

    return (
        <div className="w-full h-full overflow-hidden flex justify-center items-center bg-gray-100">
            <svg ref={svgRef} className="border bg-gray-900 w-full h-full" />
        </div>
    );
};

export default Genealogy;