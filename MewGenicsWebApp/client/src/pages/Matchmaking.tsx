import React, { useEffect, useState } from "react";
import type { Match } from "../Types/Cats";
import MatchCard from "../components/MatchCard";
import CheckboxGroup from "../components/CheckboxGroup";

const statsKeys: (keyof Match["predictedChild"])[] = [
  "strength","dexterity","constitution","intelligence","agility","charisma","luck"
];

export default function Matchmaking() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [allowInbreeding, setAllowInbreeding] = useState(false);
  const [priorityStats, setPriorityStats] = useState<string[]>([]);

  useEffect(() => {
    const fetchMatches = async () => {
      const params = new URLSearchParams();
      if (allowInbreeding) params.append("allowInbreeding", "true");
      if (priorityStats.length) params.append("priority", priorityStats.join(","));
      const res = await fetch(`/api/cats/matchmaking?${params.toString()}`);
      const data: Match[] = await res.json();
      setMatches(data);
      setSelectedMatch(data[0] ?? null);
    };
    fetchMatches();
  }, [allowInbreeding, priorityStats]);

  return (
    <div className="flex flex-col">
      {/* SUBBAR */}
      <div className="flex flex-wrap gap-4 p-4 border-b">
        <label className="flex items-center space-x-1">
          <input type="checkbox" checked={allowInbreeding} onChange={(e) => setAllowInbreeding(e.target.checked)} />
          <span>Allow Inbreeding</span>
        </label>

        <div>
          <span className="font-semibold mr-2">Prioritize Stats:</span>
          <CheckboxGroup options={statsKeys} selected={priorityStats} onChange={setPriorityStats} />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Panel izquierdo */}
        <div className="w-1/3 border-r overflow-y-auto p-4">
          {matches.map((m) => (
            <MatchCard
              key={`${m.cat1.id}-${m.cat2.id}`}
              match={m}
              onClick={() => setSelectedMatch(m)}
              selected={selectedMatch === m}
            />
          ))}
        </div>

        {/* Panel derecho */}
        <div className="w-2/3 overflow-auto p-4">
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
                  const improvement = selectedMatch.improvements.find(i => i.stat === stat);
                  const isPriority = priorityStats.includes(stat);
                  return (
                    <div key={stat} className={`p-2 border rounded ${improvement ? "bg-gray-400 text-black" : ""} ${isPriority ? "border-amber-600 outline-2 outline-offset-2" : ""}`}>
                      <div className="font-semibold">{stat}</div>
                      <div>
                        {selectedMatch.predictedChild[stat]}
                        {improvement ? ` (+${improvement.improvement})` : ""}
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
  );
}