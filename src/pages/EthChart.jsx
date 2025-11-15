import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const EthChart = () => {
  const [data, setData] = useState([]);

  const fetchEthHistory = async () => {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=365"
      );
      const json = await res.json();

      const formatted = json.prices.map(([timestamp, price]) => ({
        date: new Date(timestamp).toLocaleDateString("en-US", {
          month: "short",
        }), // ex: Jan, Feb
        price: Number(price.toFixed(2)),
      }));

      setData(formatted);
    } catch (error) {
      console.log("Error fetching ETH history:", error);
    }
  };

  useEffect(() => {
    fetchEthHistory();
  }, []);

  return (
    <div className="w-full h-[400px] bg-black rounded-xl p-4 shadow">
      <h2 className="text-lg font-bold mb-3">Ethereum – 1 Year Price Chart</h2>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorEth" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#008000" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#008000" stopOpacity={0} />
            </linearGradient>
          </defs>

          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 12 }} domain={["auto", "auto"]} />
          <Tooltip />

          <Area
            type="monotone"
            dataKey="price"
            stroke="#006400"
            strokeWidth={2}
            fill="url(#colorEth)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EthChart;
