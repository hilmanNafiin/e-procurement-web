import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, message, Popconfirm, Space, Pagination, Typography, Divider, Drawer, } from "antd";
import { EditOutlined, DeleteOutlined, SearchOutlined, } from "@ant-design/icons";
import { AiOutlinePlus } from "react-icons/ai";
import SecureLS from "secure-ls";
import axios from "axios";
import SideBar from "../components/SideBar";
import Navbar from "../components/Navbar";
import { useLocation } from "react-router-dom";
import AlertBox from "../components/AlertBox";
import ImportModal from "../components/ModalProductsImport";
import formatRupiah from "../components/IDR";
const { Title, Text } = Typography;
const { TextArea } = Input;
const Products = () => {
    const ls = new SecureLS({ encodingType: "aes" });
    const token = ls.get("isLogin");
    const API_URL = import.meta.env.VITE_API_URL;
    const headers = {
        Authorization: `Bearer ${token?.tokens?.replace("Bearer ", "")}`,
    };
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const location = useLocation();
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
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isModalImport, setIsModalImport] = useState(false);
    const [form] = Form.useForm();
    const [editingProduct, setEditingProduct] = useState(null);
    const [user, setUser] = useState(null);
    const [myVendor, setMyVendor] = useState(null);
    useEffect(() => {
        fetchUser();
        fetchVendor();
        fetchProducts();
    }, [pagination.current, searchText]);
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
    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.current,
                size: pagination.pageSize,
                search: searchText,
            };
            const res = await axios.get(`${API_URL}/products`, {
                headers: {
                    ...headers,
                    "Cache-Control": "no-cache",
                },
                params,
            });
            if (res.data.status) {
                setProducts(res.data.data.products);
                setPagination({
                    ...pagination,
                    total: res.data.data.products
                        ? res.data.data.products[0].total_data
                        : 0,
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
    const showModal = (product = null) => {
        if (product) {
            form.setFieldsValue(product);
            setEditingProduct(product);
        }
        else {
            form.resetFields();
            setEditingProduct(null);
        }
        setIsModalVisible(true);
    };
    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                ...values,
                vendor_id: myVendor?.id,
                user_id: user?.id,
                product_id: editingProduct ? editingProduct.id : undefined,
            };
            if (editingProduct) {
                const response = await axios.patch(`${API_URL}/products`, payload, {
                    headers,
                });
                if (response.data.status) {
                    setEditingProduct(null);
                    form.resetFields();
                    setAlert({ type: "success", message: response.data.messages });
                }
                if (!response.data.status)
                    setAlert({ type: "error", message: response.data.messages });
            }
            else {
                const response = await axios.post(`${API_URL}/products`, payload, {
                    headers,
                });
                if (response.data.status) {
                    setEditingProduct(null);
                    form.resetFields();
                    setAlert({ type: "success", message: response.data.messages });
                }
                if (!response.data.status)
                    setAlert({
                        type: "error",
                        message: "Please input your Vendor Profilee",
                    });
            }
            setIsModalVisible(false);
            fetchProducts();
        }
        catch (error) {
            message.error("Failed to save product");
        }
    };
    const handleDelete = async (param) => {
        try {
            const response = await axios.delete(`${API_URL}/products?product_id=${param?.id}`, {
                headers,
            });
            if (response.data.status)
                setAlert({ type: "success", message: response.data.messages });
            if (!response.data.status)
                setAlert({ type: "error", message: response.data.messages });
            fetchProducts();
        }
        catch (error) {
            console.error("Failed to delete vendor");
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
                setMyVendor(res.data.data);
            }
        }
        catch (err) {
            console.error("Failed to fetch vendor");
        }
    };
    const columns = [
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
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
        ...(isActive
            ? [
                {
                    title: "Actions",
                    key: "actions",
                    render: (_, record) => (_jsxs(Space, { size: "middle", children: [_jsx(Button, { type: "primary", icon: _jsx(EditOutlined, {}), onClick: () => showModal(record), size: "small" }), _jsx(Popconfirm, { title: "Delete this product?", onConfirm: () => handleDelete(record), okText: "Yes", cancelText: "No", children: _jsx(Button, { danger: true, icon: _jsx(DeleteOutlined, {}), size: "small" }) })] })),
                },
            ]
            : []),
    ];
    return (_jsx(_Fragment, { children: _jsxs("div", { className: "flex min-h-screen bg-blue-100", children: [alert && (_jsx(AlertBox, { type: alert.type, message: alert.message, onClose: () => setAlert(null) })), _jsx("div", { className: "hidden md:block w-64 fixed inset-y-0 bg-white shadow z-40", children: _jsx(SideBar, {}) }), _jsx(Drawer, { placement: "left", closable: false, onClose: () => setIsDrawerOpen(false), open: isDrawerOpen, bodyStyle: { padding: 0 }, width: 256, children: _jsx(SideBar, {}) }), _jsxs("div", { className: "flex-1 flex flex-col md:ml-64 w-full", children: [_jsx("div", { className: "bg-blue-100 text-blue-700 font-semibold px-4 h-[73px] flex items-center justify-between shadow-sm", children: _jsx("span", { className: "text-base md:text-lg" }) }), _jsx(Navbar, {}), _jsx("main", { className: "pt-4 px-3 md:px-8 pb-10 w-full", children: _jsxs("div", { className: "shadow-sm bg-white p-6 rounded w-full", children: [_jsxs("div", { className: "flex flex-col md:flex-row md:justify-between md:items-center mb-6", children: [_jsxs("div", { children: [_jsx(Title, { level: 3, className: "mb-1", children: "Products Management" }), _jsx(Text, { type: "secondary", children: "Manage your product inventory" })] }), isActive && (_jsx(_Fragment, { children: _jsxs("div", { className: "flex flex-col md:flex-row gap-3 mx-3", children: [_jsxs("button", { onClick: () => setIsModalVisible(true), className: "flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded w-full md:w-auto", children: [_jsx(AiOutlinePlus, { className: "text-lg" }), "Add Product"] }), _jsxs("button", { onClick: () => setIsModalImport(true), className: "flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded w-full md:w-auto", children: [_jsx(AiOutlinePlus, { className: "text-lg" }), "Import"] })] }) }))] }), _jsx(Divider, {}), _jsx("div", { className: "mb-4", children: _jsx(Input.Search, { placeholder: "Search products...", allowClear: true, enterButton: _jsx(SearchOutlined, {}), size: "large", className: "w-full md:w-[400px]", onChange: handleSearch }) }), _jsx("div", { className: "overflow-x-auto w-full", children: _jsx(Table, { columns: columns, dataSource: products, rowKey: "id", loading: loading, pagination: false, scroll: { x: true }, bordered: true }) }), _jsx("div", { className: "mt-4 flex justify-end", children: _jsx(Pagination, { current: pagination.current, pageSize: pagination.pageSize, total: pagination.total, showSizeChanger: true, showQuickJumper: true, onChange: (page, pageSize) => setPagination({ ...pagination, current: page, pageSize }), showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items` }) })] }) })] }), _jsx(Modal, { title: editingProduct ? "Edit Product" : "Add New Product", visible: isModalVisible, onOk: handleSubmit, onCancel: handleCancel, confirmLoading: loading, width: 700, footer: [
                        _jsx(Button, { onClick: handleCancel, children: "Cancel" }, "back"),
                        _jsx(Button, { type: "primary", loading: loading, onClick: handleSubmit, children: editingProduct ? "Update" : "Create" }, "submit"),
                    ], children: _jsxs(Form, { form: form, layout: "vertical", initialValues: { price: 0, stock: 0 }, children: [_jsx(Form.Item, { name: "name", label: "Product Name", rules: [
                                    { required: true, message: "Please input product name!" },
                                ], children: _jsx(Input, { placeholder: "Enter product name" }) }), _jsx(Form.Item, { name: "description", label: "Description", rules: [
                                    {
                                        required: true,
                                        message: "Please input product description!",
                                    },
                                ], children: _jsx(TextArea, { rows: 4, placeholder: "Enter product description" }) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsx(Form.Item, { name: "price", label: "Price", rules: [
                                            {
                                                required: true,
                                                message: "Please input product price!",
                                            },
                                        ], children: _jsx(InputNumber, { min: 0, step: 0.01, style: { width: "100%" }, formatter: (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") }) }), _jsx(Form.Item, { name: "stock", label: "Stock Quantity", rules: [
                                            {
                                                required: true,
                                                message: "Please input stock quantity!",
                                            },
                                        ], children: _jsx(InputNumber, { min: 0, style: { width: "100%" } }) })] })] }) }), _jsx(ImportModal, { isModalImport: isModalImport, vendor_id: myVendor?.id, setIsModalImport: () => setIsModalImport(false) })] }) }));
};
export default Products;
