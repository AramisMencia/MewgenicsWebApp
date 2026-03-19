import React, { useEffect, useState } from "react";
import type { Cat, CatStats } from "../Types/Cats";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";

const defaultStats: CatStats = {
  strength: 5,
  dexterity: 5,
  constitution: 5,
  intelligence: 5,
  agility: 5,
  charisma: 5,
  luck: 5
};

export default function CreateCat() {
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Cat["gender"]>("unknown");
  const [orientation, setOrientation] = useState<Cat["orientation"]>("hetero");
  const [color, setColor] = useState("#888888");
  const navigate = useNavigate();

  const [stats, setStats] = useState<CatStats>(defaultStats);

  const [cats, setCats] = useState<Cat[]>([]);
  const [motherId, setMotherId] = useState<number | "none">("none");
  const [fatherId, setFatherId] = useState<number | "none">("none");

  const [error, setError] = useState("");

  // 🔹 fetch gatos para padres
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await fetch(`${API_URL}/cats`);
        const data = await res.json();
        setCats(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCats();
  }, []);

  const handleStatChange = (key: keyof CatStats, value: number) => {
    setStats(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const validate = () => {
    if (!name.trim()) return "El nombre es obligatorio";
    if (!color) return "El color es obligatorio";

    for (const key of Object.keys(stats)) {
      if (isNaN(stats[key as keyof CatStats])) {
        return "Todos los stats deben ser números";
      }
    }

    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");

    const payload = {
      name,
      gender,
      orientation,
      color,
      motherId: motherId === "none" ? undefined : motherId,
      fatherId: fatherId === "none" ? undefined : fatherId,
      stats
    };

    try {
      const res = await fetch(`${API_URL}/cats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Error creando gato");

      const data = await res.json();
      console.log("Created cat:", data);

      // reset form
      setName("");
      setGender("unknown");
      setOrientation("hetero");
      setColor("#888888");
      setStats(defaultStats);
      setMotherId("none");
      setFatherId("none");

      navigate("/");

    } catch (err) {
      console.error(err);
      setError("Error al crear el gato");
    }
  };

  const mothers = cats.filter(c => c.gender === "female" || c.gender === "unknown");
  const fathers = cats.filter(c => c.gender === "male" || c.gender === "unknown");

  return (
    <div className="w-full h-full flex justify-center items-start p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-gray-900 text-white p-6 rounded-xl shadow-lg space-y-6"
      >
        <h1 className="text-2xl font-bold">Crear Nuevo Gato</h1>

        {error && (
          <div className="bg-red-500 text-white p-2 rounded">
            {error}
          </div>
        )}

        {/* Nombre */}
        <input
          className="w-full p-2 rounded bg-gray-800 border border-gray-600"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* Género + Orientación */}
        <div className="grid grid-cols-2 gap-4">
          <select
            className="p-2 rounded bg-gray-800 border border-gray-600"
            value={gender}
            onChange={(e) => setGender(e.target.value as Cat["gender"])}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="unknown">Unknown</option>
          </select>

          <select
            className="p-2 rounded bg-gray-800 border border-gray-600"
            value={orientation}
            onChange={(e) => setOrientation(e.target.value as Cat["orientation"])}
          >
            <option value="hetero">Hetero</option>
            <option value="homo">Homo</option>
            <option value="bi">Bi</option>
          </select>
        </div>

        {/* Color */}
        <div>
          <label className="block mb-1">Color</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-20 h-10 p-1 bg-gray-800 border border-gray-600 rounded"
          />
          <span className="ml-3">{color}</span>
        </div>

        {/* Padres */}
        <div className="grid grid-cols-2 gap-4">
          <select
            className="p-2 rounded bg-gray-800 border border-gray-600"
            value={motherId}
            onChange={(e) =>
              setMotherId(e.target.value === "none" ? "none" : Number(e.target.value))
            }
          >
            <option value="none">No mother</option>
            {mothers.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            className="p-2 rounded bg-gray-800 border border-gray-600"
            value={fatherId}
            onChange={(e) =>
              setFatherId(e.target.value === "none" ? "none" : Number(e.target.value))
            }
          >
            <option value="none">No father</option>
            {fathers.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div>
          <h2 className="font-semibold mb-2">Stats</h2>
          <div className="grid grid-cols-2 gap-3">
            {Object.keys(stats).map((key) => (
              <div key={key}>
                <label className="text-sm">{key}</label>
                <input
                  type="number"
                  value={stats[key as keyof CatStats]}
                  onChange={(e) =>
                    handleStatChange(
                      key as keyof CatStats,
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full p-1 rounded bg-gray-800 border border-gray-600"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 transition p-2 rounded font-semibold"
        >
          Crear Gato
        </button>
      </form>
    </div>
  );
}