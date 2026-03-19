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
      className={`p-3 mb-2 border rounded cursor-pointer transition bg-gray-900 text-white${
        selected ? "bg-blue-100 border-blue-400 bg-gray-300 text-black" : "bg-white hover:bg-gray-100 hover:text-black"
      }`}
    >
      <div className="font-semibold">
        {match.cat1.name} × {match.cat2.name}
      </div>
      <div className="text-sm text-gray-600">Score: {match.score}</div>
    </div>
  );
};

export default MatchCard;