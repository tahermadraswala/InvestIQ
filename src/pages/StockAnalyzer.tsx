
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StockAnalyzer } from "@/components/StockAnalyzer";

const FeatureX = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 space-y-8 animate-fade-in">
        <section className="space-y-6 pt-16">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Stock Analyzer
            </h1>
            <p className="text-muted-foreground mt-2">
              Analyze stocks with AI-powered insights
            </p>
          </div>
          
          <StockAnalyzer />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FeatureX;
