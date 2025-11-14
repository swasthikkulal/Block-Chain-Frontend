import { BrowserRouter, Routes, Route } from "react-router-dom";
import CreateWallet from "./pages/CreateWallet";
import ImportWallet from "./pages/ImportWallet";
import Dashboard from "./pages/Dashboard";
import ImportFromSeed from "./pages/ImportFromSeed.jsx";
import FaceRegister from "./pages/FaceRegister.jsx";
import Register from "./pages/register.jsx";
import FaceLogin from "./pages/FaceLogin.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <div className="flex flex-col items-center justify-center h-screen gap-4">
              <h1 className="text-3xl font-bold">Secure Digital Wallet</h1>
              <a
                href="/create-wallet"
                className="px-6 py-3 bg-blue-600 text-white rounded"
              >
                Create Wallet
              </a>
              <a
                href="/import-wallet"
                className="px-6 py-3 bg-gray-800 text-white rounded"
              >
                Import Wallet
              </a>
              <a href="/import-seed" className="text-blue-400 underline">
                Import wallet using seed phrase
              </a>
            </div>
          }
        />
        <Route path="/create-wallet" element={<CreateWallet />} />
        <Route path="/import-wallet" element={<ImportWallet />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/import-seed" element={<ImportFromSeed />} />
        <Route path="/face-register" element={<FaceRegister />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<FaceLogin />} />
      </Routes>
    </BrowserRouter>
  );
}
