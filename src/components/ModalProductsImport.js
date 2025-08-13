import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Modal, Upload, Button, Typography } from "antd";
import { UploadOutlined, DownloadOutlined } from "@ant-design/icons";
import { useState } from "react";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;
import SecureLS from "secure-ls";
import AlertBox from "./AlertBox";
const { Text } = Typography;
const ls = new SecureLS({ encodingType: "aes" });
const ImportModal = ({ isModalImport, setIsModalImport, vendor_id }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const handleFileChange = (info) => {
        const selectedFile = info.fileList[0]?.originFileObj;
        if (!selectedFile)
            return;
        const allowedTypes = [
            "text/csv",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ];
        if (!allowedTypes.includes(selectedFile.type)) {
            setAlert({
                type: "error",
                message: "Only .csv or .xlsx files are allowed!",
            });
            // Remove file from Upload list
            info.fileList.splice(0, info.fileList.length); // clear manually if needed
            setFile(null);
            return;
        }
        setFile(selectedFile);
    };
    const handleImport = async () => {
        if (!file) {
            setAlert({ type: "error", message: "Please select a file first." });
            return;
        }
        const formData = new FormData();
        formData.append("file", file);
        formData.append("vendor_id", vendor_id);
        const token = ls.get("isLogin");
        try {
            setLoading(true);
            const res = await axios.post(`${API_URL}/products/import`, formData, {
                headers: {
                    Authorization: `Bearer ${token?.tokens.replace("Bearer ", "")}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            if (res.data.status) {
                setAlert({ type: "success", message: res.data.messages });
                setIsModalImport(false);
                setFile(null);
            }
            else {
                setAlert({ type: "error", message: res.data.messages });
            }
        }
        catch (err) {
            setAlert({ type: "error", message: err.response?.data?.message });
        }
        finally {
            setLoading(false);
        }
    };
    const [alert, setAlert] = useState(null);
    console.log(file, "file");
    return (_jsxs(_Fragment, { children: [alert && (_jsx(AlertBox, { type: alert.type, message: alert.message, onClose: () => setAlert(null) })), _jsx(Modal, { title: "📦 Import Products", open: isModalImport, onCancel: () => setIsModalImport(false), footer: null, centered: true, children: _jsxs("div", { className: "space-y-4", children: [_jsx(Text, { className: "block text-gray-700", children: "Upload a product list in CSV or XLSX format using the template provided." }), _jsx(Upload, { beforeUpload: () => false, onChange: handleFileChange, accept: ".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", maxCount: 1, children: _jsx(Button, { icon: _jsx(UploadOutlined, {}), className: "bg-blue-600 text-white hover:bg-blue-700", children: "Select File" }) }), _jsxs("div", { className: "flex justify-between items-center pt-4", children: [_jsxs("a", { href: "/Template-Product.csv", download: true, className: "flex items-center gap-2 text-blue-600 hover:underline", children: [_jsx(DownloadOutlined, {}), "Download Template"] }), _jsx(Button, { type: "primary", onClick: handleImport, loading: loading, disabled: loading, className: "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300", children: loading ? "Importing..." : "Import" })] })] }) })] }));
};
export default ImportModal;
