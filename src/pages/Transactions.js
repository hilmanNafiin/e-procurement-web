import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Table, Form, Input, message, Pagination, Typography, Divider, Drawer, Select, } from "antd";
import { SearchOutlined, } from "@ant-design/icons";
import { AiOutlinePlus } from "react-icons/ai";
import SecureLS from "secure-ls";
import axios from "axios";
import SideBar from "../components/SideBar";
import Navbar from "../components/Navbar";
import { useLocation, useNavigate } from "react-router-dom";
import AlertBox from "../components/AlertBox";
import formatRupiah from "../components/IDR";
import moment from "moment";
const { Title, Text } = Typography;
const { TextArea } = Input;
const Transactions = () => {
    const ls = new SecureLS({ encodingType: "aes" });
    const token = ls.get("isLogin");
    const API_URL = import.meta.env.VITE_API_URL;
    const headers = {
        Authorization: `Bearer ${token?.tokens?.replace("Bearer ", "")}`,
    };
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const [alert, setAlert] = useState(null);
    const isActive = location.pathname === "/products";
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [searchText, setSearchText] = useState("");
    const [status, setStatus] = useState(location?.state?.status);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isModalImport, setIsModalImport] = useState(false);
    const [form] = Form.useForm();
    const [editingProduct, setEditingProduct] = useState(null);
    const [user, setUser] = useState(null);
    const [myVendor, setMyVendor] = useState(null);
    //   // Jalan sekali saat komponen mount
    useEffect(() => {
        fetchVendor();
    }, []);
    // Jalan saat filter/pagination berubah DAN myVendor sudah ada
    useEffect(() => {
        if (myVendor) {
            fetchUser();
            fetchProducts();
        }
    }, [pagination.current, searchText, status, myVendor]);
    const fetchUser = async () => {
        try {
            const res = await axios.post(`${API_URL}/auth/sesion`, {}, { headers });
            if (res.data.status) {
                setUser(res.data.data);
            }
        }
        catch (err) {
            message.error("Failed to fetch user data");
        }
    };
    console.log(myVendor, "myVendor");
    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.current,
                size: pagination.pageSize,
                search: searchText,
                status: status,
                vendor_id: myVendor?.id,
            };
            const res = await axios.get(`${API_URL}/transactions`, {
                headers: {
                    ...headers,
                    "Cache-Control": "no-cache",
                },
                params,
            });
            if (res.data.status) {
                setProducts(res.data.data);
                setPagination({
                    ...pagination,
                    total: res.data.data ? res.data.data[0].total_data : 0,
                });
            }
        }
        catch (err) {
            message.error("Failed to fetch products");
        }
        finally {
            setLoading(false);
        }
    };
    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchText(value);
        setPagination({ ...pagination, current: 1 });
    };
    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
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
                setMyVendor(res.data.data);
            }
        }
        catch (err) {
            console.error("Failed to fetch vendor");
        }
    };
    const columns = [
        {
            title: "Customer Name",
            dataIndex: "customer_name",
            key: "customer_name",
        },
        {
            title: "Customer Phone",
            dataIndex: "customer_phone",
            key: "customer_phone",
        },
        {
            title: "Invoice",
            dataIndex: "inv_code",
            key: "inv_code",
        },
        {
            title: "Product",
            dataIndex: "product_name",
            key: "product_name",
        },
        {
            title: "Price",
            dataIndex: "price",
            key: "price",
            render: (price) => `${formatRupiah(price)}`,
            sorter: (a, b) => a.price - b.price,
        },
        {
            title: "Quantity",
            dataIndex: "quantity",
            key: "quantity",
            sorter: (a, b) => a.quantity - b.quantity,
        },
        {
            title: "Total",
            dataIndex: "total",
            key: "total",
            render: (total) => `${formatRupiah(total)}`,
            sorter: (a, b) => a.total - b.total,
        },
        {
            title: "Payment Method",
            dataIndex: "bank_value",
            key: "bank_value",
        },
        {
            title: "Transaction Date",
            dataIndex: "created_at",
            key: "created_at",
            render: (created_at) => dateTime(created_at),
            sorter: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        },
        {
            title: "Status",
            dataIndex: "va_status",
            key: "va_status",
            render: (va_status) => (_jsxs(_Fragment, { children: [_jsx("span", { className: "text-yellow-300 font-bold", children: va_status === "pending" && "Pending" }), _jsx("span", { className: "text-red-400 font-bold", children: va_status === "expire" && "Expire" }), _jsx("span", { className: "text-green-400 font-bold", children: va_status === "settlement" && "settlement" })] })),
        },
    ];
    const dateTime = (req) => {
        return moment(req).tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");
    };
    const handleStatus = (e) => {
        navigate(location.pathname, { replace: true, state: null });
        setStatus(e);
    };
    return (_jsx(_Fragment, { children: _jsxs("div", { className: "flex min-h-screen bg-blue-100", children: [alert && (_jsx(AlertBox, { type: alert.type, message: alert.message, onClose: () => setAlert(null) })), _jsx("div", { className: "hidden md:block w-64 fixed inset-y-0 bg-white shadow z-40", children: _jsx(SideBar, {}) }), _jsx(Drawer, { placement: "left", closable: false, onClose: () => setIsDrawerOpen(false), open: isDrawerOpen, bodyStyle: { padding: 0 }, width: 256, children: _jsx(SideBar, {}) }), _jsxs("div", { className: "flex-1 flex flex-col md:ml-64 w-full", children: [_jsx("div", { className: "bg-blue-100 text-blue-700 font-semibold px-4 h-[73px] flex items-center justify-between shadow-sm", children: _jsx("span", { className: "text-base md:text-lg" }) }), _jsx(Navbar, {}), _jsx("main", { className: "pt-4 px-3 md:px-8 pb-10 w-full", children: _jsxs("div", { className: "shadow-sm bg-white p-6 rounded w-full", children: [_jsxs("div", { className: "flex flex-col md:flex-row md:justify-between md:items-center mb-6", children: [_jsxs("div", { children: [_jsx(Title, { level: 3, className: "mb-1", children: "History Transactions" }), _jsx(Text, { type: "secondary", children: "History Transactions Customer" })] }), isActive && (_jsx(_Fragment, { children: _jsxs("div", { className: "flex flex-col md:flex-row gap-3 mx-3", children: [_jsxs("button", { onClick: () => setIsModalVisible(true), className: "flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded w-full md:w-auto", children: [_jsx(AiOutlinePlus, { className: "text-lg" }), "Add Product"] }), _jsxs("button", { onClick: () => setIsModalImport(true), className: "flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded w-full md:w-auto", children: [_jsx(AiOutlinePlus, { className: "text-lg" }), "Import"] })] }) }))] }), _jsx(Divider, {}), _jsx("div", { className: "mb-4", children: _jsx(Input.Search, { placeholder: "Search products...", allowClear: true, enterButton: _jsx(SearchOutlined, {}), size: "large", className: "w-full md:w-[400px]", onChange: handleSearch }) }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Pilih Status Transaksi" }), _jsx(Select, { onChange: handleStatus, className: "w-full", value: status, placeholder: "Pilih status", options: [
                                                    { label: "All", value: null },
                                                    { label: "Pending", value: 0 },
                                                    { label: "Settlement", value: 1 },
                                                    { label: "Expire", value: 2 },
                                                ] })] }), _jsx("div", { className: "overflow-x-auto w-full", children: _jsx(Table, { columns: columns, dataSource: products, rowKey: "id", loading: loading, pagination: false, scroll: { x: true }, bordered: true }) }), _jsx("div", { className: "mt-4 flex justify-end", children: _jsx(Pagination, { current: pagination.current, pageSize: pagination.pageSize, total: pagination.total, showSizeChanger: true, showQuickJumper: true, onChange: (page, pageSize) => setPagination({ ...pagination, current: page, pageSize }), showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items` }) })] }) })] })] }) }));
};
export default Transactions;
