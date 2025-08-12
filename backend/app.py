from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import google.generativeai as genai
import os
from textblob import TextBlob
import asyncio
import aiohttp
from functools import wraps
import time

app = Flask(__name__)
CORS(app)

# Configure Gemini API
genai.configure(api_key=os.getenv('GEMINI_API_KEY', 'your_gemini_api_key_here'))
model = genai.GenerativeModel('gemini-2.0-flash')

class InvestIQAnalyzer:
    def __init__(self):
        self.cache = {}
        self.cache_duration = 300  # 5 minutes
    
    def cache_key(self, func_name, *args):
        return f"{func_name}_{hash(str(args))}"
    
    def get_cached_or_fetch(self, cache_key, fetch_func, *args):
        if cache_key in self.cache:
            data, timestamp = self.cache[cache_key]
            if time.time() - timestamp < self.cache_duration:
                return data
        
        result = fetch_func(*args)
        self.cache[cache_key] = (result, time.time())
        return result
    
    def get_stock_data(self, symbol, period="1mo"):
        """Fetch real-time stock data using yfinance"""
        try:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period=period)
            info = ticker.info
            
            # Current price and basic metrics
            current_price = hist['Close'].iloc[-1] if not hist.empty else None
            prev_close = info.get('previousClose', current_price)
            change = current_price - prev_close if current_price and prev_close else 0
            change_percent = (change / prev_close * 100) if prev_close else 0
            
            return {
                'symbol': symbol,
                'current_price': round(current_price, 2) if current_price else None,
                'change': round(change, 2),
                'change_percent': round(change_percent, 2),
                'volume': info.get('volume', 0),
                'market_cap': info.get('marketCap', 0),
                'pe_ratio': info.get('trailingPE', 0),
                'eps': info.get('trailingEps', 0),
                'dividend_yield': info.get('dividendYield', 0),
                'fifty_two_week_high': info.get('fiftyTwoWeekHigh', 0),
                'fifty_two_week_low': info.get('fiftyTwoWeekLow', 0),
                'company_name': info.get('longName', symbol),
                'sector': info.get('sector', 'N/A'),
                'industry': info.get('industry', 'N/A'),
                'historical_data': hist.reset_index().to_dict('records')
            }
        except Exception as e:
            print(f"Error fetching stock data for {symbol}: {str(e)}")
            return None
    
    def get_news_sentiment(self, symbol):
        """Fetch news and analyze sentiment"""
        try:
            ticker = yf.Ticker(symbol)
            news = ticker.news
            
            analyzed_news = []
            for article in news[:10]:  # Limit to 10 articles
                # Basic sentiment analysis using TextBlob
                sentiment = TextBlob(article.get('title', '') + ' ' + article.get('summary', '')).sentiment
                
                analyzed_news.append({
                    'title': article.get('title', ''),
                    'summary': article.get('summary', ''),
                    'url': article.get('link', ''),
                    'published': article.get('providerPublishTime', 0),
                    'publisher': article.get('publisher', ''),
                    'sentiment_score': round(sentiment.polarity, 2),
                    'sentiment_label': self.get_sentiment_label(sentiment.polarity)
                })
            
            return analyzed_news
        except Exception as e:
            print(f"Error fetching news for {symbol}: {str(e)}")
            return []
    
    def get_sentiment_label(self, polarity):
        if polarity > 0.1:
            return "Positive"
        elif polarity < -0.1:
            return "Negative"
        else:
            return "Neutral"
    
    async def get_ai_prediction(self, symbol, stock_data, news_data):
        """Generate AI-powered predictions using Gemini"""
        try:
            prompt = f"""
            Analyze the following stock data for {symbol} and provide a comprehensive investment analysis:
            
            Current Stock Data:
            - Current Price: ${stock_data.get('current_price', 0)}
            - Change: {stock_data.get('change', 0)} ({stock_data.get('change_percent', 0)}%)
            - P/E Ratio: {stock_data.get('pe_ratio', 0)}
            - Market Cap: {stock_data.get('market_cap', 0)}
            - Sector: {stock_data.get('sector', 'N/A')}
            
            Recent News Sentiment:
            {json.dumps(news_data[:5], indent=2) if news_data else 'No recent news available'}
            
            Please provide:
            1. Short-term price prediction (1-7 days)
            2. Medium-term outlook (1-3 months)
            3. Risk assessment (High/Medium/Low)
            4. Investment recommendation (Buy/Hold/Sell)
            5. Key factors influencing the prediction
            6. Confidence level (0-100%)
            
            Format the response as JSON.
            """
            
            response = model.generate_content(prompt)
            
            # Parse AI response (assuming it returns structured data)
            try:
                ai_analysis = json.loads(response.text)
            except:
                # Fallback if AI doesn't return proper JSON
                ai_analysis = {
                    "short_term_prediction": "Neutral",
                    "medium_term_outlook": "Monitor closely",
                    "risk_assessment": "Medium",
                    "recommendation": "Hold",
                    "key_factors": ["Market volatility", "Sector trends"],
                    "confidence_level": 75
                }
            
            return ai_analysis
            
        except Exception as e:
            print(f"Error generating AI prediction: {str(e)}")
            return {
                "short_term_prediction": "Analysis unavailable",
                "medium_term_outlook": "Requires manual review",
                "risk_assessment": "Medium",
                "recommendation": "Hold",
                "key_factors": ["Data unavailable"],
                "confidence_level": 50
            }
    
    def monte_carlo_simulation(self, historical_prices, days=30, simulations=1000):
        """Perform Monte Carlo simulation for price prediction"""
        try:
            returns = np.diff(np.log(historical_prices))
            mean_return = np.mean(returns)
            std_return = np.std(returns)
            
            current_price = historical_prices[-1]
            simulations_results = []
            
            for _ in range(simulations):
                prices = [current_price]
                for _ in range(days):
                    random_return = np.random.normal(mean_return, std_return)
                    new_price = prices[-1] * np.exp(random_return)
                    prices.append(new_price)
                simulations_results.append(prices[-1])
            
            return {
                'mean_price': round(np.mean(simulations_results), 2),
                'std_price': round(np.std(simulations_results), 2),
                'confidence_95_lower': round(np.percentile(simulations_results, 2.5), 2),
                'confidence_95_upper': round(np.percentile(simulations_results, 97.5), 2),
                'probability_increase': round(len([p for p in simulations_results if p > current_price]) / len(simulations_results) * 100, 2)
            }
        except Exception as e:
            print(f"Error in Monte Carlo simulation: {str(e)}")
            return None

