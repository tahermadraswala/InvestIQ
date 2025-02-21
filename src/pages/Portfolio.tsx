
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, BarChart2, DollarSign, Percent } from "lucide-react";

const Portfolio = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 space-y-8 animate-fade-in">
        <section className="space-y-6 pt-16">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground">
                Your Portfolio
              </h1>
              <p className="text-muted-foreground mt-2">
                Track your investments and performance
              </p>
            </div>
            <Button className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Add Investment
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: "Total Value", value: "$125,459.32", change: "+2.5%", icon: DollarSign },
              { title: "Today's Return", value: "$1,459.32", change: "+1.2%", icon: BarChart2 },
              { title: "Total Return", value: "$25,459.32", change: "+15.7%", icon: Percent },
            ].map((stat) => (
              <Card key={stat.title} className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-semibold mt-1">{stat.value}</p>
                    <p className="text-sm text-success">{stat.change}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 p-6">
              <h2 className="text-xl font-semibold mb-4">Portfolio Performance</h2>
              <div className="h-[400px] flex items-center justify-center bg-muted/50 rounded-lg">
                Chart Component (Coming Soon)
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Asset Allocation</h2>
              <div className="h-[400px] flex items-center justify-center bg-muted/50 rounded-lg">
                <PieChart className="h-12 w-12 text-muted-foreground" />
              </div>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Portfolio;
