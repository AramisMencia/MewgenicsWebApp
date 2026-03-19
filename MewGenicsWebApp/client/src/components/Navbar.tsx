import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={{
      display: "flex",
      gap: "20px",
      padding: "10px",
      borderBottom: "1px solid gray"
    }}>
      <Link to="/">Arbol Genealogico</Link>
      <Link to="/matchmaking">Matchmaking</Link>
      <Link to="/create">Nuevo Gato</Link>
    </nav>
  );
}