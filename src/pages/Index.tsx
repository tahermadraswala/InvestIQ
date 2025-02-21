
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MarketOverview } from "@/components/MarketOverview";
import { NewsSection } from "@/components/NewsSection";
import { Testimonials } from "@/components/Testimonials";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart } from "lucide-react";
import { StockAnalyzer } from "@/components/StockAnalyzer";

const Index = () => {
  const [showAnalyzer, setShowAnalyzer] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 space-y-8 animate-fade-in">
        <section className="space-y-6 pt-16">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground">
                Welcome Back
              </h1>
              <p className="text-muted-foreground mt-2">
                Here's your financial overview for today
              </p>
            </div>
            <Button 
              onClick={() => setShowAnalyzer(!showAnalyzer)}
              className="flex items-center gap-2 hover:scale-105 transition-transform"
              size="lg"
            >
              <LineChart className="h-4 w-4" />
              Stock Analyzer
            </Button>
          </div>
          
          {showAnalyzer ? (
            <StockAnalyzer />
          ) : (
            <>
              <MarketOverview />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card className="p-6 hover:shadow-lg transition-all duration-300">
                    <h2 className="text-xl font-semibold mb-4">Portfolio Performance</h2>
                    <div className="h-[300px] flex items-center justify-center bg-muted/50 rounded-lg">
                      Chart Component (Coming Soon)
                    </div>
                  </Card>
                </div>
                <div className="lg:col-span-1">
                  <NewsSection />
                </div>
              </div>
            </>
          )}
        </section>
        
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
