import os
import requests
from bs4 import BeautifulSoup
import pandas as pd
from datetime import datetime, timedelta
import time
import random
import sys
import json

class FinanceNewsScraper:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        self.base_url = "https://www.moneycontrol.com/news/business/stocks/"
        self.source = "Money Control"
        
    def get_soup(self, url):
        """Make HTTP request and return BeautifulSoup object"""
        try:
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            print(f"Fetching page: {url}", file=sys.stderr)
            return BeautifulSoup(response.text, 'html.parser')
        except requests.RequestException as e:
            print(f"Error fetching URL {url}: {e}", file=sys.stderr)
            return None

    def parse_date(self, date_str):
        """Parse date string to datetime object"""
        try:
            if not date_str:
                return None
                
            date_str = date_str.lower().strip()
            today = datetime.now()
            
            if 'mins ago' in date_str or 'min ago' in date_str:
                mins = int(''.join(filter(str.isdigit, date_str)))
                return today - timedelta(minutes=mins)
            elif 'hours ago' in date_str or 'hour ago' in date_str:
                hours = int(''.join(filter(str.isdigit, date_str)))
                return today - timedelta(hours=hours)
            elif 'days ago' in date_str or 'day ago' in date_str:
                days = int(''.join(filter(str.isdigit, date_str)))
                return today - timedelta(days=days)
            else:
                try:
                    # Try different date formats
                    for fmt in ['%B %d, %Y %I:%M %p', '%b %d, %Y %I:%M %p', '%d %B %Y']:
                        try:
                            return datetime.strptime(date_str, fmt)
                        except ValueError:
                            continue
                    return None
                except Exception:
                    print(f"Could not parse date: {date_str}", file=sys.stderr)
                    return None
        except Exception as e:
            print(f"Error parsing date {date_str}: {e}", file=sys.stderr)
            return None

    def extract_article_data(self, article):
        """Extract relevant data from article HTML"""
        try:
            # Try different possible HTML structures
            title_tag = (article.find('h2') or 
                        article.find('h1') or 
                        article.find('a', class_='headline'))
                        
            if not title_tag:
                return None
            
            # Get title text
            title = title_tag.get_text().strip()
            
            # Get link
            link_tag = title_tag.find('a') if title_tag.name != 'a' else title_tag
            link = link_tag.get('href') if link_tag else None
            
            # Try different date/time selectors
            timestamp = (article.find('span', class_='article_schedule') or
                       article.find('span', class_='date') or
                       article.find('time'))
            
            date_str = timestamp.text.strip() if timestamp else None
            date = self.parse_date(date_str) if date_str else None
            
            # Debug print
            print(f"Found article: {title[:50]}... | Date: {date_str}", file=sys.stderr)
            
            return {
                'title': title,
                'link': link,
                'date': date,
                'source': self.source
            }
        except Exception as e:
            print(f"Error extracting article data: {e}", file=sys.stderr)
            return None

    def search_by_keyword(self, keyword, num_days=7, num_pages=5):
        """Search articles by keyword and scrape multiple pages within date range"""
        all_articles = []
        cutoff_date = datetime.now() - timedelta(days=num_days)
        
        for page in range(1, num_pages + 1):
            url = f"{self.base_url}/page-{page}"
            soup = self.get_soup(url)
            
            if not soup:
                continue
            
            # Try different article container selectors
            articles = (
                soup.find_all('li', class_='clearfix') or
                soup.find_all('div', class_='article-list') or
                soup.find_all('div', class_='article_box') or
                soup.find_all('div', class_='news_listing')
            )
            
            print(f"Found {len(articles)} articles on page {page}", file=sys.stderr)
            
            for article in articles:
                data = self.extract_article_data(article)
                
                if data and keyword.lower() in data['title'].lower():
                    # Include articles without dates or with dates in range
                    if not data['date'] or data['date'] >= cutoff_date:
                        all_articles.append(data)
            
            # Polite delay between requests
            time.sleep(random.uniform(2, 4))
            
        df = pd.DataFrame(all_articles)
        if not df.empty:
            # Sort by date, handling None values
            df = df.sort_values('date', ascending=False, na_position='last')
        
        return df

    def get_historical_data(self, symbol):
        """Fetch historical stock data from Alpha Vantage"""
        try:
            url = f"https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol={symbol}&apikey={os.getenv('ALPHA_VANTAGE_KEY')}"
            response = requests.get(url)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error fetching historical data: {e}", file=sys.stderr)
            return None

    def calculate_mva(self, data, window):
        """Calculate moving average for given window"""
        try:
            time_series = data.get('Time Series (Daily)', {})
            closes = [float(v['4. close']) for v in time_series.values()]
            return sum(closes[-window:]) / window
        except Exception as e:
            print(f"Error calculating MVA: {e}", file=sys.stderr)
            return None

def main():
    if len(sys.argv) < 2:
        print("Usage: python scraper.py <stock_symbol>", file=sys.stderr)
        sys.exit(1)
        
    symbol = sys.argv[1]
    scraper = FinanceNewsScraper()
    
    # Get news data
    news_data = scraper.search_by_keyword(symbol)
    
    # Get historical data
    historical_data = scraper.get_historical_data(symbol)
    
    # Calculate moving averages
    mva_data = {
        'mva10': scraper.calculate_mva(historical_data, 10),
        'mva20': scraper.calculate_mva(historical_data, 20),
        'mva50': scraper.calculate_mva(historical_data, 50),
        'mva200': scraper.calculate_mva(historical_data, 200)
    }
    
    # Prepare output
    output = {
        'news': news_data.to_dict('records'),
        'mva': mva_data,
        'historical': historical_data
    }
    
    # Print as JSON for Node.js to consume
    print(json.dumps(output))

if __name__ == "__main__":
    main()