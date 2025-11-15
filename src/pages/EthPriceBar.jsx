import React, { useState, useEffect } from "react";

const EthPriceBar = () => {
  const [price, setPrice] = useState(null);
  const [change24h, setChange24h] = useState(null);

  const fetchPrice = async () => {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true"
      );
      const data = await res.json();
      setPrice(data.ethereum.usd);
      setChange24h(data.ethereum.usd_24h_change);
    } catch (err) {
      console.error("Error fetching ETH price:", err);
    }
  };

  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, 30000); // every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
      <span className="font-bold">ETH:</span>
      <span className="font-mono">{price ? `$${price.toLocaleString()}` : "—"}</span>
      {change24h !== null && (
        <span
          className={`font-mono ${
            change24h >= 0 ? "text-green-400" : "text-red-400"
          }`}
        >
          {change24h >= 0 ? "+" : ""}
          {change24h.toFixed(2)}%
        </span>
      )}
    </div>
  );
};

export default EthPriceBar;
