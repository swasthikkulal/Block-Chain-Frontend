import { BrowserRouter, Routes, Route } from "react-router-dom";
import CreateWallet from "./pages/CreateWallet";
import ImportWallet from "./pages/ImportWallet";
import Dashboard from "./pages/Dashboard";
import ImportFromSeed from "./pages/ImportFromSeed.jsx";
import FaceRegister from "./pages/FaceRegister.jsx";
import Register from "./pages/register.jsx";
import FaceLogin from "./pages/FaceLogin.jsx";
import Login from "./pages/Login.jsx";
import Verify from "./pages/Verify.jsx";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/create-wallet" element={<CreateWallet />} />
        <Route path="/import-wallet" element={<ImportWallet />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/import-seed" element={<ImportFromSeed />} />
        <Route path="/face-register" element={<FaceRegister />} />
        <Route path="/register" element={<Register />} />
        <Route path="/face-login" element={<FaceLogin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify" element={<Verify />} />
       
      </Routes>
    </BrowserRouter>
  );
}
