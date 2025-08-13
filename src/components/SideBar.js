import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { menuItems } from "../constants/MenuItems";
import SecureLS from "secure-ls";
const ls = new SecureLS({ encodingType: "aes" });
const SideBar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isActive = (path) => location.pathname === path;
    const remove = (path) => {
        if (path === "/")
            ls.remove("isLogin");
    };
    return (_jsxs("div", { className: "hidden md:block fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 shadow z-20", children: [_jsx("div", { className: "flex items-center justify-center px-6 py-5 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-2xl font-semibold tracking-wide shadow cursor-pointer", onClick: () => navigate("/dashboard"), children: "E-Procurement" }), _jsx("ul", { className: "px-4 py-6 space-y-2", children: menuItems.map((item) => (_jsx("li", { onClick: () => remove(item.path), children: _jsxs(Link, { to: item.path, className: `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 text-sm font-medium
                ${isActive(item.path)
                            ? "bg-blue-100 text-blue-700 font-semibold"
                            : "text-gray-700 hover:bg-gray-100"}`, children: [item.icon, item.label] }) }, item.path))) })] }));
};
export default SideBar;
