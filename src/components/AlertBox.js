import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect } from "react";
const AlertBox = ({ type, message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, []);
    return (_jsx("div", { className: `fixed top-4 right-4 px-4 py-2 rounded shadow-md text-white z-50 ${type === "success" ? "bg-green-600" : "bg-red-600"}`, children: message }));
};
export default AlertBox;
