import { useEffect, useState } from "react";
import SecureLS from "secure-ls";
import axios from "axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/SideBar";
import { useLocation, useNavigate } from "react-router-dom";
import AlertBox from "../components/AlertBox";

interface Vendor {
  id: number;
  user_id: number;
  name: string;
  address: string;
  phone: string;
  created_at?: string;
  updated_at?: string;
}
const Vendor = () => {
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isExsiting, setIsExsiting] = useState<Vendor | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const location = useLocation();

  const isActive = location.pathname === "/vendor";
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
  });

  const ls = new SecureLS({ encodingType: "aes" });
  const token = ls.get("isLogin");
  const API_URL = import.meta.env.VITE_API_URL;

  const headers = {
    Authorization: `Bearer ${token?.tokens.replace("Bearer ", "")}`,
  };

  const sesion = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/auth/sesion`,
        {},
        { headers }
      );
      if (response.data.status) {
        setUser(response.data.data);
      } else {
        setAlert({ type: "error", message: response.data.messages });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Session failed");
    } finally {
      setLoading(false);
    }
  };

  const fetchVendor = async () => {
    try {
      const res = await axios.get(`${API_URL}/vendors/private`, {
        headers: {
          ...headers,
          "Cache-Control": "no-cache",
        },
      });
      if (res.data.status && res.data.data) {
        setIsExsiting(res.data.data);
        setForm({
          name: res.data.data.name,
          address: res.data.data.address,
          phone: res.data.data.phone,
        });
      }
    } catch (err) {
      console.error("Failed to fetch vendor");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const payload = {
      ...form,
      user_id: user?.id,
      vendor_id: isExsiting ? isExsiting.id : undefined,
    };

    if (isExsiting) {
      const response = await axios.patch(`${API_URL}/vendors`, payload, {
        headers,
      });
      if (response.data.status) {
        setAlert({ type: "success", message: response.data.messages });
      }
      if (!response.data.status)
        setAlert({ type: "error", message: response.data.messages });
    } else {
      const response = await axios.post(`${API_URL}/vendors`, payload, {
        headers,
      });
      if (response.data.status) {
        setAlert({ type: "success", message: response.data.messages });
      }
      if (!response.data.status)
        setAlert({
          type: "error",
          message: "Please input your Vendor Profilee",
        });
    }
    setIsSubmitting(false);
  };

  useEffect(() => {
    sesion();
    fetchVendor();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  return (
    <>
      <div className="flex min-h-screen bg-blue-100">
        {alert && (
          <AlertBox
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}
        {/* Sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Main area */}
        <div className="flex-1 flex flex-col">
          {/* BLUE TOPBAR FULL WIDTH */}
          <div className="bg-blue-100 text-blue-700 font-semibold px-6 h-[73px] bg-fixed">
            test
          </div>

          {/* Navbar (optional) */}
          <Navbar />

          {/* Content */}
          <main className="pt-4 px-4 md:px-8 pb-10 max-w-4xl mx-auto w-full">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800">
                Vendor Profile
              </h1>
              {form.name ? (
                <p className="text-gray-600">Manage your vendor information</p>
              ) : (
                <p
                  className="text-red-600 underline cursor-pointer"
                  onClick={() => navigate("/vendor")}
                >
                  Please input for your vendor
                </p>
              )}
            </div>

            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
                <div className="flex">
                  <svg
                    className="h-5 w-5 text-red-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {!loading && (
              <div className="bg-white shadow-lg rounded-xl overflow-hidden">
                <div className="p-6 sm:p-8">
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                      {/* Name Field */}
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Vendor Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                          placeholder="Enter vendor name"
                          required
                        />
                      </div>

                      {/* Address Field */}
                      <div>
                        <label
                          htmlFor="address"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Address <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="address"
                          name="address"
                          value={form.address}
                          onChange={handleChange}
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                          placeholder="Enter vendor address"
                          required
                        />
                      </div>

                      {/* Phone Field */}
                      <div>
                        <label
                          htmlFor="phone"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="phone"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                          placeholder="Enter phone number"
                          required
                        />
                      </div>
                      {isActive && (
                        <div className="pt-4">
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 ${
                              isSubmitting
                                ? "opacity-70 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            {isSubmitting ? (
                              <>
                                <svg
                                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                Processing...
                              </>
                            ) : (
                              "Save Vendor Information"
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default Vendor;
