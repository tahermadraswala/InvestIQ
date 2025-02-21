import { useEffect, useState } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Market {
  name: string;
  value: string;
  change: string;
  isPositive: boolean;
}

export const MarketOverview = () => {
  const [markets, setMarkets] = useState<Market[]>([]);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        // Note: Ensure this URL (and port) matches your backend.
        const response = await fetch("http://127.0.0.1:5005/api/market-data");
        const data = await response.json();
        // Transform the object into an array.
        const marketsArray = Object.entries(data).map(([key, value]: [string, any]) => ({
          name: key,
          value: value.market_info.current_price.toString(),
          change: value.market_info.daily_change_percent.toString() + '%',
          isPositive: value.market_info.daily_change >= 0,
        }));
        setMarkets(marketsArray);
      } catch (error) {
        console.error("Error fetching market data:", error);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {markets.map((market) => (
        <Card
          key={market.name}
          className="p-4 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{market.name.toUpperCase()}</p>
              <p className="text-2xl font-semibold mt-1">{market.value}</p>
            </div>
            <div
              className={`flex items-center ${
                market.isPositive ? "text-[#22C55E]" : "text-[#EF4444]"
              }`}
            >
              {market.isPositive ? (
                <ArrowUp className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDown className="h-4 w-4 mr-1" />
              )}
              <span className="font-medium">{market.change}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
