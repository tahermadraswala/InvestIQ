from flask import Flask, jsonify
from flask_cors import CORS
import yfinance as yf
import numpy as np

app = Flask(__name__)
CORS(app)

def get_candlestick_data(ticker_symbol):
    # Fetch data using yfinance for the given ticker symbol.
    ticker = yf.Ticker(ticker_symbol)
    data = ticker.history(interval='5m', period='1d')
    
    # Ensure that data is available.
    if data.empty:
        return None, None, None
    
    # Calculate technical indicators (optional).
    data['SMA_50'] = data['Close'].rolling(window=10).mean()
    data['SMA_200'] = data['Close'].rolling(window=40).mean()
    
    # Prepare chart data for each timestamp.
    chart_data = [
        {
            'time': timestamp.strftime('%H:%M'),
            'open': round(row['Open'], 2),
            'high': round(row['High'], 2),
            'low': round(row['Low'], 2),
            'close': round(row['Close'], 2),
            'sma_50': round(row['SMA_50'], 2) if not np.isnan(row['SMA_50']) else None,
            'sma_200': round(row['SMA_200'], 2) if not np.isnan(row['SMA_200']) else None
        }
        for timestamp, row in data.iterrows()
    ]
    
    # Extract the closing prices as a separate list.
    closing_data = [entry['close'] for entry in chart_data]
    
    market_info = {
        'current_price': round(data['Close'].iloc[-1], 2),
        'daily_change': round(data['Close'].iloc[-1] - data['Close'].iloc[0], 2),
        'daily_change_percent': round((data['Close'].iloc[-1] / data['Close'].iloc[0] - 1) * 100, 2)
    }
    
    return chart_data, market_info, closing_data

@app.route('/api/market-data')
def all_market_data():
    try:
        # Retrieve data for each index.
        nifty_chart, nifty_info, nifty_close = get_candlestick_data("^NSEI")      # Nifty 50
        sensex_chart, sensex_info, sensex_close = get_candlestick_data("^BSESN")    # Sensex
        niftybank_chart, niftybank_info, niftybank_close = get_candlestick_data("^NSEBANK")  # Nifty Bank
        
        # If any index has no data, return a 404 error.
        if not all([nifty_chart, sensex_chart, niftybank_chart]):
            return jsonify({'error': 'No data available for one or more indices'}), 404
        
        # Return combined data in one JSON response.
        return jsonify({
            'nifty': {
                'chart_data': nifty_chart,
                'market_info': nifty_info,
                'closing_data': nifty_close
            },
            'sensex': {
                'chart_data': sensex_chart,
                'market_info': sensex_info,
                'closing_data': sensex_close
            },
            'niftybank': {
                'chart_data': niftybank_chart,
                'market_info': niftybank_info,
                'closing_data': niftybank_close
            }
        })
    except Exception as e:
        # On error, return the exception message with a 500 status code.
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Run on port 5000 (adjust as needed)
    app.run(debug=True, port=5005)
