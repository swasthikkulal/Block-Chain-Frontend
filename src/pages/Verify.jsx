import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Verify() {
  const userId = localStorage.getItem("TEMP_USER_ID");
  const nav = useNavigate();

  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // ----------------------------
  // SEND OTP
  // ----------------------------
  async function sendOtp() {
    if (!userId) return alert("User ID missing. Please login again.");

    setLoading(true);

    const res = await fetch("http://localhost:5000/api/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    const data = await res.json();
    setLoading(false);

    // Console-based OTP (dev mode)
    if (data.otp) {
      alert("OTP: " + data.otp);
    }

    // Email OTP (production)
    if (data.message) {
      alert(data.message);
      setSent(true); // 🔥 SHOW OTP INPUT
    } else {
      alert("Failed to send OTP");
    }
  }

  // ----------------------------
  // VERIFY OTP
  // ----------------------------
  async function verifyOtp() {
    if (!otp) return alert("Enter OTP");

    console.log("Sending verify:", { userId, otp });

    setLoading(true);

    const res = await fetch("http://localhost:5000/api/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, otp: otp.toString() }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      localStorage.setItem("TOKEN", data.token);
      localStorage.removeItem("TEMP_USER_ID");
      nav("/create-wallet");
    } else {
      alert(data.message || "OTP failed");
    }
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-6">
      <h1 className="text-xl font-bold mb-6">Choose Login Method</h1>

      <button
        onClick={() => nav("/face-login")}
        className="px-4 py-2 bg-green-600 text-white rounded mb-6 w-56"
      >
        Login with Face
      </button>

      <button
        disabled={loading}
        onClick={sendOtp}
        className="px-4 py-2 bg-blue-600 text-white rounded w-56"
      >
        {loading ? "Sending..." : "Send OTP"}
      </button>

      {sent && (
        <>
          <input
            type="number"
            placeholder="Enter OTP"
            className="border p-2 mt-4 text-black"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <button
            disabled={loading}
            onClick={verifyOtp}
            className="mt-3 px-4 py-2 bg-green-500 text-white rounded w-56"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </>
      )}
    </div>
  );
}
