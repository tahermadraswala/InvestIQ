// src/pages/Portfolio.js (updated to display backend response structure, added form to add holdings)
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Card from '../components/Card';

const Portfolio = () => {
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  const fetchPortfolio = async () => {
    try {
      const response = await api.get('/portfolio');
      setPortfolioData(response.data);
    } catch (err) {
      setError('Failed to load portfolio.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError('');
    try {
      await api.post('/portfolio/add', { symbol: symbol.toUpperCase(), quantity: parseFloat(quantity) });
      setSymbol('');
      setQuantity(0);
      fetchPortfolio();  // Refresh portfolio
    } catch (err) {
      setAddError('Failed to add holding.');
      console.error(err);
    } finally {
      setAddLoading(false);
    }
  };

  if (loading) {
    return <p className="text-center">Loading...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Your Portfolio</h1>
      
      {/* Add Holding Form */}
      <form onSubmit={handleAddSubmit} className="max-w-md mx-auto mb-8 bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4">Add Holding</h3>
        <div className="mb-4">
          <label className="block mb-2">Stock Symbol</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Quantity</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            min="1"
          />
        </div>
        {addError && <p className="text-red-500 mb-4">{addError}</p>}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
          disabled={addLoading}
        >
          {addLoading ? 'Adding...' : 'Add to Portfolio'}
        </button>
      </form>

      {/* Portfolio Summary */}
      {portfolioData && (
        <Card title="Portfolio Summary">
          <p>Total Value: ${portfolioData.total_value}</p>
          <p>Weighted Return: {portfolioData.weighted_return}%</p>
          <p>Diversification Score: {portfolioData.diversification_score}</p>
        </Card>
      )}

      {/* Holdings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {portfolioData && portfolioData.holdings && portfolioData.holdings.length > 0 ? (
          portfolioData.holdings.map((item, index) => (
            <Card key={index} title={item.symbol}>
              <p>Quantity: {item.quantity}</p>
              <p>Value: ${item.value}</p>
              <p>Change: {item.change_percent}%</p>
            </Card>
          ))
        ) : (
          <p className="col-span-full text-center">No portfolio items yet. Add some above!</p>
        )}
      </div>
    </div>
  );
};

export default Portfolio;