import React from "react";
import type { Cat, CatStatus } from "../Types/Cats";

interface Props {
  cat: Cat;
  onChangeStatus: (catId: number, status: CatStatus) => void;
}

const CatNode: React.FC<Props> = ({ cat, onChangeStatus }) => {
  const getBgColor = () => {
    if (cat.status === "retired") return "bg-gray-400";
    if (cat.status === "dead") return "bg-red-500";
    return "bg-green-400";
  };

  return (
    <div className="flex flex-col items-center">
      <div className={`w-20 h-20 flex items-center justify-center rounded-full border ${getBgColor()} relative`}>
        {cat.status === "retired" && <span className="absolute -top-4 text-white">👑</span>}
        <span className="text-black font-semibold">{cat.name}</span>
      </div>
      <select
        className="mt-2 border rounded px-2 py-1 text-sm"
        value={cat.status}
        onChange={(e) => onChangeStatus(cat.id, e.target.value as CatStatus)}
      >
        <option value="alive">Alive</option>
        <option value="retired">Retired</option>
        <option value="dead">Dead</option>
      </select>
    </div>
  );
};

export default CatNode;