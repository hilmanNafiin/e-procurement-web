import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import SecureLS from "secure-ls";

const ls = new SecureLS({ encodingType: "aes" });

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  let isAuthenticated = false;

  try {
    const data = ls.get("isLogin");
    isAuthenticated = !!data;
  } catch (error) {
    isAuthenticated = false;
  }

  return isAuthenticated ? children : <Navigate to="/" replace />;
};

export default PrivateRoute;
