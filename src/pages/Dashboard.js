import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, Drawer, Form, Input, Pagination, Statistic, Table } from "antd";
import Navbar from "../components/Navbar";
import SideBar from "../components/SideBar";
import axios from "axios";
import { useEffect, useState } from "react";
import SecureLS from "secure-ls";
import moment from "moment-timezone";
import { SearchOutlined } from "@ant-design/icons";
import formatRupiah from "../components/IDR";
import { useNavigate } from "react-router-dom";
const Dashboard = () => {
    const ls = new SecureLS({ encodingType: "aes" });
    const token = ls.get("isLogin");
    const API_URL = import.meta.env.VITE_API_URL;
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [omset, setOmset] = useState(0);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [searchText, setSearchText] = useState("");
    const headers = {
        Authorization: `Bearer ${token?.tokens.replace("Bearer ", "")}`,
    };
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: "",
        address: "",
        phone: "",
    });
    const fetchVendor = async () => {
        try {
            const res = await axios.get(`${API_URL}/vendors/private`, { headers });
            if (res.data.status && res.data.data) {
                setForm({
                    name: res.data.data.name,
                    address: res.data.data.address,
                    phone: res.data.data.phone,
                });
            }
        }
        catch (err) {
            console.error("Failed to fetch vendor");
        }
    };
    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.current,
                size: pagination.pageSize,
                search: searchText,
            };
            const res = await axios.get(`${API_URL}/products`, {
                headers,
                params,
            });
            if (res.data.status) {
                console.log(res.data.data.products);
                setProducts(res.data.data.products);
                setOmset(res.data.data.omset);
                setPagination({
                    ...pagination,
                    total: res.data.data.products
                        ? res.data.data.products[0].total_data
                        : 0,
                });
            }
        }
        catch (err) {
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    };
    const columns = [
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            // sorter: (a: Product, b: Product) => a.name.localeCompare(b.name),
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
            ellipsis: true,
        },
        {
            title: "Price",
            dataIndex: "price",
            key: "price",
            render: (price) => `${formatRupiah(price)}`,
            sorter: (a, b) => a.price - b.price,
        },
        {
            title: "Stock",
            dataIndex: "stock",
            key: "stock",
            sorter: (a, b) => a.stock - b.stock,
        },
        {
            title: "Total",
            key: "total",
            render: (_, record) => formatRupiah(record.price * record.stock),
            sorter: (a, b) => a.price * a.stock - b.price * b.stock,
        },
        {
            title: "Created at",
            dataIndex: "created_at",
            key: "created_at",
            render: (created_at) => dateTime(created_at),
            // sorter: (a: Product, b: Product) => a.stock - b.stock,
        },
    ];
    const dateTime = (req) => {
        return moment(req).tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");
    };
    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchText(value);
        setPagination({ ...pagination, current: 1 });
    };
    useEffect(() => {
        fetchVendor();
        fetchProducts();
    }, [pagination.current, searchText]);
    return (_jsxs("div", { className: "flex min-h-screen bg-blue-100", children: [_jsx("div", { className: "hidden md:block w-64 fixed inset-y-0 bg-white shadow z-40", children: _jsx(SideBar, {}) }), _jsx(Drawer, { placement: "left", closable: false, 
                // onClose={() => setIsDrawerOpen(false)}
                // open={isDrawerOpen}
                bodyStyle: { padding: 0 }, width: 256, children: _jsx(SideBar, {}) }), _jsxs("div", { className: "flex-1 flex flex-col md:ml-64 w-full", children: [_jsx("div", { className: "bg-blue-100 text-blue-700 font-semibold px-4 h-[73px] flex items-center justify-between shadow-sm", children: _jsx("span", { className: "text-base md:text-lg" }) }), _jsx(Navbar, {}), _jsx("main", { className: "pt-4 px-3 md:px-8 pb-10 w-full", children: _jsxs("div", { className: "shadow-sm bg-white p-6 rounded w-full", children: [_jsx(Card, { title: form.name ? "Vendor Profile" : "Please Add Your Profil Vendor", bordered: true, className: "shadow-sm rounded-xl", children: _jsx(Form, { layout: "vertical", fields: [
                                            { name: ["name"], value: form.name },
                                            { name: ["address"], value: form.address },
                                            { name: ["phone"], value: form.phone },
                                        ], children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsx(Form.Item, { label: "Vendor Name", name: "name", className: "mb-0", children: _jsx(Input, { readOnly: true }) }), _jsx(Form.Item, { label: "Address", name: "address", className: "mb-0", children: _jsx(Input, { readOnly: true }) }), _jsx(Form.Item, { label: "Phone Number", name: "phone", className: "mb-0", children: _jsx(Input, { readOnly: true }) })] }) }) }), _jsx("div", { className: "h-3" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4", children: [_jsx(Card, { bordered: true, className: "shadow rounded-xl", children: _jsx(Statistic, { title: "Total Products", value: pagination.total }) }), _jsx(Card, { bordered: true, className: "shadow rounded-xl text-center text-gray-400 cursor-pointer", onClick: () => navigate("/transactions", {
                                                state: { status: 1 },
                                            }), children: _jsx(Statistic, { title: "Total Omset", value: formatRupiah(omset) }) })] }), _jsx("div", { className: "h-3" }), _jsxs(Card, { title: "Product List", bordered: true, className: "shadow-sm rounded-xl overflow-auto", children: [_jsx("div", { className: "mb-4", children: _jsx(Input.Search, { placeholder: "Search products...", allowClear: true, enterButton: _jsx(SearchOutlined, {}), size: "large", className: "w-full md:w-[400px]", onChange: handleSearch }) }), _jsx("div", { className: "overflow-x-auto w-full", children: _jsx(Table, { columns: columns, dataSource: products, rowKey: "id", loading: loading, pagination: false, scroll: { x: true }, bordered: true }) }), _jsx("div", { className: "mt-4 flex justify-end", children: _jsx(Pagination, { current: pagination.current, pageSize: pagination.pageSize, total: pagination.total, showSizeChanger: true, showQuickJumper: true, onChange: (page, pageSize) => setPagination({ ...pagination, current: page, pageSize }), showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items` }) })] })] }) })] })] }));
};
export default Dashboard;
