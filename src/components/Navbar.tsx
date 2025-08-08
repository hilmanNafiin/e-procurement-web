import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { menuItems } from "../constants/MenuItems";
import SecureLS from "secure-ls";

const ls = new SecureLS({ encodingType: "aes" });
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setIsOpen(!isOpen);
  const isActive = (path: string) => location.pathname === path;
  const navigate = useNavigate();
  const remove = (path: string) => {
    if (path === "/") ls.remove("isLogin");
  };
  return (
    <>
      {/* Top Navbar for Mobile */}
      <div className="flex justify-between items-center bg-white px-4 py-3 shadow-md fixed w-full z-20 md:hidden">
        <div className="text-lg font-bold">E-Procurement</div>
        <button onClick={toggleSidebar} className="md:hidden">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Mobile Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-30 transition-transform duration-300 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:hidden`}
      >
        <div
          className="flex items-center justify-center px-6 py-5 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-2xl font-semibold tracking-wide shadow"
          onClick={() => navigate("/dashboard")}
        >
          E-Procurement
        </div>
        <ul className="p-4 space-y-2">
          {menuItems.map((item) => (
            <li key={item.path} onClick={() => remove(item.path)}>
              <Link
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 p-2 rounded transition-colors duration-200
                  ${
                    isActive(item.path)
                      ? "bg-blue-100 text-blue-700 font-semibold"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                {item.icon}
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Navbar;
