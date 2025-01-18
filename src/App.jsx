//App.jsx
import { Routes, Route } from "react-router-dom";
import { Theme, Box } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import Dashboard from "./Pages/Dashboard";
import RequestForm from "./Pages/RequestForm";
import RequestDetail from "./features/request/RequestDetail";
import AdminPanel from "./Pages/AdminPanel";
import RequestMatrix from "./Pages/RequestMatrix";
import Navbar from "./components/Navbar";

function App() {
  return (
    <Theme appearance="light" accentColor="blue" radius="medium">
      <Box className="min-h-screen bg-[#F8FAFC]">
        <Navbar />
        <Box className="pt-6 pb-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/request/:id" element={<RequestDetail />} />
            <Route path="/create-request" element={<RequestForm />} />
            <Route path="/request-matrix" element={<RequestMatrix />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </Box>
      </Box>
    </Theme>
  );
}

export default App;
