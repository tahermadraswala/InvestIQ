import React from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const FinancialDashboard = () => {
  // Sample data for the chart
  const chartData = [
    { name: 'Jan', value: 30000 },
    { name: 'Feb', value: 32000 },
    { name: 'Mar', value: 35000 },
    { name: 'Apr', value: 37000 },
    { name: 'May', value: 40000 },
    { name: 'Jun', value: 42000 },
  ];

  const StatCard = ({ title, value }) => (
    <div className="bg-white p-8 rounded-2xl shadow-md text-center">
      <h3 className="text-gray-500 text-sm uppercase tracking-wider mb-2">{title}</h3>
      <div className="text-4xl font-bold text-blue-600">{value}</div>
    </div>
  );

  const FeatureCard = ({ title, description, children }) => (
    <div className="bg-white p-8 rounded-2xl shadow-md transition-transform duration-300 hover:-translate-y-1">
      <h3 className="text-2xl font-semibold mb-4">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      {children}
    </div>
  );

  const TestimonialCard = ({ quote, author }) => (
    <div className="bg-white p-8 rounded-2xl shadow-md">
      <p className="mb-4">{quote}</p>
      <p className="text-gray-500">{author}</p>
    </div>
  );

  return (
    <div className="bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 text-white py-24 text-center">
        <div className="container mx-auto px-8 max-w-7xl">
          <h1 className="text-5xl font-bold mb-6">Transform Your Financial Future</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Join journey of finances with our smart tools and personalized guidance.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-slate-50 transform -skew-y-3 translate-y-12" />
      </section>

      {/* Stats Grid */}
      <div className="container mx-auto px-8 max-w-7xl -mt-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCard title="Active Users" value="Developing" />
          <StatCard title="Money Managed" value="$Developing" />
          <StatCard title="Avg. Savings Increase" value="Developing" />
          <StatCard title="Success Rate" value="Developing" />
        </div>
      </div>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-8 max-w-7xl">
          <h2 className="text-4xl font-bold text-center mb-4">Smart Financial Tools</h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
            Everything you need to manage, grow, and protect your wealth in one place.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              title="360° Financial View"
              description="Connect all your accounts for a complete picture of your finances. Track spending, investments, and net worth in real-time."
            >
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </FeatureCard>

            <FeatureCard
              title="AI-Powered Insights"
              description="Get personalized recommendations based on your spending patterns and financial goals. Our AI analyzes thousands of data points to help you make better decisions."
            >
              <div className="space-y-2 mt-4">
                {['Reduced unnecessary subscriptions', 'Optimized investment allocation', 'Personalized saving strategies'].map((text, index) => (
                  <div key={index} className="bg-gray-100 p-4 rounded-lg">
                    <p className="text-green-600">✓ {text}</p>
                  </div>
                ))}
              </div>
            </FeatureCard>

            <FeatureCard
              title="Smart Budgeting"
              description="Create and manage budgets that adapt to your lifestyle. Set goals, track progress, and get alerts when you're off track."
            >
              <div className="space-y-4 mt-4">
                {[
                  { width: '75%', color: 'bg-green-600' },
                  { width: '45%', color: 'bg-amber-600' },
                  { width: '90%', color: 'bg-blue-600' },
                ].map((bar, index) => (
<div key={index} className="h-5 bg-gray-200 rounded-full">
  <div className={`h-full ${bar.color} rounded-full`} style={{ width: bar.width }} />
</div>
                ))}
              </div>
            </FeatureCard>
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-8 max-w-7xl">
          <h2 className="text-4xl font-bold text-center mb-4">Financial Health Calculator</h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-8">
            Get a quick assessment of your financial health and personalized recommendations.
          </p>

          <div className="max-w-lg mx-auto bg-white p-8 rounded-2xl shadow-md">
            <div className="space-y-6">
              <div>
                <label className="block text-gray-600 mb-2" htmlFor="income">Monthly Income</label>
                <input
                  type="number"
                  id="income"
                  className="w-full p-3 border border-gray-200 rounded-lg"
                  placeholder="Enter your monthly income"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-2" htmlFor="expenses">Monthly Expenses</label>
                <input
                  type="number"
                  id="expenses"
                  className="w-full p-3 border border-gray-200 rounded-lg"
                  placeholder="Enter your monthly expenses"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-2" htmlFor="savings">Current Savings</label>
                <input
                  type="number"
                  id="savings"
                  className="w-full p-3 border border-gray-200 rounded-lg"
                  placeholder="Enter your current savings"
                />
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-8 rounded-lg transition-colors">
                Calculate My Score
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gradient-to-r from-slate-100 to-slate-200 py-16">
        <div className="container mx-auto px-8 max-w-7xl">
          <h2 className="text-4xl font-bold text-center mb-4">Success Stories</h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
            Join thousands of people who have transformed their financial lives.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard
              quote="I've increased my savings by 40% in just 6 months using the smart budgeting tools. The AI insights helped me identify areas where I was overspending."
              author="- Sarah J."
            />
            <TestimonialCard
              quote="The investment recommendations helped me optimize my portfolio. I'm now on track to retire 5 years earlier than planned."
              author="- Michael R."
            />
            <TestimonialCard
              quote="The debt management strategies helped me become debt-free in 18 months. The progress tracking kept me motivated throughout the journey."
              author="- Emily T."
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default FinancialDashboard;
