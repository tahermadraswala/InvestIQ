// src/pages/Prediction.js (updated API call to GET /prediction/<symbol>, updated display to match backend response)
import React, { useState } from 'react';
import api from '../services/api';
import Card from '../components/Card';

const Prediction = () => {
  const [symbol, setSymbol] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPrediction(null);
    try {
      const response = await api.get(`/prediction/${symbol.toUpperCase()}`);
      setPrediction(response.data);
    } catch (err) {
      setError('Failed to get prediction.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Stock Prediction</h1>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-8">
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
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
          disabled={loading}
        >
          {loading ? 'Predicting...' : 'Predict'}
        </button>
      </form>
      {error && <p className="text-center text-red-500">{error}</p>}
      {prediction && (
        <Card title={`Prediction for ${symbol.toUpperCase()}`}>
          <p>Short-term Prediction: {prediction.short_term_prediction}</p>
          <p>Medium-term Outlook: {prediction.medium_term_outlook}</p>
          <p>Risk Assessment: {prediction.risk_assessment}</p>
          <p>Recommendation: {prediction.recommendation}</p>
          <p>Key Factors: {prediction.key_factors ? prediction.key_factors.join(', ') : 'N/A'}</p>
          <p>Confidence Level: {prediction.confidence_level}%</p>
        </Card>
      )}
    </div>
  );
};

export default Prediction;