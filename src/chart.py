from flask import Flask, jsonify
from flask_cors import CORS
import yfinance as yf
import numpy as np

app = Flask(__name__)
CORS(app)

@app.route('/nifty-data')
def get_nifty_candlestick_data():
    try:
        # Fetch Nifty 50 data using yfinance
        nifty = yf.Ticker("^NSEI")
        data = nifty.history(interval='5m', period='1d')
        
        # Ensure data is not empty
        if data.empty:
            return jsonify({'error': 'No data available'}), 404
        
        # Calculate technical indicators (optional)
        data['SMA_50'] = data['Close'].rolling(window=10).mean()
        data['SMA_200'] = data['Close'].rolling(window=40).mean()
        
        # Prepare data for the frontend
        chart_data = [
            {
                'time': timestamp.strftime('%H:%M'),
                'open': round(row['Open'], 2),
                'high': round(row['High'], 2),
                'low': round(row['Low'], 2),
                'close': round(row['Close'], 2),
                'sma_50': round(row['SMA_50'], 2) if not np.isnan(row['SMA_50']) else None,
                'sma_200': round(row['SMA_200'], 2) if not np.isnan(row['SMA_200']) else None
            } for timestamp, row in data.iterrows()
        ]
        
        market_info = {
            'current_price': round(data['Close'].iloc[-1], 2),
            'daily_change': round(data['Close'].iloc[-1] - data['Close'].iloc[0], 2),
            'daily_change_percent': round((data['Close'].iloc[-1] / data['Close'].iloc[0] - 1) * 100, 2)
        }
        
        return jsonify({
            'chart_data': chart_data,
            'market_info': market_info
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
