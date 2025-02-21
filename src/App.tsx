import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Markets from "./pages/Markets";
import Portfolio from "./pages/Portfolio";
import News from "./pages/News";
import FeatureX from "./pages/StockAnalyzer";
import Asset from "./pages/asset";
import NotFound from "./pages/NotFound";
import FinancialCalculators from "./pages/FinancialCalculators";
import Health from "./pages/health";
import Profile from "./pages/profile"; // Add this import

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/markets" element={<Markets />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/news" element={<News />} />
          <Route path="/feature-x" element={<FeatureX />} />
          <Route path="/asset" element={<Asset />} />
          <Route path="/health" element={<Health />} />
          <Route path="/FinancialCalculators" element={<FinancialCalculators />} />
          <Route path="/profile" element={<Profile />} /> {/* Add this route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;