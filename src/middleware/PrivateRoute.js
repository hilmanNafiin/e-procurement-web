import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate } from "react-router-dom";
import SecureLS from "secure-ls";
const ls = new SecureLS({ encodingType: "aes" });
const PrivateRoute = ({ children }) => {
    let isAuthenticated = false;
    try {
        const data = ls.get("isLogin");
        isAuthenticated = !!data;
    }
    catch (error) {
        isAuthenticated = false;
    }
    return isAuthenticated ? children : _jsx(Navigate, { to: "/", replace: true });
};
export default PrivateRoute;
