import requests
from bs4 import BeautifulSoup
import pandas as pd
from datetime import datetime, timedelta
import time
import random

class FinanceNewsScraper:
    def __init__(self):
        self.headers = {
            'User-Agent': ('Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                           'AppleWebKit/537.36 (KHTML, like Gecko) '
                           'Chrome/91.0.4472.124 Safari/537.36')
        }
        # Removed trailing slash to avoid double slashes in URLs
        self.base_url = "https://www.moneycontrol.com/news/business/stocks"
        self.source = "Money Control"

    def get_soup(self, url):
        """Make HTTP request and return BeautifulSoup object."""
        try:
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            print(f"Fetching page: {url}")  # Debug print
            return BeautifulSoup(response.text, 'html.parser')
        except requests.RequestException as e:
            print(f"Error fetching URL {url}: {e}")
            return None

    def parse_date(self, date_str):
        """Parse a date string into a datetime object."""
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
                # Try several common formats
                for fmt in ['%B %d, %Y %I:%M %p', '%b %d, %Y %I:%M %p', '%d %B %Y']:
                    try:
                        return datetime.strptime(date_str, fmt)
                    except ValueError:
                        continue
                return None
        except Exception as e:
            print(f"Error parsing date {date_str}: {e}")
            return None

    def extract_article_data(self, article):
        """Extract title, url, date, source, and a description (if available) from an article element."""
        try:
            # Try different possible selectors for the title element
            title_tag = (article.find('h2') or 
                         article.find('h1') or 
                         article.find('a', class_='headline'))
            if not title_tag:
                return None

            title = title_tag.get_text().strip()
            # If the title tag is not a link, try to find an <a> tag inside it
            link_tag = title_tag.find('a') if title_tag.name != 'a' else title_tag
            link = link_tag.get('href') if link_tag else None

            # Try different selectors for the date element
            timestamp = (article.find('span', class_='article_schedule') or
                         article.find('span', class_='date') or
                         article.find('time'))
            date_str = timestamp.text.strip() if timestamp else None
            date = self.parse_date(date_str) if date_str else None

            # Optionally, try to extract a description. For Money Control you might not have a clear description,
            # so we leave it as an empty string.
            description = ""
            
            print(f"Found article: {title[:50]}... | Date: {date_str}")
            
            return {
                'title': title,
                'url': link,
                'date': date,
                'source': self.source,
                'description': description
            }
        except Exception as e:
            print(f"Error extracting article data: {e}")
            return None

    def search_by_keyword(self, keyword, num_days, num_pages=5):
        """Scrape articles across multiple pages that match a given keyword and date range."""
        all_articles = []
        cutoff_date = datetime.now() - timedelta(days=num_days)

        for page in range(1, num_pages + 1):
            url = f"{self.base_url}/page-{page}"
            soup = self.get_soup(url)
            if not soup:
                continue

            # Try different article container selectors
            articles = (soup.find_all('li', class_='clearfix') or
                        soup.find_all('div', class_='article-list') or
                        soup.find_all('div', class_='article_box') or
                        soup.find_all('div', class_='news_listing'))
            print(f"Found {len(articles)} articles on page {page}")

            for article in articles:
                data = self.extract_article_data(article)
                if data and keyword.lower() in data['title'].lower():
                    # Include articles with no date or within the desired date range
                    if not data['date'] or data['date'] >= cutoff_date:
                        all_articles.append(data)

            # Be polite with the website by waiting a bit between requests
            time.sleep(random.uniform(2, 4))

        df = pd.DataFrame(all_articles)
        if not df.empty:
            df = df.sort_values('date', ascending=False, na_position='last')
        return df
