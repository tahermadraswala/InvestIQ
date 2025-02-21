import { MarketOverview } from "@/components/MarketOverview";
import { NewsSection } from "@/components/NewsSection";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Testimonials } from "@/components/Testimonials";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import NiftyLiveChart from "@/components/NiftyLiveChart";
import { LineChart, BarChart2, MessageSquare, X, Send, Loader2 } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';

interface Message {
  id: number;
  text: string;
  isBot: boolean;
}

// Chat Widget Component
const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello! I'm MarketSense Assistant. How can I help you with your investment queries today?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessageToBackend = async (message: string) => {
    try {
      const response = await fetch('http://localhost:5011/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error:', error);
      return 'Sorry, I encountered an error. Please try again.';
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setIsLoading(true);

    // Add user message
    setMessages(prev => [...prev, { 
      id: Date.now(), 
      text: userMessage, 
      isBot: false 
    }]);

    try {
      // Get response from backend
      const botResponse = await sendMessageToBackend(userMessage);
      
      // Add bot response
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: botResponse,
        isBot: true
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error. Please try again.',
        isBot: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}

      {isOpen && (
        <Card className="w-96 h-[600px] flex flex-col shadow-xl">
          <div className="p-4 border-b flex justify-between items-center bg-primary text-primary-foreground">
            <h3 className="font-semibold">FinHub Assistant</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 text-primary-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.isBot
                      ? 'bg-muted text-muted-foreground'
                      : 'bg-primary text-primary-foreground'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="p-4 border-t flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about markets, stocks, or analysis..."
              className="flex-1 rounded-md border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
            <div className="flex space-x-2">
              <Button 
                variant={location.pathname === '/' ? 'default' : 'outline'}
                onClick={() => navigate('/')}
              >
                <LineChart className="mr-2 h-4 w-4" /> Overview
              </Button>
              <Button 
                variant={location.pathname === '/health' ? 'default' : 'outline'}
                onClick={() => navigate('/health')}
              >
                <BarChart2 className="mr-2 h-4 w-4" /> Financial Health Management
              </Button>
            </div>
          </div>
          
          <MarketOverview />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <NiftyLiveChart />
            </div>
            <div className="lg:col-span-1">
              <NewsSection />
            </div>
          </div>
        </section>
        
        <Testimonials />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
};

export default Dashboard;