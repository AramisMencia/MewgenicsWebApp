import React, { useState } from "react";
import type { Cat, CatStats } from "../Types/Cats";

export default function CreateCat() {
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Cat["gender"]>("unknown");
  const [color, setColor] = useState("");
  const [stats, setStats] = useState<CatStats>({
    strength: 5, dexterity: 5, constitution: 5,
    intelligence: 5, agility: 5, charisma: 5, luck: 5
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/cats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, gender, color, stats })
      });
      const data = await res.json();
      console.log("Created cat", data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleStatChange = (key: keyof CatStats, value: number) => {
    setStats(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Nuevo Gato</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <input
          className="w-full border rounded px-2 py-1"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="w-full border rounded px-2 py-1"
          placeholder="Color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
        <select
          className="w-full border rounded px-2 py-1"
          value={gender}
          onChange={(e) => setGender(e.target.value as Cat["gender"])}
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="unknown">Unknown</option>
        </select>

        <div className="grid grid-cols-2 gap-2">
          {Object.keys(stats).map(key => (
            <div key={key}>
              <label className="block text-sm">{key}</label>
              <input
                type="number"
                min={0}
                max={10}
                value={stats[key as keyof CatStats]}
                onChange={(e) => handleStatChange(key as keyof CatStats, Number(e.target.value))}
                className="w-full border rounded px-2 py-1"
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Crear
        </button>
      </form>
    </div>
  );
}