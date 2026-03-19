
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <header className="bg-gray-800 text-white shadow-md p-4 flex justify-center space-x-6">
      <Link 
        to="/" 
        className="hover:bg-gray-700 px-4 py-2 rounded transition"
      >
        Árbol genealógico
      </Link>
      <Link 
        to="/matchmaking" 
        className="hover:bg-gray-700 px-4 py-2 rounded transition"
      >
        Matchmaking
      </Link>
      <Link 
        to="/create" 
        className="hover:bg-gray-700 px-4 py-2 rounded transition"
      >
        Nuevo gato
      </Link>
      <Link 
        to="/data" 
        className="hover:bg-gray-700 px-4 py-2 rounded transition"
      >
        Datos
      </Link>
    </header>
  );
};

export default Navbar;