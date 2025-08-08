import { Modal, Upload, Button, Typography } from "antd";
import { UploadOutlined, DownloadOutlined } from "@ant-design/icons";

import { useState } from "react";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;
import SecureLS from "secure-ls";
import AlertBox from "./AlertBox";
import type { UploadChangeParam, UploadFile } from "antd/es/upload/interface";

const { Text } = Typography;

const ls = new SecureLS({ encodingType: "aes" });
const ImportModal = ({ isModalImport, setIsModalImport }: any) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (info: UploadChangeParam<UploadFile<any>>) => {
    const selectedFile = info.fileList[0]?.originFileObj;
    if (!selectedFile) return;

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
      } else {
        setAlert({ type: "error", message: res.data.messages });
      }
    } catch (err: any) {
      setAlert({ type: "error", message: err.response?.data?.message });
    } finally {
      setLoading(false);
    }
  };
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  console.log(file, "file");
  return (
    <>
      {alert && (
        <AlertBox
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}
      <Modal
        title={"📦 Import Products"}
        open={isModalImport}
        onCancel={() => setIsModalImport(false)}
        footer={null}
        centered
      >
        <div className="space-y-4">
          <Text className="block text-gray-700">
            Upload a product list in CSV or XLSX format using the template
            provided.
          </Text>

          <Upload
            beforeUpload={() => false}
            onChange={handleFileChange}
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            maxCount={1}
          >
            <Button
              icon={<UploadOutlined />}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Select File
            </Button>
          </Upload>

          <div className="flex justify-between items-center pt-4">
            <a
              href="/Template-Product.csv"
              download
              className="flex items-center gap-2 text-blue-600 hover:underline"
            >
              <DownloadOutlined />
              Download Template
            </a>

            <Button
              type="primary"
              onClick={handleImport}
              loading={loading}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? "Importing..." : "Import"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ImportModal;
