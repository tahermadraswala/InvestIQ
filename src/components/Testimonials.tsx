
import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export const Testimonials = () => {
  return (
    <div className="py-12 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-2">What Our Users Say</h2>
          <p className="text-muted-foreground">Trusted by thousands of investors worldwide</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              name: "Rohit Sharma",
              role: "Professional Trader",
              content: "FinHub has transformed how I analyze market trends. The AI predictions are incredibly accurate!",
            },
            {
              name: "Virat Kohli",
              role: "Retail Investor",
              content: "The platform's user-friendly interface and comprehensive tools make investing accessible to everyone.",
            },
            {
              name: "M.S Dhoni",
              role: "Financial Advisor",
              content: "I recommend FinHub to all my clients. The technical analysis tools are unmatched in the industry.",
            }
          ].map((testimonial, index) => (
            <Card key={index} className="p-6 cursor-move hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground mb-4">{testimonial.role}</p>
                  <p className="text-sm">{testimonial.content}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
