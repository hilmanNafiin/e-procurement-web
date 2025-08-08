import { useEffect } from "react";

interface AlertBoxProps {
  type: "success" | "error";
  message: string;
  onClose: () => void;
}

const AlertBox = ({ type, message, onClose }: AlertBoxProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`fixed top-4 right-4 px-4 py-2 rounded shadow-md text-white z-50 ${
        type === "success" ? "bg-green-600" : "bg-red-600"
      }`}
    >
      {message}
    </div>
  );
};

export default AlertBox;
