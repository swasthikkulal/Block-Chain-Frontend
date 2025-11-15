import { useState } from "react";
import * as bip39 from "bip39";
import Navbar from "./Navbar";

export default function ImportWallet() {
  const [seed, setSeed] = useState("");
  const [password, setPassword] = useState("");
  const [label, setLabel] = useState("");

  // AES-GCM Encrypt Function
  async function encrypt(text, password) {
    const enc = new TextEncoder();
    const key = await crypto.subtle.digest("SHA-256", enc.encode(password));
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      key,
      "AES-GCM",
      false,
      ["encrypt"]
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      cryptoKey,
      enc.encode(text)
    );

    return {
      cipher: Array.from(new Uint8Array(encrypted)),
      iv: Array.from(iv),
    };
  }
 useEffect(() => {
    let token = localStorage.getItem("TOKEN");
    if (!token) {
      window.location.href = "/login";
    }
  }, []);
  
  const handleImport = async () => {
    if (!bip39.validateMnemonic(seed.trim())) {
      return alert("❌ Invalid seed phrase");
    }

    if (!password) return alert("Enter a password to secure this wallet");
    if (!label.trim()) return alert("Enter a wallet name");

    const encrypted = await encrypt(seed.trim(), password);

    const token = localStorage.getItem("TOKEN");
    if (!token) return alert("Please login first");

    const res = await fetch("http://localhost:5000/api/wallet/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        cipher: encrypted.cipher,
        iv: encrypted.iv,
        label,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error(data);
      return alert("❌ Failed to import wallet");
    }

    alert("✅ Wallet imported and saved securely!");
  };

  return (
    <div className="flex flex-col items-center  min-h-screen gap-4 p-6 bg-black text-white">
      <Navbar />
      <h1 className="text-2xl font-bold pt-[10%]">Import Wallet</h1>

      <textarea
        placeholder="Enter 12 or 24 word seed phrase"
        className="p-3 border rounded w-full max-w-lg h-32"
        value={seed}
        onChange={(e) => setSeed(e.target.value)}
      />

      <input
        type="text"
        placeholder="Wallet Name (Example: Savings Wallet)"
        className="px-4 py-2 border rounded w-full max-w-sm"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
      />

      <input
        type="password"
        placeholder="Set password to encrypt seed"
        className="px-4 py-2 border rounded w-full max-w-sm"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleImport}
        className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Import & Save Wallet
      </button>
    </div>
  );
}
