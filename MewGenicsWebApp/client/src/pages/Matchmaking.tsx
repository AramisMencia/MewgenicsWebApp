import React, { useEffect, useState } from "react";
import type { Match } from "../Types/Cats";
import MatchCard from "../components/MatchCard";
import CheckboxGroup from "../components/CheckboxGroup";

const statsKeys: (keyof Match["predictedChild"])[] = [
  "strength", "dexterity", "constitution", "intelligence", "agility", "charisma", "luck"
];

const ITEMS_PER_PAGE = 10;

export default function Matchmaking() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [allowInbreeding, setAllowInbreeding] = useState(false);
  const [priorityStats, setPriorityStats] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchMatches = async () => {
      const params = new URLSearchParams();
      if (allowInbreeding) params.append("allowInbreeding", "true");
      if (priorityStats.length) params.append("priority", priorityStats.join(","));
      const res = await fetch(`/api/cats/matchmaking?${params.toString()}`);
      const data: Match[] = await res.json();
      setMatches(data);
      setSelectedMatch(data[0] ?? null);
      setCurrentPage(1); // reset page al cambiar filtros
    };
    fetchMatches();
  }, [allowInbreeding, priorityStats]);

  const totalPages = Math.ceil(matches.length / ITEMS_PER_PAGE);
  const pagedMatches = matches.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* FILTROS (SIEMPRE FIJOS) */}
      <div className="flex flex-wrap gap-4 p-4 border-b border-gray-700 flex-shrink-0">
        <label className="flex items-center space-x-1">
          <input
            type="checkbox"
            checked={allowInbreeding}
            onChange={(e) => setAllowInbreeding(e.target.checked)}
            className="accent-amber-500"
          />
          <span>Allow Inbreeding</span>
        </label>

        <div>
          <span className="font-semibold mr-2">Prioritize Stats:</span>
          <CheckboxGroup
            options={statsKeys}
            selected={priorityStats}
            onChange={setPriorityStats}
          />
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="flex flex-1 overflow-hidden">
        {/* IZQUIERDA */}
        <div className="w-1/3 border-r border-gray-700 flex flex-col">
          {/* LISTA (SCROLL REAL) */}
          <div className="flex-1 overflow-y-auto p-4">
            {pagedMatches.map((m) => (
              <MatchCard
                key={`${m.cat1.id}-${m.cat2.id}`}
                match={m}
                onClick={() => setSelectedMatch(m)}
                selected={selectedMatch === m}
              />
            ))}
          </div>

          {/* PAGINACION (SIEMPRE VISIBLE) */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 p-2 border-t border-gray-700 flex-shrink-0 bg-gray-900">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded ${currentPage === i + 1
                      ? "bg-amber-600 text-black"
                      : "bg-gray-700 hover:bg-gray-600"
                    }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* DERECHA */}
        <div className="w-2/3 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            {selectedMatch ? (
              <>
                <h2 className="text-xl font-bold mb-2">
                  {selectedMatch.cat1.name} × {selectedMatch.cat2.name}
                </h2>

                <div className="mb-2">Score: {selectedMatch.score}</div>

                <div className="mb-2">
                  {selectedMatch.reasons.map((r, i) => (
                    <div key={i} className="text-sm">
                      - {r}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  {statsKeys.map((stat) => {
                    const improvement = selectedMatch.improvements.find(
                      (i) => i.stat === stat
                    );
                    const isPriority = priorityStats.includes(stat);

                    return (
                      <div
                        key={stat}
                        className={`p-2 border rounded ${improvement ? "bg-gray-400 text-black" : ""
                          } ${isPriority
                            ? "border-amber-600 outline-2 outline-offset-2"
                            : ""
                          }`}
                      >
                        <div className="font-semibold">{stat}</div>
                        <div>
                          {selectedMatch.predictedChild[stat]}
                          {improvement
                            ? ` (+${improvement.improvement})`
                            : ""}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div>No match selected</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}