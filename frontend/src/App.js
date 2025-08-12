import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { Search, TrendingUp, TrendingDown, DollarSign, BarChart3, Bell, Settings, User, Plus, Minus, Eye, EyeOff, Calculator, Brain, Target, Award } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const InvestIQDashboard = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [searchSymbol, setSearchSymbol] = useState('AAPL');
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [portfolio, setPortfolio] = useState([
    { symbol: 'AAPL', quantity: 10 },
    { symbol: 'GOOGL', quantity: 5 },
    { symbol: 'MSFT', quantity: 8 }
  ]);
  const [portfolioAnalysis, setPortfolioAnalysis] = useState(null);
  const [marketSentiment, setMarketSentiment] = useState(null);
  const [sipCalculation, setSipCalculation] = useState(null);
  const [sipInputs, setSipInputs] = useState({
    monthly_investment: 10000,
    annual_return: 12,
    years: 5
  });
  const [watchlist, setWatchlist] = useState(['AAPL', 'GOOGL', 'MSFT', 'TSLA']);

  // Fetch stock data
  const fetchStockData = async (symbol) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/stock/${symbol}`);
      const data = await response.json();
      setStockData(data);
    } catch (error) {
      console.error('Error fetching stock data:', error);
    }
    setLoading(false);
  };

  // Fetch AI prediction
  const fetchPrediction = async (symbol) => {
    try {
      const response = await fetch(`${API_BASE}/prediction/${symbol}`);
      const data = await response.json();
      setPrediction(data);
    } catch (error) {
      console.error('Error fetching prediction:', error);
    }
  };

  // Fetch portfolio analysis
  const fetchPortfolioAnalysis = async () => {
    try {
      const response = await fetch(`${API_BASE}/portfolio/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolio })
      });
      const data = await response.json();
      setPortfolioAnalysis(data);
    } catch (error) {
      console.error('Error analyzing portfolio:', error);
    }
  };

  // Fetch market sentiment
  const fetchMarketSentiment = async () => {
    try {
      const response = await fetch(`${API_BASE}/market-sentiment`);
      const data = await response.json();
      setMarketSentiment(data);
    } catch (error) {
      console.error('Error fetching market sentiment:', error);
    }
  };

  // Calculate SIP
  const calculateSip = async () => {
    try {
      const response = await fetch(`${API_BASE}/calculators/sip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sipInputs)
      });
      const data = await response.json();
      setSipCalculation(data);
    } catch (error) {
      console.error('Error calculating SIP:', error);
    }
  };

  // Initialize data
  useEffect(() => {
    fetchStockData(searchSymbol);
    fetchMarketSentiment();
    fetchPortfolioAnalysis();
    calculateSip();
  }, []);

  useEffect(() => {
    if (stockData && !stockData.error) {
      fetchPrediction(searchSymbol);
    }
  }, [stockData, searchSymbol]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchSymbol.trim()) {
      fetchStockData(searchSymbol.toUpperCase());
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatNumber = (num) => {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num?.toFixed(2) || '0';
  };

  const getSentimentColor = (sentiment) => {
    if (sentiment === 'Positive') return 'text-green-500';
    if (sentiment === 'Negative') return 'text-red-500';
    return 'text-yellow-500';
  };

  const getSentimentIcon = (sentiment) => {
    if (sentiment === 'Positive') return <TrendingUp className="w-4 h-4" />;
    if (sentiment === 'Negative') return <TrendingDown className="w-4 h-4" />;
    return <Eye className="w-4 h-4" />;
  };

  const chartColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

  // Navigation
  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'analysis', name: 'Stock Analysis', icon: TrendingUp },
    { id: 'portfolio', name: 'Portfolio', icon: DollarSign },
    { id: 'calculators', name: 'Calculators', icon: Calculator },
    { id: 'finpal', name: 'FinPal AI', icon: Brain },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-black/30 backdrop-blur-xl border-r border-white/10 min-h-screen">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-white mb-2">InvestIQ</h1>
            <p className="text-purple-300 text-sm">AI-Powered Research</p>
          </div>
          
          <nav className="px-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-all ${
                    currentView === item.id
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </button>
              );
            })}
          </nav>

          {/* Market Sentiment Widget */}
          {marketSentiment && (
            <div className="mx-4 mt-8 p-4 bg-white/5 rounded-lg border border-white/10">
              <h3 className="text-white font-semibold mb-2">Market Mood</h3>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  marketSentiment.market_mood === 'Bullish' ? 'bg-green-500' :
                  marketSentiment.market_mood === 'Bearish' ? 'bg-red-500' : 'bg-yellow-500'
                }`}></div>
                <span className="text-sm text-gray-300">{marketSentiment.market_mood}</span>
              </div>
              <div className="mt-2 text-xs text-gray-400">
                Confidence: {marketSentiment.confidence?.toFixed(1)}%
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {currentView === 'dashboard' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white">Dashboard</h2>
                <div className="flex items-center space-x-4">
                  <Bell className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
                  <Settings className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
                  <User className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm">Portfolio Value</p>
                      <p className="text-2xl font-bold text-white">
                        {portfolioAnalysis ? formatPrice(portfolioAnalysis.total_value) : '$0'}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-400" />
                  </div>
                  <div className="mt-2">
                    <span className={`text-sm ${
                      portfolioAnalysis?.weighted_return >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {portfolioAnalysis?.weighted_return >= 0 ? '+' : ''}
                      {portfolioAnalysis?.weighted_return?.toFixed(2)}%
                    </span>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm">Watchlist</p>
                      <p className="text-2xl font-bold text-white">{watchlist.length}</p>
                    </div>
                    <Eye className="w-8 h-8 text-blue-400" />
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm">AI Confidence</p>
                      <p className="text-2xl font-bold text-white">
                        {prediction?.confidence_level || 0}%
                      </p>
                    </div>
                    <Brain className="w-8 h-8 text-purple-400" />
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm">Risk Level</p>
                      <p className="text-2xl font-bold text-white">
                        {prediction?.risk_assessment || 'Medium'}
                      </p>
                    </div>
                    <Target className="w-8 h-8 text-orange-400" />
                  </div>
                </div>
              </div>

              {/* Watchlist Quick View */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-4">Watchlist</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {watchlist.map((symbol) => (
                    <div
                      key={symbol}
                      onClick={() => {
                        setSearchSymbol(symbol);
                        setCurrentView('analysis');
                        fetchStockData(symbol);
                      }}
                      className="bg-white/5 rounded-lg p-4 cursor-pointer hover:bg-white/10 transition-all"
                    >
                      <div className="font-semibold text-white">{symbol}</div>
                      <div className="text-sm text-gray-300">Click to analyze</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentView === 'analysis' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white">Stock Analysis</h2>
                
                {/* Search */}
                <form onSubmit={handleSearch} className="flex space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={searchSymbol}
                      onChange={(e) => setSearchSymbol(e.target.value)}
                      placeholder="Enter stock symbol"
                      className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Search
                  </button>
                </form>
              </div>

              {loading && (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                </div>
              )}

              {stockData && !stockData.error && !loading && (
                <div className="space-y-6">
                  {/* Stock Header */}
                  <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl font-bold text-white">{stockData.company_name}</h3>
                        <p className="text-gray-300">{stockData.symbol} • {stockData.sector}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-white">
                          {formatPrice(stockData.current_price)}
                        </div>
                        <div className={`flex items-center justify-end space-x-1 ${
                          stockData.change >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {stockData.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          <span>{stockData.change >= 0 ? '+' : ''}{stockData.change} ({stockData.change_percent}%)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                      <div className="text-gray-300 text-sm">Market Cap</div>
                      <div className="text-white font-semibold">{formatNumber(stockData.market_cap)}</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                      <div className="text-gray-300 text-sm">P/E Ratio</div>
                      <div className="text-white font-semibold">{stockData.pe_ratio?.toFixed(2) || 'N/A'}</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                      <div className="text-gray-300 text-sm">EPS</div>
                      <div className="text-white font-semibold">{stockData.eps?.toFixed(2) || 'N/A'}</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                      <div className="text-gray-300 text-sm">Volume</div>
                      <div className="text-white font-semibold">{formatNumber(stockData.volume)}</div>
                    </div>
                  </div>

                  {/* Chart */}
                  {stockData.historical_data && (
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                      <h4 className="text-lg font-semibold text-white mb-4">Price Chart</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={stockData.historical_data}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="Date" stroke="#9CA3AF" />
                          <YAxis stroke="#9CA3AF" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1F2937', 
                              border: '1px solid #374151',
                              borderRadius: '8px'
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="Close" 
                            stroke="#8B5CF6" 
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* AI Prediction */}
                  {prediction && (
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                      <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <Brain className="w-5 h-5 mr-2" />
                        AI-Powered Analysis
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-300">Recommendation:</span>
                              <span className={`font-semibold ${
                                prediction.recommendation === 'Buy' ? 'text-green-400' :
                                prediction.recommendation === 'Sell' ? 'text-red-400' : 'text-yellow-400'
                              }`}>{prediction.recommendation}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Risk Assessment:</span>
                              <span className="text-white font-semibold">{prediction.risk_assessment}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Confidence:</span>
                              <span className="text-white font-semibold">{prediction.confidence_level}%</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-300 text-sm mb-2">Key Factors:</div>
                          <ul className="space-y-1">
                            {prediction.key_factors?.map((factor, index) => (
                              <li key={index} className="text-white text-sm">• {factor}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Monte Carlo Simulation */}
                  {stockData.monte_carlo_prediction && (
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                      <h4 className="text-lg font-semibold text-white mb-4">Monte Carlo Simulation</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-gray-300 text-sm">Mean Price (30d)</div>
                          <div className="text-white font-semibold">{formatPrice(stockData.monte_carlo_prediction.mean_price)}</div>
                        </div>
                        <div>
                          <div className="text-gray-300 text-sm">95% Confidence Lower</div>
                          <div className="text-white font-semibold">{formatPrice(stockData.monte_carlo_prediction.confidence_95_lower)}</div>
                        </div>
                        <div>
                          <div className="text-gray-300 text-sm">95% Confidence Upper</div>
                          <div className="text-white font-semibold">{formatPrice(stockData.monte_carlo_prediction.confidence_95_upper)}</div>
                        </div>
                        <div>
                          <div className="text-gray-300 text-sm">Probability of Increase</div>
                          <div className="text-white font-semibold">{stockData.monte_carlo_prediction.probability_increase}%</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* News */}
                  {stockData.news && stockData.news.length > 0 && (
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                      <h4 className="text-lg font-semibold text-white mb-4">Latest News</h4>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {stockData.news.slice(0, 5).map((article, index) => (
                          <div key={index} className="border-l-4 border-purple-500 pl-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h5 className="text-white font-medium mb-1">{article.title}</h5>
                                <p className="text-gray-300 text-sm mb-2">{article.summary}</p>
                                <div className="flex items-center space-x-4 text-xs">
                                  <span className="text-gray-400">{article.publisher}</span>
                                  <div className={`flex items-center space-x-1 ${getSentimentColor(article.sentiment_label)}`}>
                                    {getSentimentIcon(article.sentiment_label)}
                                    <span>{article.sentiment_label}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {stockData?.error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6">
                  <div className="text-red-400 font-semibold">Error loading stock data</div>
                  <div className="text-red-300 text-sm mt-1">Please check the symbol and try again.</div>
                </div>
              )}
            </div>
          )}

          {currentView === 'portfolio' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white">Portfolio</h2>
                <button 
                  onClick={fetchPortfolioAnalysis}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Refresh Analysis
                </button>
              </div>

              {portfolioAnalysis && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                    <div className="text-gray-300 text-sm">Total Value</div>
                    <div className="text-3xl font-bold text-white">{formatPrice(portfolioAnalysis.total_value)}</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                    <div className="text-gray-300 text-sm">Weighted Return</div>
                    <div className={`text-3xl font-bold ${
                      portfolioAnalysis.weighted_return >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {portfolioAnalysis.weighted_return >= 0 ? '+' : ''}{portfolioAnalysis.weighted_return?.toFixed(2)}%
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                    <div className="text-gray-300 text-sm">Diversification Score</div>
                    <div className="text-3xl font-bold text-white">{portfolioAnalysis.diversification_score}/100</div>
                  </div>
                </div>
              )}

              {portfolioAnalysis?.holdings && (
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <h3 className="text-xl font-semibold text-white mb-4">Holdings</h3>
                  <div className="space-y-4">
                    {portfolioAnalysis.holdings.map((holding, index) => (
                      <div key={index} className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="font-semibold text-white">{holding.symbol}</div>
                          <div className="text-gray-300">{holding.quantity} shares</div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-semibold">{formatPrice(holding.value)}</div>
                          <div className={`text-sm ${
                            holding.change_percent >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {holding.change_percent >= 0 ? '+' : ''}{holding.change_percent?.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {currentView === 'calculators' && (
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-white">Financial Calculators</h2>

              {/* SIP Calculator */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-4">SIP Calculator</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">Monthly Investment (₹)</label>
                      <input
                        type="number"
                        value={sipInputs.monthly_investment}
                        onChange={(e) => setSipInputs({...sipInputs, monthly_investment: Number(e.target.value)})}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">Expected Annual Return (%)</label>
                      <input
                        type="number"
                        value={sipInputs.annual_return}
                        onChange={(e) => setSipInputs({...sipInputs, annual_return: Number(e.target.value)})}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">Investment Period (Years)</label>
                      <input
                        type="number"
                        value={sipInputs.years}
                        onChange={(e) => setSipInputs({...sipInputs, years: Number(e.target.value)})}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <button
                      onClick={calculateSip}
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Calculate SIP
                    </button>
                  </div>
                  
                  {sipCalculation && (
                    <div className="space-y-4">
                      <div className="bg-white/5 rounded-lg p-4">
                        <div className="text-gray-300 text-sm">Total Investment</div>
                        <div className="text-2xl font-bold text-white">₹{sipCalculation.total_invested?.toLocaleString()}</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-4">
                        <div className="text-gray-300 text-sm">Future Value</div>
                        <div className="text-2xl font-bold text-green-400">₹{sipCalculation.future_value?.toLocaleString()}</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-4">
                        <div className="text-gray-300 text-sm">Wealth Gained</div>
                        <div className="text-2xl font-bold text-purple-400">₹{sipCalculation.returns?.toLocaleString()}</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-4">
                        <div className="text-gray-300 text-sm">Return %</div>
                        <div className="text-2xl font-bold text-blue-400">{sipCalculation.return_percentage?.toFixed(2)}%</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentView === 'finpal' && (
            <div className="space-y-8">
              <div className="flex items-center space-x-3">
                <Brain className="w-8 h-8 text-purple-400" />
                <h2 className="text-3xl font-bold text-white">FinPal AI Assistant</h2>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <div className="text-center py-12">
                  <Brain className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold text-white mb-2">AI Assistant Coming Soon</h3>
                  <p className="text-gray-300 mb-6">FinPal will provide 24/7 financial insights, personalized recommendations, and market alerts.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <div className="bg-white/5 rounded-lg p-6">
                      <Award className="w-8 h-8 text-green-400 mb-3" />
                      <h4 className="text-white font-semibold mb-2">Personalized Insights</h4>
                      <p className="text-gray-300 text-sm">Get AI-driven investment recommendations based on your portfolio and risk profile.</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-6">
                      <Bell className="w-8 h-8 text-blue-400 mb-3" />
                      <h4 className="text-white font-semibold mb-2">Smart Alerts</h4>
                      <p className="text-gray-300 text-sm">Receive real-time notifications about market changes affecting your investments.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvestIQDashboard;