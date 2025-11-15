import { useState, useEffect } from "react";
import * as bip39 from "bip39";
import Navbar from "./Navbar";

export default function ImportFromSeed() {
  const [seed, setSeed] = useState("");
  const [password, setPassword] = useState("");
  const [label, setLabel] = useState("");
  const [saved, setSaved] = useState(false);

  // Encrypt function
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

  // Import wallet flow
  async function handleImport() {
    const phrase = seed.trim();

    if (!bip39.validateMnemonic(phrase)) {
      return alert("❌ Invalid seed phrase");
    }
    if (!password) return alert("Enter wallet password");
    if (!label.trim()) return alert("Enter a wallet name");

    const encrypted = await encrypt(phrase, password);

    // Send to backend
    const token = localStorage.getItem("TOKEN");
    if (!token) return alert("You must login using Face Auth first");

    const res = await fetch("http://localhost:5000/api/wallet/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        label,
        cipher: encrypted.cipher,
        iv: encrypted.iv,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("IMPORT ERROR:", data);
      return alert("❌ Failed to save wallet to server");
    }

    setSaved(true);
    setSeed("");
    setPassword("");
    setLabel("");
  }

  return (
    <div className="flex flex-col items-center bg-black text-white min-h-screen gap-4 p-6">
      <Navbar/>

      <h1 className="text-2xl font-bold mt-[10%]">Import Wallet Using Seed Phrase</h1>

      <textarea
        placeholder="Enter your 12 or 24 word seed phrase"
        className="p-3 border w-full max-w-lg h-32 rounded-md"
        value={seed}
        onChange={(e) => setSeed(e.target.value)}
      />

      <input
        type="text"
        placeholder="Wallet Name"
        className="px-4 py-2 border rounded w-full max-w-sm"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
      />

      <input
        type="password"
        placeholder="Set password for this wallet"
        className="px-4 py-2 border rounded w-full max-w-sm"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleImport}
        className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Import Wallet
      </button>

      {saved && (
        <p className="text-green-400 mt-2">
          ✅ Wallet imported successfully!  
          You can now open the Dashboard.
        </p>
      )}
    </div>
  );
}
