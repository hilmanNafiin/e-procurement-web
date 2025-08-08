// src/constants/menuItems.ts
import { FaIndustry, FaBoxOpen } from "react-icons/fa";
import { CiLogout } from "react-icons/ci";

export const menuItems = [
  {
    label: "My Vendor",
    path: "/vendor",
    icon: <FaIndustry className="text-lg" />,
  },
  {
    label: "Products",
    path: "/products",
    icon: <FaBoxOpen className="text-lg" />,
  },
  {
    label: "Logout",
    path: "/login",
    icon: <CiLogout className="text-lg" />,
  },
];
