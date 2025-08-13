import { useState, useEffect } from "react";
import type { ColumnsType } from "antd/es/table";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Popconfirm,
  Space,
  Pagination,
  Typography,
  Divider,
  Drawer,
  Select,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { AiOutlinePlus } from "react-icons/ai";

import SecureLS from "secure-ls";
import axios from "axios";
import SideBar from "../components/SideBar";
import Navbar from "../components/Navbar";
import { useLocation, useNavigate } from "react-router-dom";
import AlertBox from "../components/AlertBox";
import ImportModal from "../components/ModalProductsImport";
import formatRupiah from "../components/IDR";
import moment from "moment";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface Product {
  id: number;
  vendor_id: number;
  user_id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  created_at?: string;
  updated_at?: string;
}
interface Transactions {
  id: string;
  amount: number;
  status: number;
  customer_name: string;
  customer_phone: string;
  inv_code: string;
  bank_value: string;
  product_name: string;
  quantity: number;
  price: number;
  va_status: string;
  total: number;
  created_at: string;
}

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

  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const isActive = location.pathname === "/products";
  const [products, setProducts] = useState<Transactions[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchText, setSearchText] = useState<string>("");
  const [status, setStatus] = useState<number | null>(location?.state?.status);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isModalImport, setIsModalImport] = useState<boolean>(false);
  const [form] = Form.useForm();

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [user, setUser] = useState<any>(null);
  const [myVendor, setMyVendor] = useState<any>(null);
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
    } catch (err) {
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
    } catch (err) {
      message.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    } catch (err) {
      console.error("Failed to fetch vendor");
    }
  };

  const columns: ColumnsType<Transactions> = [
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
      render: (price: number) => `${formatRupiah(price)}`,
      sorter: (a: Transactions, b: Transactions) => a.price - b.price,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      sorter: (a: Transactions, b: Transactions) => a.quantity - b.quantity,
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      render: (total: number) => `${formatRupiah(total)}`,
      sorter: (a: Transactions, b: Transactions) => a.total - b.total,
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
      render: (created_at: string) => dateTime(created_at),
      sorter: (a: Transactions, b: Transactions) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    },
    {
      title: "Status",
      dataIndex: "va_status",
      key: "va_status",
      render: (va_status: string) => (
        <>
          <span className="text-yellow-300 font-bold">
            {va_status === "pending" && "Pending"}
          </span>
          <span className="text-red-400 font-bold">
            {va_status === "expire" && "Expire"}
          </span>
          <span className="text-green-400 font-bold">
            {va_status === "settlement" && "settlement"}
          </span>
        </>
      ),
    },
  ];
  const dateTime = (req: string) => {
    return moment(req).tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");
  };

  const handleStatus = (e: number) => {
    navigate(location.pathname, { replace: true, state: null });
    setStatus(e);
  };
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
        {/* Sidebar for desktop */}
        <div className="hidden md:block w-64 fixed inset-y-0 bg-white shadow z-40">
          <SideBar />
        </div>

        {/* Drawer for mobile */}
        <Drawer
          placement="left"
          closable={false}
          onClose={() => setIsDrawerOpen(false)}
          open={isDrawerOpen}
          bodyStyle={{ padding: 0 }}
          width={256}
        >
          <SideBar />
        </Drawer>

        {/* Main Area */}
        <div className="flex-1 flex flex-col md:ml-64 w-full">
          {/* Top Bar */}
          <div className="bg-blue-100 text-blue-700 font-semibold px-4 h-[73px] flex items-center justify-between shadow-sm">
            <span className="text-base md:text-lg"></span>
          </div>

          <Navbar />

          {/* Content */}
          <main className="pt-4 px-3 md:px-8 pb-10 w-full">
            <div className="shadow-sm bg-white p-6 rounded w-full">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                <div>
                  <Title level={3} className="mb-1">
                    History Transactions
                  </Title>
                  <Text type="secondary">History Transactions Customer</Text>
                </div>
                {isActive && (
                  <>
                    <div className="flex flex-col md:flex-row gap-3 mx-3">
                      <button
                        onClick={() => setIsModalVisible(true)}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded w-full md:w-auto"
                      >
                        <AiOutlinePlus className="text-lg" />
                        Add Product
                      </button>

                      <button
                        onClick={() => setIsModalImport(true)}
                        className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded w-full md:w-auto"
                      >
                        <AiOutlinePlus className="text-lg" />
                        Import
                      </button>
                    </div>
                  </>
                )}
              </div>
              <Divider />
              {/* Search */}
              <div className="mb-4">
                <Input.Search
                  placeholder="Search products..."
                  allowClear
                  enterButton={<SearchOutlined />}
                  size="large"
                  className="w-full md:w-[400px]"
                  onChange={handleSearch}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Status Transaksi
                </label>
                <Select
                  onChange={handleStatus}
                  className="w-full"
                  value={status}
                  placeholder="Pilih status"
                  options={[
                    { label: "All", value: null },
                    { label: "Pending", value: 0 },
                    { label: "Settlement", value: 1 },
                    { label: "Expire", value: 2 },
                  ]}
                />
              </div>

              {/* Table */}
              <div className="overflow-x-auto w-full">
                <Table
                  columns={columns}
                  dataSource={products}
                  rowKey="id"
                  loading={loading}
                  pagination={false}
                  scroll={{ x: true }}
                  bordered
                />
              </div>
              {/* Pagination */}
              <div className="mt-4 flex justify-end">
                <Pagination
                  current={pagination.current}
                  pageSize={pagination.pageSize}
                  total={pagination.total}
                  showSizeChanger
                  showQuickJumper
                  onChange={(page, pageSize) =>
                    setPagination({ ...pagination, current: page, pageSize })
                  }
                  showTotal={(total, range) =>
                    `${range[0]}-${range[1]} of ${total} items`
                  }
                />
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default Transactions;
