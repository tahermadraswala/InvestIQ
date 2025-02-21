import React, { useState, useEffect } from 'react';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Newspaper, Rss, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from 'axios';

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  date: string;
}

interface MarketAnalysis {
  overview: string;
  trends: string;
  key_factors: string;
  recommendations: string;
  error?: string;
  raw_response?: string;
}

const News = () => {
  const [allNews, setAllNews] = useState<NewsArticle[]>([]);
  const [featuredStory, setFeaturedStory] = useState<NewsArticle | null>(null);
  const [showAllNews, setShowAllNews] = useState(false);
  const [marketAnalysis, setMarketAnalysis] = useState<MarketAnalysis | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/scrape-news', {
          params: { days: 1 }
        });
        const articles = response.data;
        setAllNews(articles);
        if (articles.length > 0) {
          setFeaturedStory(articles[0]);
        }
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    };

    const fetchMarketAnalysis = async () => {
      try {
        const response = await axios.get('http://localhost:5002/api/market-analysis');
        setMarketAnalysis(response.data);
      } catch (error) {
        console.error('Error fetching market analysis:', error);
      }
    };

    fetchNews();
    fetchMarketAnalysis();
  }, []);

  const toggleNewsView = () => {
    setShowAllNews(!showAllNews);
  };

  const displayedNews = showAllNews ? allNews : allNews.slice(0, 5);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 space-y-8 animate-fade-in">
        <section className="space-y-6 pt-16">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground">
                Market News
              </h1>
              <p className="text-muted-foreground mt-2">
                Stay updated with the latest market insights
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Rss className="h-4 w-4 mr-2" />
                Sources
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {featuredStory && (
                <Card className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Newspaper className="h-6 w-6" />
                    <h2 className="text-xl font-semibold">Featured Story</h2>
                  </div>
                  <div className="space-y-4">
                    <Badge>Breaking News</Badge>
                    <h3 className="text-lg font-medium">{featuredStory.title}</h3>
                    <p className="text-muted-foreground">{featuredStory.description}</p>
                    <div className="flex justify-start items-center text-sm text-muted-foreground">
                      <span>{featuredStory.source}</span>
                    </div>
                    <a 
                      href={featuredStory.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Read Full Article
                    </a>
                  </div>
                </Card>
              )}

              <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Latest News</h2>
                  <Button variant="outline" size="sm" onClick={toggleNewsView}>
                    {showAllNews ? 'Show Less' : 'View All'}
                  </Button>
                </div>
                <div className="space-y-4">
                  {displayedNews.map((article, index) => (
                    <div key={index} className="border-b pb-4 last:border-b-0">
                      <h3 className="font-medium">{article.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {article.description}
                      </p>
                      <div className="flex justify-start items-center text-xs text-muted-foreground mt-2">
                        <span>{article.source}</span>
                      </div>
                      <a 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                      >
                        Read Article
                      </a>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Updated Market Analysis Card */}
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Market Analysis</h2>
                {marketAnalysis ? (
                  marketAnalysis.error ? (
                    <div className="text-red-500">
                      Error: {marketAnalysis.error}
                      <br />
                      Raw response: {marketAnalysis.raw_response}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium">Overview</h3>
                        <p className="text-sm text-muted-foreground">{marketAnalysis.overview}</p>
                      </div>
                      <div>
                        <h3 className="font-medium">Trends</h3>
                        <p className="text-sm text-muted-foreground">{marketAnalysis.trends}</p>
                      </div>
                      <div>
                        <h3 className="font-medium">Key Factors</h3>
                        <p className="text-sm text-muted-foreground">{marketAnalysis.key_factors}</p>
                      </div>
                      <div>
                        <h3 className="font-medium">Recommendations</h3>
                        <p className="text-sm text-muted-foreground">{marketAnalysis.recommendations}</p>
                      </div>
                    </div>
                  )
                ) : (
                  <div>Loading market analysis...</div>
                )}
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Market Sentiment</h2>
                <div className="h-[200px] flex items-center justify-center bg-muted/50 rounded-lg">
                  Sentiment Chart (Coming Soon)
                </div>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default News;
