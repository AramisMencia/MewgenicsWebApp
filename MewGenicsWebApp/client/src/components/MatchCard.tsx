import React from "react";
import type { Match } from "../Types/Cats";

interface Props {
  match: Match;
  onClick: () => void;
  selected?: boolean;
}

const MatchCard: React.FC<Props> = ({ match, onClick, selected }) => {
  return (
    <div
      onClick={onClick}
      className={`p-3 mb-2 border rounded cursor-pointer transition ${selected
          ? "bg-gray-300 border-blue-500 text-black"
          : "bg-gray-900 text-white hover:bg-gray-700"
        }`}    >
      <div className="font-semibold">
        {match.cat1.name} × {match.cat2.name}
      </div>
      <div className="text-sm text-gray-600">Score: {match.score}</div>
    </div>
  );
};

export default MatchCard;