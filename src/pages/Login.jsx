import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    const res = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("TEMP_USER_ID", data.userId);
      nav("/verify");
    } else {
      alert(data.message);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="border w-[27vw] h-[30vw] rounded-2xl flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-2xl mb-4 font-bold font-mono">Login</h1>

      <input
        type="email"
        placeholder="Email"
        className="p-2 mt-10 border mb-5 w-full max-w-sm rounded-md"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="p-2 border mb-6 w-full max-w-sm rounded-md"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleLogin}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Next
      </button>
      <a href="/register" className="mt-4 text-blue-600 hover:underline">Don't have an account? Register</a>
      </div>
    </div>
  );
}
