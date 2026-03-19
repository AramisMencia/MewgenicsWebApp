import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Matchmaking from "./pages/Matchmaking";
import Genealogy from "./pages/Genealogy";
import CreateCat from "./pages/CreateCat";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Genealogy />} />
        <Route path="/matchmaking" element={<Matchmaking />} />
        <Route path="/create" element={<CreateCat />} />
      </Routes>
    </>
  );
}

export default App;