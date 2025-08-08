import SideBar from "../components/SideBar";
import Products from "./Products";
import Vendor from "./Vendor";

const Dashboard = () => {
  return (
    <div className="">
      {/* Halaman isi */}
      <h1 className="">Welcome to Dashboard</h1>
      <Vendor />
      <Products />
    </div>
  );
};

export default Dashboard;
