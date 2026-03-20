import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Matchmaking from "./pages/Matchmaking";
import Genealogy from "./pages/Genealogy";
import CreateCat from "./pages/CreateCat";
import DataManager from "./pages/DataManager";


function App() {
  return (
    <div className="flex flex-col h-screen w-screen bg-gray-900 text-white">
      <Navbar />
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Genealogy />} />
          <Route path="/matchmaking" element={<Matchmaking />} />
          <Route path="/create" element={<CreateCat />} />
          <Route path="/data" element={<DataManager />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;