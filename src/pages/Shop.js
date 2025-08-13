import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, message, Space, Pagination, Typography, Divider, Select, } from "antd";
import { EditOutlined, SearchOutlined, } from "@ant-design/icons";
import SecureLS from "secure-ls";
import axios from "axios";
import { useLocation } from "react-router-dom";
import AlertBox from "../components/AlertBox";
import formatRupiah from "../components/IDR";
const { Title, Text } = Typography;
const { TextArea } = Input;
const Shop = () => {
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
    const [callbackTrx, setCallbackTrx] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isModalCallback, setIsModalCallback] = useState(false);
    const [quantity, setQuantity] = useState(0);
    const [form] = Form.useForm();
    const [editingProduct, setEditingProduct] = useState(null);
    const [user, setUser] = useState(null);
    const [myVendor, setMyVendor] = useState(null);
    console.log(editingProduct, "editingProduct");
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
            const res = await axios.get(`${API_URL}/products/users`, {
                params,
            });
            if (res.data.status) {
                setProducts(res.data.data);
                setPagination({
                    ...pagination,
                    total: res.data.data ? res.data.data.total_data : 0,
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
                name: values.customer_name,
                phone: values.customer_phone,
                quantity: values.quantity,
                product_id: editingProduct?.id,
                bank_value: values.bank_value,
            };
            const response = await axios.post(`${API_URL}/transactions`, payload);
            if (response.data.status) {
                setIsModalCallback(true);
                setCallbackTrx(response.data.data);
                setEditingProduct(null);
                form.resetFields();
                setAlert({ type: "success", message: response.data.messages });
            }
            if (!response.data.status)
                setAlert({ type: "error", message: response.data.messages });
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
            title: "Actions",
            key: "actions",
            render: (_, record) => (_jsx(Space, { size: "middle", children: _jsx(Button, { type: "primary", icon: _jsx(EditOutlined, {}), onClick: () => showModal(record), size: "small" }) })),
        },
    ];
    const handleQuantity = (value) => {
        setQuantity(value ?? 0);
    };
    return (_jsx(_Fragment, { children: _jsxs("div", { className: "flex min-h-screen bg-blue-100", children: [alert && (_jsx(AlertBox, { type: alert.type, message: alert.message, onClose: () => setAlert(null) })), _jsxs("div", { className: "flex-1 flex flex-col w-full", children: [_jsx("div", { className: "bg-blue-100 text-blue-700 font-semibold px-4 h-[73px] flex items-center justify-between shadow-sm", children: _jsx("span", { className: "text-base md:text-lg" }) }), _jsx("main", { className: "pt-4 px-3 md:px-8 pb-10 w-full", children: _jsxs("div", { className: "shadow-sm bg-white p-6 rounded w-full", children: [_jsx("div", { className: "flex flex-col md:flex-row md:justify-between md:items-center mb-6", children: _jsxs("div", { children: [_jsx(Title, { level: 3, className: "mb-1", children: "Shoping" }), _jsx(Text, { type: "secondary", children: "Manage your product inventory" })] }) }), _jsx(Divider, {}), _jsx("div", { className: "mb-4", children: _jsx(Input.Search, { placeholder: "Search products...", allowClear: true, enterButton: _jsx(SearchOutlined, {}), size: "large", className: "w-full md:w-[400px]", onChange: handleSearch }) }), _jsx("div", { className: "overflow-x-auto w-full", children: _jsx(Table, { columns: columns, dataSource: products, rowKey: "id", loading: loading, pagination: false, scroll: { x: true }, bordered: true }) }), _jsx("div", { className: "mt-4 flex justify-end", children: _jsx(Pagination, { current: pagination.current, pageSize: pagination.pageSize, total: pagination.total, showSizeChanger: true, showQuickJumper: true, onChange: (page, pageSize) => setPagination({ ...pagination, current: page, pageSize }), showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items` }) })] }) })] }), _jsxs(Modal, { title: "Input Pembayaran", visible: isModalVisible, onOk: handleSubmit, onCancel: handleCancel, confirmLoading: loading, width: 700, footer: [
                        _jsx(Button, { onClick: handleCancel, children: "Cancel" }, "back"),
                        _jsx(Button, { type: "primary", loading: loading, onClick: handleSubmit, children: "Checkout" }, "submit"),
                    ], children: [_jsxs(Form, { form: form, layout: "vertical", initialValues: { price: 0, stock: 0 }, children: [_jsx(Form.Item, { name: "name", label: "Product Name", rules: [
                                        { required: true, message: "Please input product name!" },
                                    ], children: _jsx(Input, { placeholder: "Enter product name", readOnly: true }) }), _jsx(Form.Item, { name: "description", label: "Description", rules: [
                                        {
                                            required: true,
                                            message: "Please input product description!",
                                        },
                                    ], children: _jsx(TextArea, { rows: 4, placeholder: "Enter product description", readOnly: true }) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsx(Form.Item, { name: "price", label: "Price", rules: [
                                                {
                                                    required: true,
                                                    message: "Please input product price!",
                                                },
                                            ], children: _jsx(InputNumber, { min: 0, step: 0.01, style: { width: "100%" }, formatter: (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ","), readOnly: true }) }), _jsx(Form.Item, { name: "quantity", label: "Masukan quantity", rules: [{ required: true, message: "Masukkan quantity!" }], initialValue: 0, children: _jsx(InputNumber, { min: 0, style: { width: "100%" }, onChange: handleQuantity }) }), _jsx(Form.Item, { name: "customer_name", label: "Customer Name", rules: [
                                                { required: true, message: "Please input customer name!" },
                                            ], children: _jsx(Input, { placeholder: "Enter product name" }) }), _jsx(Form.Item, { name: "customer_phone", label: "Customer Phone", rules: [
                                                { required: true, message: "Please input customer phone!" },
                                            ], children: _jsx(Input, { placeholder: "Enter product name" }) }), _jsx(Form.Item, { name: "bank_value", label: "Pilih Metode Pembayaran", rules: [
                                                {
                                                    required: true,
                                                    message: "Please select a payment method!",
                                                },
                                            ], children: _jsxs(Select, { placeholder: "Pilih metode pembayaran", children: [_jsx(Select.Option, { value: "bca", children: "BCA" }), _jsx(Select.Option, { value: "bni", children: "BNI" }), "s"] }) })] })] }), _jsxs("div", { className: "max-w-xs bg-white border border-gray-200 rounded-lg p-4 shadow-sm", children: [_jsx("h2", { className: "text-lg font-semibold text-center mb-4", children: "Total" }), _jsxs("div", { className: "flex justify-between mb-2", children: [_jsx("span", { children: "Biaya Admins" }), _jsx("span", { children: "Rp 4.440" })] }), _jsxs("div", { className: "flex justify-between font-bold text-lg", children: [_jsx("span", { children: "Total" }), _jsxs("span", { children: ["Rp", " ", (editingProduct ? editingProduct.price * quantity + 4440 : 0)
                                                    .toString()
                                                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")] })] })] })] }), _jsx(Modal, { title: "Detail Transaksi", open: isModalCallback, onCancel: () => setIsModalCallback(false), footer: null, children: callbackTrx && (_jsxs("div", { className: "space-y-2", children: [_jsxs("p", { children: [_jsx("strong", { children: "Status:" }), " ", callbackTrx.status_message] }), _jsxs("p", { children: [_jsx("strong", { children: "Transaction ID:" }), " ", callbackTrx.transaction_id] }), _jsxs("p", { children: [_jsx("strong", { children: "Order ID:" }), " ", callbackTrx.order_id] }), _jsxs("p", { children: [_jsx("strong", { children: "Merchant ID:" }), " ", callbackTrx.merchant_id] }), _jsxs("p", { children: [_jsx("strong", { children: "Gross Amount:" }), " Rp", " ", Number(callbackTrx.gross_amount).toLocaleString("id-ID")] }), _jsxs("p", { children: [_jsx("strong", { children: "Payment Type:" }), " ", callbackTrx.payment_type] }), _jsxs("p", { children: [_jsx("strong", { children: "Transaction Time:" }), " ", callbackTrx.transaction_time] }), _jsxs("p", { children: [_jsx("strong", { children: "Transaction Status:" }), " ", callbackTrx.transaction_status] }), _jsxs("p", { children: [_jsx("strong", { children: "Fraud Status:" }), " ", callbackTrx.fraud_status] }), _jsxs("p", { children: [_jsx("strong", { children: "Expiry Time:" }), " ", callbackTrx.expiry_time] }), callbackTrx.va_numbers && callbackTrx.va_numbers.length > 0 && (_jsxs("div", { className: "mt-3", children: [_jsx("h4", { className: "font-semibold mb-2", children: "Virtual Account" }), _jsx(Table, { dataSource: callbackTrx.va_numbers.map((item, index) => ({
                                            key: index,
                                            bank: item.bank.toUpperCase(),
                                            va_number: item.va_number,
                                        })), columns: [
                                            { title: "Bank", dataIndex: "bank", key: "bank" },
                                            {
                                                title: "VA Number",
                                                dataIndex: "va_number",
                                                key: "va_number",
                                            },
                                        ], pagination: false, size: "small" })] }))] })) })] }) }));
};
export default Shop;
