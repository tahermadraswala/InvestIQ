from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_compress import Compress
import yfinance as yf
import pandas as pd
import numpy as np
import openai
import os
import logging
import json
from datetime import datetime, timedelta
from prophet import Prophet
import traceback

app = Flask(__name__)
CORS(app)
Compress(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
client = openai
openai.api_key = "api"

def get_historical_data(ticker):
    end_date = datetime.today()
    start_date = end_date - timedelta(days=730)
    hist = ticker.history(start=start_date, end=end_date, interval="1d")
    return hist[['Close']].dropna()

def calculate_bollinger_bands(series, window=20, num_std=2):
    sma = series.rolling(window=window).mean()
    std = series.rolling(window=window).std()
    upper = sma + (std * num_std)
    lower = sma - (std * num_std)
    
    # Clean NaN values and convert to None for JSON compatibility
    return {
        "dates": series.index.strftime('%Y-%m-%d').tolist(),
        "upper_band": [x if not np.isnan(x) else None for x in upper.round(2)],
        "middle_band": [x if not np.isnan(x) else None for x in sma.round(2)],
        "lower_band": [x if not np.isnan(x) else None for x in lower.round(2)]
    }

def calculate_rsi(series, period=14):
    delta = series.diff()
    gain = delta.where(delta > 0, 0)
    loss = -delta.where(delta < 0, 0)
    
    avg_gain = gain.ewm(alpha=1/period, adjust=False).mean()
    avg_loss = loss.ewm(alpha=1/period, adjust=False).mean()
    
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    
    # Clean NaN values
    return {
        "dates": series.index.strftime('%Y-%m-%d').tolist(),
        "values": [x if not np.isnan(x) else None for x in rsi.round(2)]
    }

def calculate_macd(series, fast=12, slow=26, signal=9):
    exp1 = series.ewm(span=fast, adjust=False).mean()
    exp2 = series.ewm(span=slow, adjust=False).mean()
    macd_line = exp1 - exp2
    signal_line = macd_line.ewm(span=signal, adjust=False).mean()
    histogram = macd_line - signal_line
    
    # Clean NaN values
    return {
        "dates": series.index.strftime('%Y-%m-%d').tolist(),
        "macd_line": [x if not np.isnan(x) else None for x in macd_line.round(4)],
        "signal_line": [x if not np.isnan(x) else None for x in signal_line.round(4)],
        "histogram": [x if not np.isnan(x) else None for x in histogram.round(4)]
    }

def get_technical_indicators(data):
    closes = data['Close'].dropna()  # Ensure we have clean data
    return {
        "rsi": calculate_rsi(closes),
        "macd": calculate_macd(closes),
        "bollinger_bands": calculate_bollinger_bands(closes)
    }

@app.route('/api/analyze', methods=['POST'])
def analyze_stock():
    try:
        data = request.get_json()
        symbol = data.get('symbol')
        ticker = yf.Ticker(symbol)
        info = ticker.info
        hist_data = get_historical_data(ticker)
        
        # Get latest RSI for AI analysis
        last_rsi = calculate_rsi(hist_data['Close'])['values'][-1] if len(hist_data) > 14 else None

        overview = {
            "name": info.get('shortName', symbol),
            "symbol": symbol,
            "sector": info.get('sector', 'N/A'),
            "industry": info.get('industry', 'N/A'),
            "employees": info.get('fullTimeEmployees'),
            "market_cap": round(info.get('marketCap', 0) / 1e9, 2),
            "pe_ratio": round(info.get('trailingPE', 0)), 
            "dividend_yield": round(info.get('dividendYield', 0) * 100, 2),
            "eps": info.get('trailingEps'),
            "beta": info.get('beta'),
            "description": info.get('longBusinessSummary', 'No description available')
        }

        analysis_prompt = f"""
        Generate a comprehensive analysis for {symbol} stock. Structure your response as valid JSON with:
        {{
            "summary": "Brief overview (50 words)",
            "strengths": ["3 key strengths"],
            "risks": ["3 key risks"],
            "forecast": "30-day price prediction analysis",
            "recommendation": "Buy/Hold/Sell"
        }}

        Consider these factors:
        - Financial metrics: P/E {overview['pe_ratio']}, Market Cap ${overview['market_cap']}B
        - Technical indicators: RSI {last_rsi}, MACD trend, Bollinger Bands position
        - Sector outlook: {overview['sector']}
        - Recent price movements
        """

        analysis = {}
        try:
            response = client.chat.completions.create(
                model="gpt-4-turbo",
                response_format={"type": "json_object"},
                messages=[{
                    "role": "user",
                    "content": analysis_prompt
                }],
                temperature=0.3,
                max_tokens=500
            )
            analysis = json.loads(response.choices[0].message.content)
        except Exception as e:
            logger.error(f"AI Analysis error: {traceback.format_exc()}")
            analysis = {
                "summary": "Analysis unavailable",
                "strengths": [],
                "risks": [],
                "forecast": "",
                "recommendation": "Hold"
            }

        return jsonify({
            "overview": overview,
            "historical": hist_data.reset_index().rename(columns={'Date': 'Date'}).to_dict('records'),
            "analysis": analysis,
            "technical_indicators": get_technical_indicators(hist_data)
        })

    except Exception as e:
        logger.error(f"Error: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/forecast', methods=['POST'])
def forecast():
    try:
        data = request.get_json()
        symbol = data.get('symbol')
        ticker = yf.Ticker(symbol)
        hist_data = get_historical_data(ticker)
        
        df = hist_data.reset_index().rename(columns={'Date': 'ds', 'Close': 'y'})
        
        model = Prophet(
            yearly_seasonality=False,
            weekly_seasonality=True,
            daily_seasonality=False,
            changepoint_prior_scale=0.5
        )
        model.fit(df)
        
        future = model.make_future_dataframe(periods=30)
        forecast = model.predict(future)
        
        return jsonify({
            "dates": forecast['ds'].dt.strftime('%Y-%m-%d').tolist()[-30:],
            "values": forecast['yhat'].round(2).tolist()[-30:],
            "confidence": forecast[['yhat_lower', 'yhat_upper']].values.tolist()[-30:]
        })

    except Exception as e:
        logger.error(f"Forecast error: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=3001, threaded=True)