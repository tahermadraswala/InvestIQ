import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PieChart, LineChart, BarChart, Bar, Pie, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import { DollarSign, Percent, TrendingUp } from 'lucide-react';

const AssetManagementDashboard = () => {
  const [userAmount, setUserAmount] = useState('');
  const [allocation, setAllocation] = useState([]);
  const [riskLevel, setRiskLevel] = useState('moderate');

  const calculateAllocation = () => {
    const amount = parseFloat(userAmount);
    let allocationData;

    switch(riskLevel) {
      case 'conservative':
        allocationData = [
          { name: 'Fixed Deposits', percentage: 30, amount: amount * 0.30 },
          { name: 'Government Bonds', percentage: 25, amount: amount * 0.25 },
          { name: 'Gold', percentage: 20, amount: amount * 0.20 },
          { name: 'Mutual Funds', percentage: 15, amount: amount * 0.15 },
          { name: 'SIP', percentage: 10, amount: amount * 0.10 }
        ];
        break;
      case 'moderate':
        allocationData = [
          { name: 'Mutual Funds', percentage: 35, amount: amount * 0.35 },
          { name: 'Stocks', percentage: 25, amount: amount * 0.25 },
          { name: 'Gold', percentage: 15, amount: amount * 0.15 },
          { name: 'SIP', percentage: 15, amount: amount * 0.15 },
          { name: 'Bonds', percentage: 10, amount: amount * 0.10 }
        ];
        break;
      case 'aggressive':
        allocationData = [
          { name: 'Stocks', percentage: 45, amount: amount * 0.45 },
          { name: 'Mutual Funds', percentage: 25, amount: amount * 0.25 },
          { name: 'ETFs', percentage: 15, amount: amount * 0.15 },
          { name: 'SIP', percentage: 10, amount: amount * 0.10 },
          { name: 'Gold', percentage: 5, amount: amount * 0.05 }
        ];
        break;
      default:
        allocationData = [];
    }
    setAllocation(allocationData);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="p-6 space-y-6 bg-gray-50">
      <Card>
        <CardHeader>
          <CardTitle>Investment Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Investment Amount (₹)</label>
              <input
                type="number"
                value={userAmount}
                onChange={(e) => setUserAmount(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                placeholder="Enter your investment amount"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Risk Level</label>
              <select
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
              >
                <option value="conservative">Conservative</option>
                <option value="moderate">Moderate</option>
                <option value="aggressive">Aggressive</option>
              </select>
            </div>
            <button
              onClick={calculateAllocation}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
            >
              Calculate Allocation
            </button>
          </div>
        </CardContent>
      </Card>

      {allocation.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recommended Portfolio</CardTitle>
            </CardHeader>
            <CardContent>
              <PieChart width={400} height={300}>
                <Pie
                  data={allocation}
                  cx={200}
                  cy={150}
                  innerRadius={60}
                  outerRadius={80}
                  dataKey="percentage"
                  label
                >
                  {allocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Investment Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allocation.map((item, index) => (
                  <div key={index} className="flex justify-between items-center border-b pb-2">
                    <span className="font-medium">{item.name}</span>
                    <div className="text-right">
                      <div className="font-bold">₹{item.amount.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">{item.percentage}%</div>
                    </div>
                  </div>
                ))}
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Total Investment</span>
                    <span className="font-bold">₹{parseFloat(userAmount).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AssetManagementDashboard;
