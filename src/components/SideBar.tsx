import { Link, useLocation, useNavigate } from "react-router-dom";
import { menuItems } from "../constants/MenuItems";
import SecureLS from "secure-ls";

const ls = new SecureLS({ encodingType: "aes" });
const SideBar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;
  const remove = (path: string) => {
    if (path === "/") ls.remove("isLogin");
  };
  return (
    <div className="hidden md:block fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 shadow z-20">
      {/* Header */}
      <div
        className="flex items-center justify-center px-6 py-5 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-2xl font-semibold tracking-wide shadow cursor-pointer"
        onClick={() => navigate("/dashboard")}
      >
        E-Procurement
      </div>

      {/* Menu */}
      <ul className="px-4 py-6 space-y-2">
        {menuItems.map((item) => (
          <li key={item.path} onClick={() => remove(item.path)}>
            <Link
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 text-sm font-medium
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
  );
};

export default SideBar;
