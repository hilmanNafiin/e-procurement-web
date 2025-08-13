import { jsx as _jsx } from "react/jsx-runtime";
// src/constants/menuItems.ts
import { FaIndustry, FaBoxOpen } from "react-icons/fa";
import { FaCartPlus } from "react-icons/fa";
import { CiLogout } from "react-icons/ci";
export const menuItems = [
    {
        label: "My Vendor",
        path: "/vendor",
        icon: _jsx(FaIndustry, { className: "text-lg" }),
    },
    {
        label: "Products",
        path: "/products",
        icon: _jsx(FaBoxOpen, { className: "text-lg" }),
    },
    {
        label: "Transaction",
        path: "/transactions",
        icon: _jsx(FaCartPlus, { className: "text-lg" }),
    },
    {
        label: "Logout",
        path: "/",
        icon: _jsx(CiLogout, { className: "text-lg" }),
    },
];
