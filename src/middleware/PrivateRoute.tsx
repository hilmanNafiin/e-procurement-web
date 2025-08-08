import { Navigate } from "react-router-dom";
import SecureLS from "secure-ls";

const ls = new SecureLS({ encodingType: "aes" });

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  let isAuthenticated = false;

  try {
    const data = ls.get("isLogin");
    isAuthenticated = !!data;
  } catch (error) {
    isAuthenticated = false;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