analyzer = InvestIQAnalyzer()

@app.route('/api/stock/<symbol>')
def get_stock_info(symbol):
    """Get comprehensive stock information"""
    cache_key = analyzer.cache_key('stock_info', symbol.upper())
    
    def fetch_stock_info(sym):
        stock_data = analyzer.get_stock_data(sym)
        if not stock_data:
            return {'error': 'Stock data not available'}
        
        news_data = analyzer.get_news_sentiment(sym)
        
        # Monte Carlo simulation
        if stock_data.get('historical_data'):
            prices = [day['Close'] for day in stock_data['historical_data'] if day.get('Close')]
            if len(prices) > 10:
                monte_carlo = analyzer.monte_carlo_simulation(prices)
                stock_data['monte_carlo_prediction'] = monte_carlo
        
        stock_data['news'] = news_data
        return stock_data
    
    result = analyzer.get_cached_or_fetch(cache_key, fetch_stock_info, symbol.upper())
    return jsonify(result)

@app.route('/api/prediction/<symbol>')
async def get_ai_prediction(symbol):
    """Get AI-powered stock prediction"""
    try:
        stock_data = analyzer.get_stock_data(symbol.upper())
        news_data = analyzer.get_news_sentiment(symbol.upper())
        
        if not stock_data:
            return jsonify({'error': 'Unable to fetch stock data'})
        
        prediction = await analyzer.get_ai_prediction(symbol.upper(), stock_data, news_data)
        return jsonify(prediction)
    
    except Exception as e:
        return jsonify({'error': f'Prediction unavailable: {str(e)}'})

