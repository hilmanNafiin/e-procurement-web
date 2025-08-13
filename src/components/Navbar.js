import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
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
    const isActive = (path) => location.pathname === path;
    const navigate = useNavigate();
    const remove = (path) => {
        if (path === "/")
            ls.remove("isLogin");
    };
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex justify-between items-center bg-white px-4 py-3 shadow-md fixed w-full z-20 md:hidden", children: [_jsx("div", { className: "text-lg font-bold", children: "E-Procurement" }), _jsx("button", { onClick: toggleSidebar, className: "md:hidden", children: isOpen ? _jsx(X, { size: 24 }) : _jsx(Menu, { size: 24 }) })] }), _jsxs("div", { className: `fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-30 transition-transform duration-300 transform ${isOpen ? "translate-x-0" : "-translate-x-full"} md:hidden`, children: [_jsx("div", { className: "flex items-center justify-center px-6 py-5 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-2xl font-semibold tracking-wide shadow", onClick: () => navigate("/dashboard"), children: "E-Procurement" }), _jsx("ul", { className: "p-4 space-y-2", children: menuItems.map((item) => (_jsx("li", { onClick: () => remove(item.path), children: _jsxs(Link, { to: item.path, onClick: () => setIsOpen(false), className: `flex items-center gap-3 p-2 rounded transition-colors duration-200
                  ${isActive(item.path)
                                    ? "bg-blue-100 text-blue-700 font-semibold"
                                    : "text-gray-700 hover:bg-gray-100"}`, children: [item.icon, item.label] }) }, item.path))) })] })] }));
};
export default Navbar;
