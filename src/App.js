import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Vendor from "./pages/Vendor";
import Products from "./pages/Products";
import PrivateRoute from "./middleware/PrivateRoute";
import Shop from "./pages/Shop";
import Transactions from "./pages/Transactions";
function App() {
    return (_jsx(Router, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Login, {}) }), _jsx(Route, { path: "/register", element: _jsx(Register, {}) }), _jsx(Route, { path: "/shop", element: _jsx(Shop, {}) }), _jsx(Route, { path: "/dashboard", element: _jsx(PrivateRoute, { children: _jsx(Dashboard, {}) }) }), _jsx(Route, { path: "/transactions", element: _jsx(PrivateRoute, { children: _jsx(Transactions, {}) }) }), _jsx(Route, { path: "/vendor", element: _jsx(PrivateRoute, { children: _jsx(Vendor, {}) }) }), _jsx(Route, { path: "/products", element: _jsx(PrivateRoute, { children: _jsx(Products, {}) }) })] }) }));
}
export default App;