@app.route('/api/portfolio/analyze', methods=['POST'])
def analyze_portfolio():
    """Analyze portfolio performance and risk"""
    try:
        portfolio = request.json.get('portfolio', [])
        total_value = 0
        portfolio_analysis = []
        
        for holding in portfolio:
            symbol = holding.get('symbol')
            quantity = holding.get('quantity', 0)
            
            stock_data = analyzer.get_stock_data(symbol)
            if stock_data and stock_data.get('current_price'):
                value = quantity * stock_data['current_price']
                total_value += value
                
                portfolio_analysis.append({
                    'symbol': symbol,
                    'quantity': quantity,
                    'current_price': stock_data['current_price'],
                    'value': round(value, 2),
                    'change_percent': stock_data.get('change_percent', 0)
                })
        
        # Calculate portfolio metrics
        weights = [holding['value'] / total_value for holding in portfolio_analysis] if total_value > 0 else []
        weighted_return = sum(w * h['change_percent'] for w, h in zip(weights, portfolio_analysis)) if weights else 0
        
        return jsonify({
            'total_value': round(total_value, 2),
            'weighted_return': round(weighted_return, 2),
            'holdings': portfolio_analysis,
            'diversification_score': len(portfolio_analysis) * 10 if len(portfolio_analysis) <= 10 else 100
        })
    
    except Exception as e:
        return jsonify({'error': f'Portfolio analysis failed: {str(e)}'})

@app.route('/api/calculators/sip', methods=['POST'])
def calculate_sip():
    """Calculate SIP returns"""
    try:
        data = request.json
        monthly_investment = data.get('monthly_investment', 0)
        annual_return = data.get('annual_return', 12) / 100
        years = data.get('years', 1)
        
        months = years * 12
        monthly_return = annual_return / 12
        
        if monthly_return > 0:
            future_value = monthly_investment * (((1 + monthly_return) ** months - 1) / monthly_return) * (1 + monthly_return)
        else:
            future_value = monthly_investment * months
        
        total_invested = monthly_investment * months
        returns = future_value - total_invested
        
        return jsonify({
            'monthly_investment': monthly_investment,
            'total_invested': round(total_invested, 2),
            'future_value': round(future_value, 2),
            'returns': round(returns, 2),
            'return_percentage': round((returns / total_invested * 100), 2) if total_invested > 0 else 0
        })
    
    except Exception as e:
        return jsonify({'error': f'SIP calculation failed: {str(e)}'})

@app.route('/api/market-sentiment')
def get_market_sentiment():
    """Get overall market sentiment"""
    try:
        # Fetch data for major indices
        indices = ['SPY', 'QQQ', 'IWM']  # S&P 500, NASDAQ, Russell 2000
        sentiment_scores = []
        
        for index in indices:
            news = analyzer.get_news_sentiment(index)
            if news:
                avg_sentiment = sum(article['sentiment_score'] for article in news) / len(news)
                sentiment_scores.append(avg_sentiment)
        
        overall_sentiment = sum(sentiment_scores) / len(sentiment_scores) if sentiment_scores else 0
        
        return jsonify({
            'overall_sentiment': round(overall_sentiment, 2),
            'sentiment_label': analyzer.get_sentiment_label(overall_sentiment),
            'market_mood': 'Bullish' if overall_sentiment > 0.1 else 'Bearish' if overall_sentiment < -0.1 else 'Neutral',
            'confidence': min(abs(overall_sentiment) * 100, 100)
        })
    
    except Exception as e:
        return jsonify({'error': f'Market sentiment analysis failed: {str(e)}'})

@app.route('/api/watchlist', methods=['GET', 'POST'])
def manage_watchlist():
    """Manage user watchlist (simplified - in production, use database)"""
    if request.method == 'POST':
        # Add stock to watchlist
        symbol = request.json.get('symbol')
        # In production, store in database with user authentication
        return jsonify({'message': f'{symbol} added to watchlist'})
    else:
        # Get watchlist - return sample data
        return jsonify({
            'watchlist': ['AAPL', 'GOOGL', 'MSFT', 'TSLA'],
            'count': 4
        })

@app.route('/health')
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

if __name__ == '__main__':
    app.run(debug=True, port=5000)