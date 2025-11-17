import { Mail, Github, Twitter, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#0d0d0d] text-gray-300 py-10 px-6 mt-10 border-t border-gray-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">

        {/* BRAND */}
        <div>
          <h1 className="text-2xl font-bold text-white mb-3">Crypto Wallet</h1>
          <p className="text-sm text-gray-400 leading-relaxed">
            A simple and secure Web3 wallet to manage Ethereum, transactions,
            and blockchain access.
          </p>
        </div>

        {/* QUICK LINKS */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Links</h2>
          <ul className="space-y-2 text-sm">
            <li><a href="/dashboard" className="hover:text-white">Dashboard</a></li>
            <li><a href="/create-wallet" className="hover:text-white">Create Wallet</a></li>
            <li><a href="/import-seed" className="hover:text-white">Import Wallet</a></li>
            <li><a href="/login" className="hover:text-white">Login</a></li>
          </ul>
        </div>

       

        {/* SOCIAL */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Connect</h2>
          <div className="flex space-x-4 text-gray-400">
            <a href="#" className="hover:text-white"><Github size={22} /></a>
            <a href="#" className="hover:text-white"><Twitter size={22} /></a>
            <a href="#" className="hover:text-white"><Instagram size={22} /></a>
            <a href="mailto:support@wallet.com" className="hover:text-white"><Mail size={22} /></a>
          </div>
        </div>

      </div>

      {/* BOTTOM BAR */}
      <div className="mt-10 border-t border-gray-800 pt-5 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500">
        <p>© {new Date().getFullYear()} Crypto Wallet. All rights reserved.</p>
        <div className="flex space-x-4 mt-3 sm:mt-0">
          <a href="#" className="hover:text-gray-300">Terms</a>
          <a href="#" className="hover:text-gray-300">Privacy</a>
        </div>
      </div>
    </footer>
  );
}
