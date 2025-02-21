from flask import Flask, jsonify
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup
import re
import json

app = Flask(__name__)
CORS(app)

# Hardcoded Indian stock data
HARDCODED_GAINERS = [
    {"stock": "NSE:RELIANCE", "last_price": "2,856.50", "change": "+87.50", "perc_change": "+3.15%"},
    {"stock": "NSE:TATASTEEL", "last_price": "1,230.40", "change": "+45.20", "perc_change": "+3.82%"},
    {"stock": "NSE:INFY", "last_price": "1,540.00", "change": "+32.75", "perc_change": "+2.17%"},
    {"stock": "NSE:HDFCBANK", "last_price": "1,645.25", "change": "+28.90", "perc_change": "+1.79%"},
    {"stock": "NSE:ASIANPAINT", "last_price": "3,245.60", "change": "+92.30", "perc_change": "+2.93%"}
]

HARDCODED_LOSERS = [
    {"stock": "NSE:WIPRO", "last_price": "425.50", "change": "-12.75", "perc_change": "-2.91%"},
    {"stock": "NSE:ONGC", "last_price": "162.40", "change": "-4.80", "perc_change": "-2.87%"},
    {"stock": "NSE:ITC", "last_price": "210.25", "change": "-5.45", "perc_change": "-2.53%"},
    {"stock": "NSE:SBIN", "last_price": "550.60", "change": "-14.20", "perc_change": "-2.51%"},
    {"stock": "NSE:HINDUNILVR", "last_price": "2,345.00", "change": "-58.75", "perc_change": "-2.44%"}
]

def scrape_market_data(url, is_gainers=True):
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        stocks = []
        
        # Find the script containing the data
        script_tag = soup.find('script', text=re.compile(r'window\.initData'))
        if not script_tag:
            print("Data script not found")
            return HARDCODED_GAINERS if is_gainers else HARDCODED_LOSERS
            
        # Extract JSON data from the script
        json_data = re.search(r'window\.initData\s*=\s*({.*?});', script_tag.string, re.DOTALL)
        if not json_data:
            print("JSON data not found in script")
            return HARDCODED_GAINERS if is_gainers else HARDCODED_LOSERS
            
        data = json.loads(json_data.group(1))
        
        # Extract stocks from the feed_meta data
        for item in data.get('feed_meta', {}).get('stream', []):
            stock = {
                'stock': item.get('symbol', 'N/A'),
                'last_price': item.get('price', 'N/A'),
                'change': item.get('change', 'N/A'),
                'perc_change': item.get('perc_change', 'N/A')
            }
            stocks.append(stock)
            
        return stocks[:5] if stocks else (HARDCODED_GAINERS if is_gainers else HARDCODED_LOSERS)
        
    except Exception as e:
        print(f"Scraping error: {str(e)}")
        return HARDCODED_GAINERS if is_gainers else HARDCODED_LOSERS

@app.route('/api/markets', methods=['GET'])
def get_markets():
    try:
        gainers = scrape_market_data('https://www.tradingview.com/markets/stocks-india/market-movers-gainers/', is_gainers=True)
        losers = scrape_market_data('https://www.tradingview.com/markets/stocks-india/market-movers-losers/', is_gainers=False)
        return jsonify({
            'gainers': gainers,
            'losers': losers
        })
    except Exception as e:
        return jsonify({
            'gainers': HARDCODED_GAINERS,
            'losers': HARDCODED_LOSERS
        }), 200

if __name__ == '__main__':
    app.run(port=5020, debug=True)