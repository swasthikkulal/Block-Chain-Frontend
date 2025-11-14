import { useState } from "react";
import axios from "axios";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleRegister = async () => {
    if (!email || !password) {
      return alert("Please enter email & password");
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await axios.post("http://localhost:5000/api/register", {
        email,
        password,
        encryptedSeed: "", // seed not created yet
        iv: [],
      });

      setMessage(
        `Registered! Your User ID: ${res.data.userId}. Now continue to Face Registration.`
      );

      // Store userId temporarily
      localStorage.setItem("USER_ID", res.data.userId);
        window.location.href = "/face-register";
    } catch (err) {
      console.log(err);
      setMessage("❌ Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-6">
      <h1 className="text-2xl font-bold">Register</h1>

      <input
        type="email"
        placeholder="Enter Email"
        className="px-4 py-2 border rounded w-full max-w-sm"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Enter Password"
        className="px-4 py-2 border rounded w-full max-w-sm"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleRegister}
        disabled={loading}
        className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        {loading ? "Registering..." : "Register"}
      </button>

      {message && (
        <p className="mt-4 text-green-400 text-center max-w-md">{message}</p>
      )}
    </div>
  );
}
