from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from datetime import datetime
from finance_news_scraper import FinanceNewsScraper

app = Flask(__name__)
CORS(app)

# Hardcoded backup news data
HARDCODED_NEWS = [
    {"title": "Technical View: NSE Nifty below 23,400 on Trump tariff threat, may test 23,240",
     "url": "https://www.moneycontrol.com/news/business/markets/technical-view-nse-nifty-below-23-400-on-trump-tariff-threat-may-test-23-240-12935782.html",
     "date": "2025-02-10T08:00:00"},
    {"title": "Live: Nifty Drops Nearly 200 Points; Metals Melt On Tariff Scare| Closing Bell",
     "url": "https://www.moneycontrol.com/news/videos/business/markets/live-nifty-drops-nearly-200-points-metals-melt-on-tariff-scare-closing-bell-12935857.html",
     "date": "2025-02-10T07:45:00"},
    {"title": "Pharma stocks suffer amid caution over Trump's tariff plans; Nifty Pharma index drops 2%",
     "url": "https://www.moneycontrol.com/news/business/markets/pharma-stocks-suffer-amid-caution-over-trumps-tariff-plans-nifty-pharma-falls-2-percent12935429-12935429.html",
     "date": "2025-02-10T07:30:00"},
    {"title": "Live: Budget & Rate Cut Done – Will Nifty Resume Upmove? Eicher, LIC In Focus | Opening Bell",
     "url": "https://www.moneycontrol.com/news/videos/business/markets/live-budget-rate-cut-done-will-nifty-resume-upmove-eicher-lic-in-focus-opening-bell-12935190.html",
     "date": "2025-02-10T07:15:00"},
    {"title": "Closing Bell: Nifty below 23,400, Sensex down 548 pts; all sectors in the red",
     "url": "https://www.moneycontrol.com/news/business/markets/stock-market-live-sensex-nifty-50-share-price-gift-nifty-latest-updates-10-02-2025-liveblog-12935153.html",
     "date": "2025-02-10T07:00:00"},
]

@app.route('/api/scrape-news', methods=['GET'])
def scrape_news():
    days = int(request.args.get('days', 1))
    limit = int(request.args.get('limit', 0))
    keyword = request.args.get('keyword', '')

    try:
        scraper = FinanceNewsScraper()

        if keyword:
            df = scraper.search_by_keyword(keyword, days)
        else:
            keywords = ['market', 'stocks', 'finance']
            dfs = []
            for kw in keywords:
                kw_df = scraper.search_by_keyword(kw, days)
                dfs.append(kw_df)
            df = pd.concat(dfs).drop_duplicates(subset=['title'])

        df = df.sort_values('date', ascending=False, na_position='last')
        if limit > 0:
            df = df.head(limit)

        articles = df.to_dict('records')
        for article in articles:
            if article['date']:
                article['date'] = article['date'].isoformat()

        return jsonify(articles)

    except Exception as e:
        print(f"Error occurred: {e}")
        return jsonify(HARDCODED_NEWS[:limit] if limit > 0 else HARDCODED_NEWS), 200

if __name__ == '__main__':
    app.run(debug=True, port=5001)
