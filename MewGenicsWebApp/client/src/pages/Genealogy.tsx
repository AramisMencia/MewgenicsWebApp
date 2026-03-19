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
    const zoomRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);

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

    // D3 tree render + zoom y drag
    useEffect(() => {

        const getNodeWidth = (name: string) => {
            const base = 60;
            const charWidth = 8;
            return Math.max(base, name.length * charWidth + 40);
        };

        if (!cats.length || !svgRef.current) return;

        const width = svgRef.current.clientWidth;
        // const height = svgRef.current.clientHeight;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        // Grupo para zoom
        const g = svg.append("g");
        gRef.current = g.node() as SVGGElement;

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
        const treeLayout = d3.tree<CatWithChildren>().nodeSize([180, 140]);
        treeLayout(d3Root);

        const nodesArray = d3Root.descendants();

        // calcular límites
        const minX = d3.min(nodesArray, d => d.x) ?? 0;
        const maxX = d3.max(nodesArray, d => d.x) ?? 0;

        // centrar horizontalmente
        const offsetX = width / 2 - (minX + maxX) / 2;

        // mover todo el árbol
        nodesArray.forEach((node: d3.HierarchyNode<CatWithChildren>) => {
            node.x = (node.x ?? 0) + offsetX;
            node.y = (node.y ?? 0) + 80;
        });


        // Links
        g.append("g")
            .selectAll("line")
            .data(d3Root.links().filter(link => link.source.data.id !== 0))
            .join("line")
            .attr("x1", d => d.source.x ?? 0)
            .attr("y1", d => d.source.y ?? 0)
            .attr("x2", d => d.target.x ?? 0)
            .attr("y2", d => d.target.y ?? 0)
            .attr("stroke", "#999");

        // Nodos
        const nodes = g.append("g")
            .selectAll("g")
            .data(d3Root.descendants().slice(1))
            .join("g")
            .attr("transform", d => `translate(${d.x},${d.y})`);

        nodes.each(function (d) {
            (d as any).nodeWidth = getNodeWidth(d.data.name);
        });

        // const nodeWidth = 120;
        const nodeHeight = 100;

        // Rectángulos
        // Rectángulo principal (color del gato)
        nodes.append("rect")
            .attr("x", d => -((d as any).nodeWidth / 2))
            .attr("y", -nodeHeight / 2)
            .attr("width", d => (d as any).nodeWidth)
            .attr("height", nodeHeight)
            .attr("rx", 10)
            .attr("fill", d => d.data.color || "#888")
            .attr("stroke", "#222");

        //Rectangulo del nombre
        nodes.append("rect")
            .attr("x", d => -((d as any).nodeWidth / 2) + 8)
            .attr("y", -nodeHeight / 2 + 28)
            .attr("width", d => (d as any).nodeWidth - 16)
            .attr("height", 24)
            .attr("rx", 6)
            .attr("fill", "#f3f4f6")
            .attr("stroke", "#ccc");

        // Nombre
        nodes.append("text")
            .text(d => d.data.name)
            .attr("text-anchor", "middle")
            .attr("x", 0)
            .attr("y", -nodeHeight / 2 + 45)
            .attr("fill", "#000")
            .attr("font-size", "13px")
            .attr("font-weight", "bold");

        // icono de estado
        nodes.append("text")
            .text(d => {
                if (d.data.status === "alive") return "❤️";
                if (d.data.status === "retired") return "👑";
                return "💀";
            })
            .attr("text-anchor", "middle")
            .attr("x", 0)
            .attr("y", -nodeHeight / 2 + 18)
            .attr("font-size", "18px");


        // Dropdown
        nodes.append("foreignObject")
            .attr("x", d => -((d as any).nodeWidth / 2) + 8)
            .attr("y", -nodeHeight / 2 + 58)
            .attr("width", d => (d as any).nodeWidth - 16)
            .attr("height", 26)
            .append("xhtml:select")
            .attr("class", "w-full bg-gray-800 text-white rounded text-xs border border-gray-600 px-1")
            .on("change", (event: Event, nodeData: CatNode) => {
                const target = event.target as HTMLSelectElement;
                const newStatus = target.value as CatStatus;
                updateCatStatus(nodeData.data.id, newStatus);
            })
            .each(function (nodeData: CatNode) {
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
                zoomRef.current = event.transform;
                g.attr("transform", event.transform.toString());
            });

        svg.call(zoomBehavior);

        svg.call(zoomBehavior.transform, zoomRef.current);

    }, [cats]);

    return (
        <div className="w-full h-full overflow-hidden flex justify-center items-center bg-gray-100">
            <svg ref={svgRef} className="border bg-gray-900 w-full h-full" />
        </div>
    );
};

export default Genealogy;