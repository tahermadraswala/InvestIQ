import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MarketOverview } from "@/components/MarketOverview";
import { TrendingUp, TrendingDown, Globe, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

interface MarketStat {
  stock: string;
  last_price: string;
  change: string;
  perc_change: string;
}

const Markets = () => {
  const [gainers, setGainers] = useState<MarketStat[]>([]);
  const [losers, setLosers] = useState<MarketStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarketStats = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5020/api/markets");
        if (!response.ok) throw new Error('Failed to fetch data');
        
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        
        setGainers(data.gainers);
        setLosers(data.losers);
        setError(null);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch market data');
        console.error("Error fetching market stats:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMarketStats();
    const interval = setInterval(fetchMarketStats, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 space-y-8 animate-fade-in">
        <section className="space-y-6 pt-16">
          {error && (
            <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50">
              {error}
            </div>
          )}

          {/* Rest of your UI remains the same */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Top Gainers</h2>
              <div className="space-y-4">
                {gainers.map((item, index) => (
                  <MarketItem key={index} item={item} type="gain" />
                ))}
                {gainers.length === 0 && !loading && (
                  <div className="text-center text-muted-foreground py-4">
                    No gainers data available
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Top Losers</h2>
              <div className="space-y-4">
                {losers.map((item, index) => (
                  <MarketItem key={index} item={item} type="loss" />
                ))}
                {losers.length === 0 && !loading && (
                  <div className="text-center text-muted-foreground py-4">
                    No losers data available
                  </div>
                )}
              </div>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

const MarketItem = ({ item, type }: { item: MarketStat; type: 'gain' | 'loss' }) => (
  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
    <div className="flex items-center gap-3">
      {type === 'gain' ? (
        <TrendingUp className="h-5 w-5 text-success" />
      ) : (
        <TrendingDown className="h-5 w-5 text-danger" />
      )}
      <div>
        <p className="font-medium">{item.stock}</p>
        <p className="text-sm text-muted-foreground">NYSE</p>
      </div>
    </div>
    <div className="text-right">
      <p className="font-medium">{item.last_price}</p>
      <p className={`text-sm ${type === 'gain' ? 'text-success' : 'text-danger'}`}>
        {type === 'gain' ? '+' : '-'}{item.perc_change}
      </p>
    </div>
  </div>
);

export default Markets;