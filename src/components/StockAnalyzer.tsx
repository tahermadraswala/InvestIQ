import { useState, useEffect } from "react";
import { Search, Building, TrendingUp, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  LineChart as RechartsChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine,
  Bar,
  Area
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

type StockData = {
  overview: {
    name: string;
    symbol: string;
    sector: string;
    industry?: string;
    employees?: number;
    market_cap: number;
    pe_ratio: number;
    dividend_yield: number;
    description: string;
    eps?: number;
    beta?: number;
  };
  historical: any[];
  analysis: {
    summary:
      "Company remains a strong market leader with robust financials and an innovative product portfolio. The stock shows resilience despite market fluctuations.",
    strengths: [
      "Strong brand recognition",
      "Innovative product lineup",
      "Robust ecosystem",
    ],
    risks: [
      "Intense competition",
      "Supply chain challenges",
      "Regulatory uncertainties",
    ],
    forecast:
      "stock is expected to trade in a narrow range with slight upward momentum over the next 30 days.",
    recommendation: "Hold",
  };
  
  technical_indicators: {
    rsi: { dates: string[], values: number[] },
    macd: { dates: string[], macd_line: number[], signal_line: number[], histogram: number[] },
    bollinger_bands: { dates: string[], upper_band: number[], middle_band: number[], lower_band: number[] }
  };
};

type ForecastData = {
  dates: string[];
  values: number[];
  confidence?: number[][];
};

export const StockAnalyzer = () => {
  const [query, setQuery] = useState("");
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (query) {
        setLoading(true);
        setError(null);
        fetch(`http://localhost:3001/api/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbol: query.toUpperCase() })
        })
          .then(res => {
            if (!res.ok) throw new Error('Failed to fetch stock data');
            return res.json();
          })
          .then(data => {
            setStockData(data);
            setLoading(false);
          })
          .catch(err => {
            setError(err.message);
            setLoading(false);
          });
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [query]);

  const handleForecast = async () => {
    setForecastLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: query.toUpperCase() })
      });
      if (!res.ok) throw new Error('Forecast failed');
      const data = await res.json();
      setForecast(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Forecast error');
    }
    setForecastLoading(false);
  };

  const chartData = (() => {
    const historical = stockData?.historical.map(item => ({
      date: new Date(item.Date).getTime(),
      value: item.Close,
      type: 'Historical'
    })) || [];
    
    const forecastData = forecast?.dates.map((date, index) => ({
      date: new Date(date).getTime(),
      value: forecast.values[index],
      type: 'Forecast',
      lower: forecast.confidence?.[index]?.[0],
      upper: forecast.confidence?.[index]?.[1]
    })) || [];

    return [...historical, ...forecastData];
  })();

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <AlertCircle className="mx-auto h-8 w-8" />
        <p className="mt-2">{error}</p>
      </div>
    );
  }
  

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search symbol (e.g. AAPL)"
          className="pl-10 text-lg py-6 rounded-xl"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading && <LoadingSkeleton />}

      {stockData && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="technicals">Technical Analysis</TabsTrigger>
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
            <TabsTrigger value="fundamentals">Fundamentals</TabsTrigger>
          </TabsList>

          {/* Overview Tab Content */}
          <TabsContent value="overview">
            <OverviewTab stockData={stockData} />
          </TabsContent>

          {/* Technical Analysis Tab */}
          <TabsContent value="technicals">
            <TechnicalAnalysis indicators={stockData.technical_indicators} />
          </TabsContent>

          {/* Forecast Tab */}
          <TabsContent value="forecast">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>30-Day Price Forecast</CardTitle>
                  <Button onClick={handleForecast} disabled={forecastLoading}>
                    {forecastLoading ? "Generating..." : "Update Forecast"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[500px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsChart data={chartData}>
                      <XAxis 
                        dataKey="date"
                        type="number"
                        domain={['auto', 'auto']}
                        tickFormatter={(ts) => new Date(ts).toLocaleDateString()}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(ts) => new Date(ts).toLocaleDateString()}
                        contentStyle={{ background: 'hsl(0 0% 100%)', border: 'none' }}
                      />
                      <Legend />
                      {forecast?.confidence && (
                        <Area
                          dataKey="upper"
                          fill="hsl(142.1 76.2% 36.3% / 0.1)"
                          stroke="none"
                          connectNulls
                        />
                      )}
                      {forecast?.confidence && (
                        <Area
                          dataKey="lower"
                          fill="hsl(142.1 76.2% 36.3% / 0.1)"
                          stroke="none"
                          connectNulls
                        />
                      )}
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={false}
                        name="Historical"
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#10b981"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                        name="Forecast"
                      />
                    </RechartsChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fundamentals Tab */}
          <TabsContent value="fundamentals">
            <FundamentalsTab overview={stockData.overview} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

const OverviewTab = ({ stockData }: { stockData: StockData }) => (
  <div className="grid md:grid-cols-2 gap-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Company Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          {stockData.overview.description}
        </p>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <StatBadge label="Sector" value={stockData.overview.sector} />
          <StatBadge label="Market Cap" value={`$${stockData.overview.market_cap}B`} />
          <StatBadge label="P/E Ratio" value={stockData.overview.pe_ratio} />
          <StatBadge label="Dividend Yield" value={`${stockData.overview.dividend_yield}%`} />
        </div>
      </CardContent>
    </Card>
    
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          AI Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stockData.analysis.recommendation && (
          <Badge variant={
            stockData.analysis.recommendation === 'Buy' ? 'default' :
            stockData.analysis.recommendation === 'Sell' ? 'destructive' : 'secondary'
          }>
            {stockData.analysis.recommendation} Recommendation
          </Badge>
        )}
        <div className="space-y-2">
          <h4 className="font-semibold">Key Strengths</h4>
          <ul className="list-disc pl-4">
            {stockData.analysis.strengths?.map((s, i) => (
              <li key={i} className="text-muted-foreground">{s}</li>
            ))}
          </ul>
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold">Potential Risks</h4>
          <ul className="list-disc pl-4">
            {stockData.analysis.risks?.map((r, i) => (
              <li key={i} className="text-muted-foreground">{r}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  </div>
);

const TechnicalAnalysis = ({ indicators }: { indicators: StockData['technical_indicators'] }) => {
  const rsiData = indicators.rsi.dates.map((date, i) => ({
    date: new Date(date).getTime(),
    rsi: indicators.rsi.values[i]
  }));

  const macdData = indicators.macd.dates.map((date, i) => ({
    date: new Date(date).getTime(),
    macd: indicators.macd.macd_line[i],
    signal: indicators.macd.signal_line[i],
    histogram: indicators.macd.histogram[i]
  }));

  const bollingerData = indicators.bollinger_bands.dates.map((date, i) => ({
    date: new Date(date).getTime(),
    upper: indicators.bollinger_bands.upper_band[i],
    middle: indicators.bollinger_bands.middle_band[i],
    lower: indicators.bollinger_bands.lower_band[i]
  }));

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>RSI is  Relative Strength Index (RSI) is a momentum oscillator that measures the speed and change of price movements. It ranges from 0 to 100 and is used to identify overbought or oversold conditions in a market</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsChart data={rsiData}>
                <XAxis 
                  dataKey="date"
                  type="number"
                  domain={['auto', 'auto']}
                  tickFormatter={(ts) => new Date(ts).toLocaleDateString()}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  labelFormatter={(ts) => new Date(ts).toLocaleDateString()}
                />
                <ReferenceLine y={30} stroke="#10b981" strokeDasharray="3 3" />
                <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" />
                <Line
                  dataKey="rsi"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                />
              </RechartsChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>The Moving Average Convergence Divergence (MACD) is a trend-following momentum indicator that shows the relationship between two moving averages of a security’s price.

</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsChart data={macdData}>
                <XAxis 
                  dataKey="date"
                  type="number"
                  domain={['auto', 'auto']}
                  tickFormatter={(ts) => new Date(ts).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(ts) => new Date(ts).toLocaleDateString()}
                />
                <Line
                  dataKey="macd"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  dataKey="signal"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                />
                <Bar dataKey="histogram" fill="#94a3b8" />
              </RechartsChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bollinger Bands are a volatility indicator that consists of three lines: a middle band (simple moving average), an upper band, and a lower band.</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsChart data={bollingerData}>
                <XAxis 
                  dataKey="date"
                  type="number"
                  domain={['auto', 'auto']}
                  tickFormatter={(ts) => new Date(ts).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(ts) => new Date(ts).toLocaleDateString()}
                />
                <Line
                  dataKey="upper"
                  stroke="#94a3b8"
                  strokeWidth={1}
                  dot={false}
                />
                <Line
                  dataKey="middle"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  dataKey="lower"
                  stroke="#94a3b8"
                  strokeWidth={1}
                  dot={false}
                />
              </RechartsChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const FundamentalsTab = ({ overview }: { overview: StockData['overview'] }) => (
  <div className="grid md:grid-cols-2 gap-6">
    <Card>
      <CardHeader>
        <CardTitle>Company Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <StatBadge label="Name" value={overview.name} />
        <StatBadge label="Sector" value={overview.sector} />
        <StatBadge label="Industry" value={overview.industry || 'N/A'} />
        <StatBadge label="Employees" value={overview.employees?.toLocaleString() || 'N/A'} />
        <StatBadge label="Market Cap" value={`$${overview.market_cap}B`} />
        <StatBadge label="P/E Ratio" value={overview.pe_ratio} />
        <StatBadge label="EPS" value={overview.eps || 'N/A'} />
        <StatBadge label="Beta" value={overview.beta || 'N/A'} />
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle>Business Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{overview.description}</p>
      </CardContent>
    </Card>
  </div>
);

const StatBadge = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
    <span className="text-sm">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

const LoadingSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-[400px] w-full rounded-xl" />
    <div className="grid md:grid-cols-2 gap-4">
      <Skeleton className="h-48 w-full rounded-lg" />
      <Skeleton className="h-48 w-full rounded-lg" />
    </div>
  </div>
);