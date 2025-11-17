import { useEffect, useState } from "react";
import { Wallet, JsonRpcProvider, formatEther, parseEther } from "ethers";
import { Link, useNavigate } from "react-router-dom";
import Footer from "./Footer";

export default function Dashboard() {
  const nav = useNavigate();

  // Wallet List
  const [walletList, setWalletList] = useState([]);
  const [selectedWalletIndex, setSelectedWalletIndex] = useState(null);

  // Unlocking
  const [walletPassword, setWalletPassword] = useState("");

  // Active Wallet
  const [wallet, setWallet] = useState(null);
  const [address, setAddress] = useState("");
  const [balanceEth, setBalanceEth] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Send ETH
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState(false);
  const [txHash, setTxHash] = useState("");

  // tx history
  const [transactions, setTransactions] = useState([]);

  // AES decrypt helper
  async function decrypt(cipher, iv, password) {
    const enc = new TextEncoder();
    const key = await crypto.subtle.digest("SHA-256", enc.encode(password));
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      key,
      "AES-GCM",
      false,
      ["decrypt"]
    );

    try {
      const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: new Uint8Array(iv) },
        cryptoKey,
        new Uint8Array(cipher)
      );
      return new TextDecoder().decode(decrypted);
    } catch {
      return null;
    }
  }

  useEffect(() => {
    let token = localStorage.getItem("TOKEN");
    if (!token) {
      window.location.href = "/login";
    }
  }, []);

  // Fetch wallets on component mount
  useEffect(() => {
    async function loadWallets() {
      try {
        const token = localStorage.getItem("TOKEN");

        const res = await fetch("http://localhost:5000/api/wallet/all", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        setWalletList(data.wallets || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load wallets.");
      }
    }

    loadWallets();
  }, []);

  // Unlock wallet
  async function unlockWallet() {
    if (selectedWalletIndex === null) return;

    const selected = walletList[selectedWalletIndex];

    const seedPhrase = await decrypt(
      selected.cipher,
      selected.iv,
      walletPassword
    );

    if (!seedPhrase) {
      alert("❌ Wrong password");
      return;
    }

    try {
      setLoading(true);

      const w = Wallet.fromPhrase(seedPhrase);
      const provider = new JsonRpcProvider(
        "https://ethereum-sepolia.publicnode.com"
      );
      const connected = w.connect(provider);

      setWallet(connected);
      setAddress(connected.address);

      const balance = await provider.getBalance(connected.address);
      setBalanceEth(formatEther(balance));

      fetchTxHistory(connected.address);
    } catch (err) {
      console.error(err);
      setError("Failed to unlock wallet");
    } finally {
      setLoading(false);
    }
  }

  // Fetch transactions
  async function fetchTxHistory(walletAddress) {
    try {
      const url = `https://eth-sepolia.blockscout.com/api/v2/addresses/${walletAddress}/transactions`;
      const res = await fetch(url);
      const data = await res.json();

      if (Array.isArray(data.items)) {
        setTransactions(data.items.slice(0, 8));
      } else {
        setTransactions([]);
      }
    } catch (err) {
      console.error("Tx fetch error:", err);
    }
  }

  // Send ETH
  async function handleSend() {
    if (!wallet) return alert("Unlock wallet first");
    if (!recipient || !amount) return alert("Enter address + amount");

    try {
      setSending(true);

      const tx = await wallet.sendTransaction({
        to: recipient,
        value: parseEther(amount),
      });

      await tx.wait();
      setTxHash(tx.hash);

      const provider = new JsonRpcProvider(
        "https://ethereum-sepolia.publicnode.com"
      );
      const bal = await provider.getBalance(wallet.address);
      setBalanceEth(formatEther(bal));

      fetchTxHistory(wallet.address);
    } catch (err) {
      console.error(err);
      alert("❌ Transaction failed");
    } finally {
      setSending(false);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("TOKEN");
    localStorage.removeItem("USER_ID");
    localStorage.removeItem("TEMP_USER_ID");
    window.location.href = "/login";
  };

  // Chart data
  const chartData = transactions.map((tx) => ({
    time: new Date(tx.timestamp).toLocaleTimeString(),
    value: Number(formatEther(BigInt(tx.value))),
    type:
      tx.from?.hash?.toLowerCase() === address.toLowerCase()
        ? "Sent"
        : "Received",
  }));

  // ---------------- UI -------------------

  // STEP 1 — SELECT WALLET
  if (
    walletList.length > 0 &&
    wallet === null &&
    selectedWalletIndex === null
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="bg-black p-6 rounded-xl w-full min-h-screen shadow-lg flex flex-col items-center relative">
          {/* Top Buttons */}
          <div className="absolute top-4 right-4 flex gap-3 flex-wrap">
            <Link to={"/create-wallet"}>
              <button className="bg-green-500 px-3 py-2 rounded-md font-medium hover:bg-green-600 transition">
                Create Wallet
              </button>
            </Link>

            <Link to={"/import-seed"}>
              <button className="bg-orange-500 px-3 py-2 rounded-md font-medium hover:bg-orange-600 transition">
                Forget Wallet
              </button>
            </Link>
            <button
              className="bg-red-500 px-3 py-2 rounded-md font-medium hover:bg-orange-600 transition"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold mb-6 mt-14 font-mono text-center">
            Select a Wallet
          </h1>

          {/* Wallet Grid */}
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 w-full px-4 max-w-7xl font-mono">
            {walletList.map((w, index) => (
              <li
                key={index}
                className="bg-orange-400 hover:bg-gray-800 transition p-4 rounded-xl cursor-pointer shadow-lg flex flex-col items-center justify-between text-center"
                onClick={() => setSelectedWalletIndex(index)}
              >
                <p className="font-bold text-lg">{w.label}</p>

                <img src="eht.png" alt="wallet-icon" className="w-20 my-3" />

                <p className="text-xs text-gray-900 mt-2">
                  Created: {new Date(w.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // STEP 2 — ENTER PASSWORD
  if (wallet === null) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white p-6 bg-gray-950">
        <div className="bg-gray-900 p-6 rounded-xl max-w-md w-full shadow-lg">
          <h1 className="text-xl font-bold mb-4">Unlock Wallet</h1>

          <input
            type="password"
            placeholder="Enter wallet password"
            className="w-full p-2 rounded bg-gray-800 border border-gray-700"
            value={walletPassword}
            onChange={(e) => setWalletPassword(e.target.value)}
          />

          <button
            onClick={unlockWallet}
            className="w-full mt-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition"
          >
            Unlock
          </button>
        </div>
        
      </div>
    );
  }

  // STEP 3 — DASHBOARD
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-6 bg-black text-white">
      <h1 className="text-2xl font-bold">Your Wallet</h1>

      <div className="p-6 rounded-lg  w-full text-center shadow-lg flex flex-col items-center justify-center">
        <div className="w-full sm:w-[70%] md:w-[50%] lg:w-[40%] h-auto p-6 shadow-lg flex flex-col items-center justify-center rounded-2xl bg-orange-500 hover:bg-gray-400 transition-all">
          {/* Wallet Address */}
          <p className="mt-1 text-sm sm:text-base md:text-lg font-mono break-words text-center px-2">
            {address}
          </p>

          {/* ETH Logo */}
          <img
            src="eht.png"
            alt="image"
            className="w-20 sm:w-24 md:w-28 lg:w-32 mt-4"
          />

          {/* Balance */}
          <p className="mt-4 text-xl sm:text-2xl font-semibold font-mono">
            Balance:{" "}
            {balanceEth === null ? "—" : `${Number(balanceEth).toFixed(4)} ETH`}
          </p>

          {/* ⭐ Mining Button ⭐ */}
          <a
            href={`https://sepolia-faucet.pk910.de/?address=${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-block bg-green-500 hover:bg-yellow-600 text-black font-semibold px-6 py-3 rounded-lg transition text-sm sm:text-base"
          >
            Mine ETH from Faucet
          </a>
        </div>

        {/* -------- Transactions -------- */}
        <div className="mt-6 pt-4 w-full">
          <h2 className="text-lg font-bold mb-3">Recent Transactions</h2>

          {transactions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              {transactions.map((tx) => (
                <div
                  key={tx.hash}
                  className="w-[full min-h-[10rem] p-4 flex flex-col items-center justify-center rounded-md bg-green-700 hover:bg-gray-400 transition"
                >
                  <p className="text-sm break-all">
                    <strong>Hash:</strong> {tx.hash.slice(0, 15)}...
                  </p>

                  <p className="text-sm pt-8">
                    <strong>Value:</strong> {formatEther(BigInt(tx.value))} ETH
                  </p>

                  <p className="text-sm ">
                    <strong>Time:</strong>{" "}
                    {new Date(tx.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No transactions.</p>
          )}
        </div>

        {/* Send ETH */}
        <div className="mt-8 border-t border-gray-700 pt-6">
          <h2 className="text-xl font-bold mb-2">Send ETH</h2>

          <input
            type="text"
            placeholder="Recipient Address"
            className="w-full p-2 mb-3 rounded bg-gray-800 border border-gray-700"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />

          <input
            type="number"
            placeholder="Amount (ETH)"
            className="w-full p-2 mb-3 rounded bg-gray-800 border border-gray-700"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <button
            onClick={handleSend}
            disabled={sending}
            className={`w-full py-2 rounded-lg transition ${
              sending ? "bg-gray-600" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {sending ? "Sending..." : "Send ETH"}
          </button>

          {txHash && (
            <p className="mt-3 text-sm text-green-400 break-all">
              Transaction: {txHash}
            </p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
