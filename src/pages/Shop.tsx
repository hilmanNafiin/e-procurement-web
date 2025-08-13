import { useState, useEffect } from "react";
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
import { useLocation } from "react-router-dom";
import AlertBox from "../components/AlertBox";
import ImportModal from "../components/ModalProductsImport";
import formatRupiah from "../components/IDR";

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
  quantity: number; // new
  bank_value: string; // new
  customer_name: string; // new
  customer_phone: string; // new
  created_at?: string;
  updated_at?: string;
}
interface VaNumber {
  bank: string;
  va_number: string;
}

interface BankTransferResponse {
  status_code: string;
  status_message: string;
  transaction_id: string;
  order_id: string;
  merchant_id: string;
  gross_amount: string;
  currency: string;
  payment_type: string;
  transaction_time: string;
  transaction_status: string;
  fraud_status: string;
  va_numbers: VaNumber[];
  expiry_time: string;
}

const Shop = () => {
  const ls = new SecureLS({ encodingType: "aes" });

  const token = ls.get("isLogin");
  const API_URL = import.meta.env.VITE_API_URL;

  const headers = {
    Authorization: `Bearer ${token?.tokens?.replace("Bearer ", "")}`,
  };
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const location = useLocation();
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const isActive = location.pathname === "/products";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchText, setSearchText] = useState<string>("");
  const [callbackTrx, setCallbackTrx] = useState<BankTransferResponse | null>(
    null
  );
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isModalCallback, setIsModalCallback] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(0);
  const [form] = Form.useForm();

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [user, setUser] = useState<any>(null);
  const [myVendor, setMyVendor] = useState<any>(null);
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
    } catch (err) {
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

  const showModal = (product: Product | null = null) => {
    if (product) {
      form.setFieldsValue(product);
      setEditingProduct(product);
    } else {
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
    } catch (error) {
      message.error("Failed to save product");
    }
  };

  const handleDelete = async (param: any) => {
    try {
      const response = await axios.delete(
        `${API_URL}/products?product_id=${param?.id}`,
        {
          headers,
        }
      );
      if (response.data.status)
        setAlert({ type: "success", message: response.data.messages });
      if (!response.data.status)
        setAlert({ type: "error", message: response.data.messages });
      fetchProducts();
    } catch (error) {
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
    } catch (err) {
      console.error("Failed to fetch vendor");
    }
  };
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a: Product, b: Product) => a.name.localeCompare(b.name),
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
      render: (price: number) => `${formatRupiah(price)}`,
      sorter: (a: Product, b: Product) => a.price - b.price,
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      sorter: (a: Product, b: Product) => a.stock - b.stock,
    },

    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Product) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
            size="small"
          />
        </Space>
      ),
    },
  ];
  const handleQuantity = (value: number | null) => {
    setQuantity(value ?? 0);
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

        {/* Main Area */}
        <div className="flex-1 flex flex-col w-full">
          {/* Top Bar */}
          <div className="bg-blue-100 text-blue-700 font-semibold px-4 h-[73px] flex items-center justify-between shadow-sm">
            <span className="text-base md:text-lg"></span>
          </div>

          {/* Content */}
          <main className="pt-4 px-3 md:px-8 pb-10 w-full">
            <div className="shadow-sm bg-white p-6 rounded w-full">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                <div>
                  <Title level={3} className="mb-1">
                    Shoping
                  </Title>
                  <Text type="secondary">Manage your product inventory</Text>
                </div>
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
        {/* Modal */}
        <Modal
          title={"Input Pembayaran"}
          visible={isModalVisible}
          onOk={handleSubmit}
          onCancel={handleCancel}
          confirmLoading={loading}
          width={700}
          footer={[
            <Button key="back" onClick={handleCancel}>
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={loading}
              onClick={handleSubmit}
            >
              Checkout
            </Button>,
          ]}
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{ price: 0, stock: 0 }}
          >
            <Form.Item
              name="name"
              label="Product Name"
              rules={[
                { required: true, message: "Please input product name!" },
              ]}
            >
              <Input placeholder="Enter product name" readOnly />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[
                {
                  required: true,
                  message: "Please input product description!",
                },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Enter product description"
                readOnly
              />
            </Form.Item>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="price"
                label="Price"
                rules={[
                  {
                    required: true,
                    message: "Please input product price!",
                  },
                ]}
              >
                <InputNumber
                  min={0}
                  step={0.01}
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  readOnly
                  //   parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                />
              </Form.Item>
              <Form.Item
                name="quantity"
                label="Masukan quantity"
                rules={[{ required: true, message: "Masukkan quantity!" }]}
                initialValue={0}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  onChange={handleQuantity}
                />
              </Form.Item>

              <Form.Item
                name="customer_name"
                label="Customer Name"
                rules={[
                  { required: true, message: "Please input customer name!" },
                ]}
              >
                <Input placeholder="Enter product name" />
              </Form.Item>
              <Form.Item
                name="customer_phone"
                label="Customer Phone"
                rules={[
                  { required: true, message: "Please input customer phone!" },
                ]}
              >
                <Input placeholder="Enter product name" />
              </Form.Item>
              <Form.Item
                name="bank_value"
                label="Pilih Metode Pembayaran"
                rules={[
                  {
                    required: true,
                    message: "Please select a payment method!",
                  },
                ]}
              >
                <Select placeholder="Pilih metode pembayaran">
                  <Select.Option value="bca">BCA</Select.Option>
                  <Select.Option value="bni">BNI</Select.Option>s
                </Select>
              </Form.Item>
            </div>
          </Form>
          <div className="max-w-xs bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-center mb-4">Total</h2>

            <div className="flex justify-between mb-2">
              <span>Biaya Admins</span>
              <span>Rp 4.440</span>
            </div>

            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>
                Rp{" "}
                {(editingProduct ? editingProduct.price * quantity + 4440 : 0)
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              </span>
            </div>
          </div>
        </Modal>
        <Modal
          title="Detail Transaksi"
          open={isModalCallback}
          onCancel={() => setIsModalCallback(false)}
          footer={null}
        >
          {callbackTrx && (
            <div className="space-y-2">
              <p>
                <strong>Status:</strong> {callbackTrx.status_message}
              </p>
              <p>
                <strong>Transaction ID:</strong> {callbackTrx.transaction_id}
              </p>
              <p>
                <strong>Order ID:</strong> {callbackTrx.order_id}
              </p>
              <p>
                <strong>Merchant ID:</strong> {callbackTrx.merchant_id}
              </p>
              <p>
                <strong>Gross Amount:</strong> Rp{" "}
                {Number(callbackTrx.gross_amount).toLocaleString("id-ID")}
              </p>
              <p>
                <strong>Payment Type:</strong> {callbackTrx.payment_type}
              </p>
              <p>
                <strong>Transaction Time:</strong>{" "}
                {callbackTrx.transaction_time}
              </p>
              <p>
                <strong>Transaction Status:</strong>{" "}
                {callbackTrx.transaction_status}
              </p>
              <p>
                <strong>Fraud Status:</strong> {callbackTrx.fraud_status}
              </p>
              <p>
                <strong>Expiry Time:</strong> {callbackTrx.expiry_time}
              </p>

              {callbackTrx.va_numbers && callbackTrx.va_numbers.length > 0 && (
                <div className="mt-3">
                  <h4 className="font-semibold mb-2">Virtual Account</h4>
                  <Table
                    dataSource={callbackTrx.va_numbers.map((item, index) => ({
                      key: index,
                      bank: item.bank.toUpperCase(),
                      va_number: item.va_number,
                    }))}
                    columns={[
                      { title: "Bank", dataIndex: "bank", key: "bank" },
                      {
                        title: "VA Number",
                        dataIndex: "va_number",
                        key: "va_number",
                      },
                    ]}
                    pagination={false}
                    size="small"
                  />
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </>
  );
};

export default Shop;
