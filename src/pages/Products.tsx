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
  created_at?: string;
  updated_at?: string;
}

const Products = () => {
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
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isModalImport, setIsModalImport] = useState<boolean>(false);
  const [form] = Form.useForm();

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [user, setUser] = useState<any>(null);
  const [myVendor, setMyVendor] = useState<any>(null);

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
      } else {
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
      title: "Total",
      key: "total",
      render: (_: any, record: Product) =>
        formatRupiah(record.price * record.stock),
      sorter: (a: Product, b: Product) => a.price * a.stock - b.price * b.stock,
    },
    ...(isActive
      ? [
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
                <Popconfirm
                  title="Delete this product?"
                  onConfirm={() => handleDelete(record)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button danger icon={<DeleteOutlined />} size="small" />
                </Popconfirm>
              </Space>
            ),
          },
        ]
      : []),
  ];

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
                    Products Management
                  </Title>
                  <Text type="secondary">Manage your product inventory</Text>
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
          title={editingProduct ? "Edit Product" : "Add New Product"}
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
              {editingProduct ? "Update" : "Create"}
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
              <Input placeholder="Enter product name" />
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
              <TextArea rows={4} placeholder="Enter product description" />
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
                  //   parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                />
              </Form.Item>

              <Form.Item
                name="stock"
                label="Stock Quantity"
                rules={[
                  {
                    required: true,
                    message: "Please input stock quantity!",
                  },
                ]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </div>
          </Form>
        </Modal>
        <ImportModal
          isModalImport={isModalImport}
          setIsModalImport={() => setIsModalImport(false)}
        />
      </div>
    </>
  );
};

export default Products;
