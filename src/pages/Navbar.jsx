import React from "react";

const Navbar = () => {
  const handleLogout = () => {
    localStorage.removeItem("TOKEN");
    localStorage.removeItem("USER_ID");
    localStorage.removeItem("TEMP_USER_ID");
    window.location.href = "/login";
  };
  return (
    <nav className="w-full p-4 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between ">
      {/* Logo */}
      <div className="text-lg sm:text-xl font-bold text-center sm:text-left mb-2 sm:mb-0">
        Crypto Wallet
      </div>

      {/* Links */}
      <div className="flex flex-wrap justify-center  sm:justify-end gap-3 sm:gap-10 text-sm sm:text-base">
        <a href="/dashboard" className="hover:underline">
          Dashboard
        </a>

        <a href="/import-seed" className="hover:underline">
          Import Wallet
        </a>
        <button onClick={handleLogout} className="px-3 py-0.5 text-red-500 rounded-sm  border">Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
