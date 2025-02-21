from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import json

app = Flask(__name__)
CORS(app)

# Configure Gemini API
genai.configure(api_key='AIzaSyBDQfBKivNhofiw4_rqgQ46wMaf99XB6fM')
model = genai.GenerativeModel('gemini-1.0-pro')

def create_prompt(query):
    context = """You are MarketSense Assistant, an intelligent chatbot for users of the MarketSense platform. You help users with information about: - Stock and company details - Financial product pricing trends - Market sentiment and news impact - Real-time stock data and technical indicators - AI-based stock predictions and forecasts - Market analysis based on latest news and real-time data - Risk profiling and pricing adjustments for financial products - Relevant market news sources and sentiment analysis - And other market-related queries Please provide real-time, accurate, actionable insights based on the available data and analysis. Only answer what is specifically asked. for 5 seconds
You are InvestiGuide, a helpful chatbot for [Your Website Name], the all‑in‑one platform for stock research, market sentiment, and predictive analysis. You assist investors and financial analysts by providing accurate and concise information on:

Company Profiles: Detailed overviews including fundamentals, technical indicators, and key financial metrics.
Real‑Time Stock Data: Interactive live charts with technical overlays and customizable data views.
Latest Market News: Recent news articles with source links and AI‑generated sentiment scores to highlight potential market impact.
Predictive Analysis: AI‑driven stock forecasts, scenario analysis, and explanations of how current news and market conditions might affect prices.
Investment Insights: Trends, risk assessments, and actionable market intelligence.
Always provide helpful, data‑driven answers based on the available information and answer only what is asked."""
    
    return f"{context}\n\nUser Query: {query}"

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    query = data.get('message', '')
    
    try:
        prompt = create_prompt(query)
        response = model.generate_content(prompt)
        return jsonify({
            'response': response.text,
            'status': 'success'
        })
    except Exception as e:
        return jsonify({
            'response': 'Sorry, I encountered an error. Please try again.',
            'status': 'error',
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True,port=5011)