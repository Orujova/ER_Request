import { Toaster } from "sonner";

export const ToastContainer = () => (
  <Toaster
    position="top-right"
    toastOptions={{
      duration: 2000,
      style: {
        minWidth: "300px",
        borderRadius: "0.5rem",
        border: "1px solid #e2e8f0",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      },
    }}
  />
);

export default ToastContainer;
