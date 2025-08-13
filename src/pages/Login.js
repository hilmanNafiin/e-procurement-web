import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SecureLS from "secure-ls";
const ls = new SecureLS({ encodingType: "aes" });
const API_URL = import.meta.env.VITE_API_URL;
const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await axios.post(`${API_URL}/auth/login`, {
                email,
                password,
            });
            if (res.data.status) {
                console.log("Login success:", res.data.data);
                ls.set("isLogin", res.data.data);
                navigate("/dashboard");
            }
            else {
                setError(res.data.messages || "Login failed");
            }
        }
        catch (err) {
            setError(err.response?.data?.message || "Login failed");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "flex items-center justify-center min-h-screen bg-gray-100 px-4", children: _jsxs("div", { className: "w-full max-w-md p-6 sm:p-8 bg-white rounded-lg shadow-md", children: [_jsx("h2", { className: "text-2xl font-bold mb-6 text-center text-gray-800", children: "E-Procurement" }), error && (_jsx("div", { className: "mb-4 text-sm text-red-600 bg-red-100 px-3 py-2 rounded", children: error })), _jsxs("form", { className: "space-y-4", onSubmit: handleSubmit, children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-700", children: "Email" }), _jsx("input", { type: "email", id: "email", className: "mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "you@example.com", value: email, onChange: (e) => setEmail(e.target.value), required: true })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-gray-700", children: "Password" }), _jsx("input", { type: "password", id: "password", className: "mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "********", value: password, onChange: (e) => setPassword(e.target.value), required: true })] }), _jsx("div", { children: _jsxs("p", { children: ["Jika belum punya akun ?", " ", _jsx("span", { className: "text-blue-500 underline cursor-pointer", onClick: () => navigate("/register"), children: "klik disini" })] }) }), _jsx("div", { children: _jsx("button", { type: "submit", disabled: loading, className: `w-full py-2 px-4 ${loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"} text-white font-semibold rounded-md transition duration-200`, children: loading ? "Logging in..." : "Login" }) })] })] }) }));
};
export default Login;
