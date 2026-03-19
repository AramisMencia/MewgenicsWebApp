import React, { useRef } from "react";

export default function DataManager() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // DESCARGAR
  const handleExport = async () => {
    const res = await fetch("/api/cats/export");
    const data = await res.json();

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json"
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cats_backup.json";
    a.click();
  };

  // SUBIR
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const json = JSON.parse(text);

    await fetch("/api/cats/import", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(json)
    });

    alert("Datos cargados correctamente");
  };

  return (
    <div className="p-6 text-white max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Gestión de Datos</h1>

      <div className="space-y-4">
        <button
          onClick={handleExport}
          className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded"
        >
          Descargar JSON
        </button>

        <input
          type="file"
          accept=".json"
          ref={fileInputRef}
          onChange={handleImport}
          className="w-full bg-gray-800 p-2 rounded"
        />
      </div>
    </div>
  );
}