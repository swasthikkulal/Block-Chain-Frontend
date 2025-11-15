import { useState, useEffect } from "react";
import * as bip39 from "bip39";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import EthPriceBar from "./EthPriceBar";
import EthChart from "./EthChart";
export default function CreateWallet() {
  const [mnemonic, setMnemonic] = useState("");
  const [password, setPassword] = useState("");
  const [walletLabel, setWalletLabel] = useState("");
  const [encryptedSeed, setEncryptedSeed] = useState("");

  // Generate new seed phrase
  const generateSeed = async () => {
    const words = bip39.generateMnemonic(128);
    setMnemonic(words);

    // auto label example: Wallet 1 / Wallet 2 / My Wallet
    setWalletLabel(`Wallet-${Date.now()}`);
  };

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
  // Save encrypted wallet to backend
  const handleSave = async () => {
    if (!mnemonic || !password)
      return alert("Generate seed and enter password first.");

    if (!walletLabel.trim()) {
      return alert("Enter a wallet name");
    }

    const result = await encrypt(mnemonic, password);

    const token = localStorage.getItem("TOKEN");
    if (!token) {
      return alert("⚠️ Please login first (Face Login).");
    }

    const res = await fetch("http://localhost:5000/api/wallet/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        cipher: result.cipher,
        iv: result.iv,
        label: walletLabel, // << NEW — support multiple wallets
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error(data);
      return alert("❌ Failed to save wallet on server");
    }

    // Remove any insecure local copy
    localStorage.removeItem("WALLET_DATA");

    setEncryptedSeed(JSON.stringify(result, null, 2));

    alert(`✅ Wallet "${walletLabel}" saved securely on server!`);
    window.location.href = "/dashboard";
  };

  return (
    <div className="flex flex-col items-center  min-h-screen gap-4 p-6 bg-black text-white">
      <Navbar/>

      <h1 className="text-2xl font-bold pt-[10%]">Create New Wallet</h1>

      <button
        onClick={generateSeed}
        className="px-6 py-3 bg-blue-600 text-white rounded"
      >
        Generate Seed Phrase
      </button>

      {mnemonic && (
        <div className="p-4  rounded max-w-lg text-center">
          <p className="text-lg font-mono">{mnemonic}</p>
          <p className="text-red-400 text-sm mt-2">
            ⚠️ Write this down. Do not lose it.
          </p>
        </div>
      )}

      {mnemonic && (
        <>
          <input
            type="text"
            placeholder="Wallet Label (Example: Trading Wallet)"
            className="px-4 py-2 border rounded w-full max-w-sm"
            value={walletLabel}
            onChange={(e) => setWalletLabel(e.target.value)}
          />

          <input
            type="password"
            placeholder="Set Password (to encrypt seed)"
            className="px-4 py-2 border rounded w-full max-w-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleSave}
            className="px-6 py-3 bg-green-600 text-white rounded"
          >
            Save Wallet
          </button>
        </>
      )}

      {encryptedSeed && (
        <pre className="bg-gray-800 text-white p-4 text-xs rounded max-w-lg overflow-auto hidden">
          {encryptedSeed}
        </pre>
      )}
      <EthPriceBar/>
      <EthChart/>
    </div>
  );
}
