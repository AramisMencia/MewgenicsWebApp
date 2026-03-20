import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import {
    graphStratify,
    sugiyama,
    layeringSimplex,
    decrossOpt,
    coordCenter
} from "d3-dag";

import type { Cat, CatStatus } from "../Types/Cats";
import { API_URL, getWorldId } from "../config";

const worldId = getWorldId();

const Genealogy: React.FC = () => {
    const [cats, setCats] = useState<Cat[]>([]);
    const svgRef = useRef<SVGSVGElement | null>(null);
    const zoomRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);
    console.log("API_URL:", API_URL);

    // FETCH
    useEffect(() => {
        const fetchCats = async () => {
            const res = await fetch((`${API_URL}/cats?worldId=${worldId}`));
            const data: Cat[] = await res.json();
            setCats(data);
        };
        fetchCats();
    }, []);

    // UPDATE STATUS
    const updateCatStatus = async (catId: number, newStatus: CatStatus) => {
        await fetch(`${API_URL}/cats/${catId}?worldId=${worldId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
        });

        setCats(prev =>
            prev.map(cat =>
                cat.id === catId ? { ...cat, status: newStatus } : cat
            )
        );
    };

    useEffect(() => {
        if (!cats.length || !svgRef.current) return;

        const getNodeWidth = (name: string) => {
            return Math.max(80, name.length * 8 + 40);
        };

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const g = svg.append("g");

        // Conversion a Dag
        const dagData = cats.map(cat => ({
            id: String(cat.id),
            parentIds: [
                ...(cat.motherId ? [String(cat.motherId)] : []),
                ...(cat.fatherId ? [String(cat.fatherId)] : [])
            ],
            data: cat // 👈 GUARDAMOS EL CAT ACÁ
        }));

        // Dag stratify
        const dag = graphStratify()(dagData);

        // Layout
        const layout = sugiyama()
            .layering(layeringSimplex())
            .decross(decrossOpt())
            .coord(coordCenter())
            .nodeSize([180, 160]);

        layout(dag);

        //Types

        type DagLink = {
            source: DagNode;
            target: DagNode;
        };

        type DagNode = {
            id: string;
            x: number;
            y: number;
        };

        const nodesArray = Array.from(dag.nodes()) as unknown as DagNode[];
        const linksArray = Array.from(dag.links()) as unknown as DagLink[];

        // Centrar el grafo
        const width = svgRef.current.clientWidth;

        const minX = d3.min(nodesArray, d => d.x) ?? 0;
        const maxX = d3.max(nodesArray, d => d.x) ?? 0;

        const offsetX = width / 2 - (minX + maxX) / 2;

        nodesArray.forEach((n: DagNode) => {
            n.x += offsetX;
            n.y += 80;
        });

        // Links
        g.append("g")
            .selectAll("path")
            .data(linksArray)
            .join("path")
            .attr("d", (d: DagLink) =>
                `M ${d.source.x},${d.source.y} L ${d.target.x},${d.target.y}`
            )
            .attr("stroke", "#888")
            .attr("fill", "none");

        // Nodos
        const nodes = g.append("g")
            .selectAll("g")
            .data(nodesArray)
            .join("g")
            .attr("transform", (d: DagNode) =>
                `translate(${d.x},${d.y})`
            );

        const nodeHeight = 100;

        nodes.each(function (node: any) {
            const cat = node.data.data as Cat;
            if (!cat) return;

            const nodeWidth = getNodeWidth(cat.name);


            const group = d3.select(this);

            //Rectangulos
            // Rectangulo principal
            group.append("rect")
                .attr("x", -nodeWidth / 2)
                .attr("y", -nodeHeight / 2)
                .attr("width", nodeWidth)
                .attr("height", nodeHeight)
                .attr("rx", 10)
                .attr("fill", cat.color || "#888")
                .attr("stroke", "#222");

            // Icono de estado
            group.append("text")
                .text(
                    cat.status === "alive" ? "❤️" :
                        cat.status === "retired" ? "👑" : "💀"
                )
                .attr("text-anchor", "middle")
                .attr("y", -nodeHeight / 2 + 18)
                .attr("font-size", "18px");

            // Rect nombre
            group.append("rect")
                .attr("x", -nodeWidth / 2 + 8)
                .attr("y", -nodeHeight / 2 + 28)
                .attr("width", nodeWidth - 16)
                .attr("height", 24)
                .attr("rx", 6)
                .attr("fill", "#e5e7eb")
                .attr("stroke", "#999");

            // Texto nombre
            group.append("text")
                .text(cat.name)
                .attr("text-anchor", "middle")
                .attr("y", -nodeHeight / 2 + 45)
                .attr("fill", "#000")
                .attr("font-size", "13px")
                .attr("font-weight", "bold");

            // Dropdown de estado
            group.append("foreignObject")
                .attr("x", -nodeWidth / 2 + 8)
                .attr("y", -nodeHeight / 2 + 58)
                .attr("width", nodeWidth - 16)
                .attr("height", 26)
                .append("xhtml:select")
                .attr("class", "w-full bg-gray-800 text-white rounded text-xs border border-gray-600 px-1")
                .on("change", (event: Event) => {
                    const target = event.target as HTMLSelectElement;
                    updateCatStatus(cat.id, target.value as CatStatus);
                })
                .selectAll("option")
                .data(["alive", "retired", "dead"])
                .join("option")
                .attr("value", d => d)
                .text(d => d)
                .property("selected", d => d === cat.status);
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
        <div className="w-full h-full overflow-hidden bg-gray-900">
            <svg ref={svgRef} className="w-full h-full" />
        </div>
    );
};

export default Genealogy;