from flask import Flask, jsonify
from flask_cors import CORS  # <-- Add this
import openai
import yfinance as yf
import json

app = Flask(__name__)
CORS(app)

# Set your OpenAI API Key
OPENAI_API_KEY = "api"
openai.api_key = OPENAI_API_KEY
client = openai  # Using openai as the client per the new interface

def get_stock_data(symbols):
    stock_data = {}
    for symbol in symbols:
        stock = yf.Ticker(symbol)
        data = stock.history(period="1d")
        if not data.empty:
            stock_data[symbol] = {
                "Open": data["Open"].iloc[-1],
                "High": data["High"].iloc[-1],
                "Low": data["Low"].iloc[-1],
                "Close": data["Close"].iloc[-1],
                "Volume": data["Volume"].iloc[-1]
            }
    return stock_data

def analyze_stock_market():
    # Using Nifty 50 and Sensex indices as examples.
    stocks = ["^NSEI", "^BSESN"]
    stock_data = get_stock_data(stocks)

    prompt = f"""
Analyze the Indian stock market based on today's data.
Return a structured analysis in valid JSON format with the following keys:
  - "overview": A brief overall summary.
  - "trends": Key market trends observed.
  - "key_factors": The main factors driving the market.
  - "recommendations": Actionable recommendations for investors.

Today's Data: {stock_data}

Please ensure that the output is valid JSON.
    """

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a professional market analyst."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        # Access the message content using dot notation
        analysis_text = response.choices[0].message.content.strip()
        
        try:
            analysis_data = json.loads(analysis_text)
        except json.JSONDecodeError:
            analysis_data = {
                "error": "Failed to parse structured analysis",
                "raw_response": analysis_text
            }
    except Exception as e:
        analysis_data = {
            "error": "OpenAI API request failed",
            "details": str(e)
        }
    
    return analysis_data

@app.route('/api/market-analysis')
def market_analysis():
    analysis = analyze_stock_market()
    return jsonify(analysis)

if __name__ == '__main__':
    app.run(port=5002)

