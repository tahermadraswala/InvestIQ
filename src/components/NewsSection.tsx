import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface NewsItem {
  title: string;
  category: string;
  time: string;
  impact: string;
}

export const NewsSection = () => {
  const [news, setNews] = useState<NewsItem[]>([]);

  // Hardcoded news data
  const hardcodedNews: NewsItem[] = [
    {
      title: "Technical View: NSE Nifty below 23,400 on Trump tariff threat, may test 23,240",
      category: "Markets",
      time: "2 hours ago",
      impact: "high"
    },
    {
      title: "Live: Nifty Drops Nearly 200 Points; Metals Melt On Tariff Scare| Closing Bell",
      category: "Markets",
      time: "3 hours ago",
      impact: "medium"
    },
    {
      title: "Pharma stocks suffer amid caution over Trump's tariff plans; Nifty Pharma index drops 2%",
      category: "Pharma",
      time: "4 hours ago",
      impact: "high"
    },
    {
      title: "Live: Budget & Rate Cut Done – Will Nifty Resume Upmove? Eicher, LIC In Focus | Opening Bell",
      category: "Markets",
      time: "5 hours ago",
      impact: "medium"
    },
    {
      title: "Closing Bell: Nifty below 23,400, Sensex down 548 pts; all sectors in the red",
      category: "Markets",
      time: "6 hours ago",
      impact: "high"
    },
    {
      title: "Technical View: Nifty below 23,600 despite rate cut; resistance at 23,700",
      category: "Markets",
      time: "7 hours ago",
      impact: "medium"
    },
    {
      title: "Live: Nifty Clocks Triple-Digit Cut Despite 25 Bps RBI Rate Cut| Metals Buck The Trend| Closing Bell",
      category: "Markets",
      time: "8 hours ago",
      impact: "high"
    },
    {
      title: "Live: RBI Policy To Chart Direction; Can A Rate Cut Push The Nifty Above 24,000? |Opening Bell",
      category: "Markets",
      time: "9 hours ago",
      impact: "medium"
    }
  ];

  // Extracted fetch function
  const fetchNews = async () => {
    try {
      // Ensure the URL and port match your Flask backend.
      const response = await fetch("http://127.0.0.1:5010/api/news");
      const data = await response.json();
      setNews(data.length > 0 ? data : hardcodedNews); // Use hardcoded data if response is empty
    } catch (error) {
      console.error("Error fetching news:", error);
      setNews(hardcodedNews); // Use hardcoded data in case of an error
    }
  };

  // Initial fetch on component mount.
  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Latest News</h2>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            fetchNews(); // Fetch news on click
          }}
          className="text-sm text-primary hover:underline"
        >
          View All
        </a>
      </div>
      <div className="space-y-3">
        {news.map((item, index) => (
          <Card key={index} className="p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{item.category}</Badge>
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </div>
                <p className="font-medium">{item.title}</p>
              </div>
              <Badge
                variant="outline"
                className={
                  item.impact === "high"
                    ? "border-destructive text-destructive"
                    : "border-primary text-primary"
                }
              >
                {item.impact}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};