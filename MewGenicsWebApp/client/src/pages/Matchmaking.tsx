export default function Matchmaking() {
  return (
    <div>
      {/* SUBBAR */}
      <div style={{
        display: "flex",
        gap: "10px",
        padding: "10px",
        borderBottom: "1px solid gray"
      }}>
        <label>
          <input type="checkbox" />
          Allow Inbreeding
        </label>

        {/* prioridades */}
        {["strength","dexterity","constitution","intelligence","agility","charisma","luck"].map(stat => (
          <label key={stat}>
            <input type="checkbox" />
            {stat}
          </label>
        ))}
      </div>

      {/* CONTENIDO */}
      <div style={{ display: "flex" }}>
        
        {/* IZQUIERDA */}
        <div style={{
          width: "30%",
          borderRight: "1px solid gray",
          padding: "10px"
        }}>
          Lista de cruces
        </div>

        {/* DERECHA */}
        <div style={{
          width: "70%",
          padding: "10px"
        }}>
          Detalle del cruce seleccionado
        </div>

      </div>
    </div>
  );
}