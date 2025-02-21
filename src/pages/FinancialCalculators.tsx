import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Info, TrendingUp, Wallet } from 'lucide-react';

const FinancialCalculators = () => {
  const [sipMonthlyInvestment, setSipMonthlyInvestment] = useState(25000);
  const [sipReturnRate, setSipReturnRate] = useState(12);
  const [sipTimePeriod, setSipTimePeriod] = useState(10);
  const [loanAmount, setLoanAmount] = useState(10000000);
  const [loanTenure, setLoanTenure] = useState(20);
  const [loanInterestRate, setLoanInterestRate] = useState(6.16);
  const [selectedLoanDetails, setSelectedLoanDetails] = useState(null);

  const calculateSIP = () => {
    const monthlyRate = sipReturnRate / 12 / 100;
    const totalMonths = sipTimePeriod * 12;
    const investedAmount = sipMonthlyInvestment * totalMonths;
    const estimatedReturns = 
      sipMonthlyInvestment * 
      (((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate));
    const totalValue = estimatedReturns;

    return {
      investedAmount: Math.round(investedAmount),
      estimatedReturns: Math.round(totalValue - investedAmount),
      totalValue: Math.round(totalValue)
    };
  };

  const calculateLoanEMI = () => {
    const monthlyInterestRate = loanInterestRate / 12 / 100;
    const totalMonths = loanTenure * 12;
    const emi = 
      loanAmount * 
      monthlyInterestRate * 
      Math.pow(1 + monthlyInterestRate, totalMonths) / 
      (Math.pow(1 + monthlyInterestRate, totalMonths) - 1);
    const totalPayment = emi * totalMonths;
    const totalInterest = totalPayment - loanAmount;

    return {
      monthlyEMI: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalPayment: Math.round(totalPayment)
    };
  };

  const generateAmortizationSchedule = () => {
    const monthlyInterestRate = loanInterestRate / 12 / 100;
    const totalMonths = loanTenure * 12;
    const emi = calculateLoanEMI().monthlyEMI;
    
    let schedule = [];
    let remainingBalance = loanAmount;
    let totalInterestPaid = 0;
    let totalPrincipalPaid = 0;

    for (let month = 1; month <= totalMonths; month++) {
      const interestPayment = remainingBalance * monthlyInterestRate;
      const principalPayment = emi - interestPayment;
      remainingBalance -= principalPayment;
      totalInterestPaid += interestPayment;
      totalPrincipalPaid += principalPayment;

      if (month <= 12 || month === totalMonths || month % 12 === 0) {
        schedule.push({
          month,
          emi: Math.round(emi),
          principal: Math.round(principalPayment),
          interest: Math.round(interestPayment),
          balance: Math.max(0, Math.round(remainingBalance)),
          totalInterestPaid: Math.round(totalInterestPaid),
          totalPrincipalPaid: Math.round(totalPrincipalPaid)
        });
      }
    }

    return schedule;
  };

  const sipResults = calculateSIP();
  const loanResults = calculateLoanEMI();

  const sipChartData = [
    { name: "Invested Amount", value: sipResults.investedAmount },
    { name: "Est. Returns", value: sipResults.estimatedReturns }
  ];

  const loanChartData = [
    { name: "Principal", value: loanAmount },
    { name: "Interest", value: loanResults.totalInterest }
  ];

  const COLORS = ['#818CF8', '#4F46E5'];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Card className="bg-white p-2 shadow-lg border-none">
          <p className="text-sm font-medium">{payload[0].name}</p>
          <p className="text-lg font-semibold">₹{payload[0].value.toLocaleString()}</p>
        </Card>
      );
    }
    return null;
  };

  const LoanDetailsDialog = ({ selectedDetails }) => (
    <Dialog open={!!selectedDetails} onOpenChange={() => setSelectedLoanDetails(null)}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl mb-2 flex items-center gap-2">
            <Info className="w-6 h-6 text-blue-600" />
            Detailed Loan Breakdown
          </DialogTitle>
          <DialogDescription>
            Comprehensive insights into your loan's financial structure
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="bg-blue-50/50">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4 text-blue-600" />
                <p className="text-sm text-gray-600">Total Loan Amount</p>
              </div>
              <p className="text-xl font-semibold">₹{loanAmount.toLocaleString()}</p>
            </div>
          </Card>
          <Card className="bg-green-50/50">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <p className="text-sm text-gray-600">Monthly EMI</p>
              </div>
              <p className="text-xl font-semibold">₹{loanResults.monthlyEMI.toLocaleString()}</p>
            </div>
          </Card>
        </div>
        
        <div className="w-full overflow-x-auto border rounded-lg">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Month', 'EMI', 'Principal', 'Interest', 'Balance', 'Total Interest'].map(header => (
                  <th 
                    key={header} 
                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {generateAmortizationSchedule().slice(0, 12).map((row) => (
                <tr key={row.month} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{row.month}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right">₹{row.emi.toLocaleString()}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right">₹{row.principal.toLocaleString()}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right">₹{row.interest.toLocaleString()}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right">₹{row.balance.toLocaleString()}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right">₹{row.totalInterestPaid.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <Tabs defaultValue="loan" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="sip" className="text-lg">SIP Calculator</TabsTrigger>
          <TabsTrigger value="loan" className="text-lg">Home Loan EMI Calculator</TabsTrigger>
        </TabsList>
        
        {/* SIP Calculator Tab */}
        <TabsContent value="sip">
          <Card className="p-8 border-none shadow-xl bg-white/80 backdrop-blur">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <h2 className="text-2xl font-semibold text-gray-800">Investment Details</h2>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600 font-medium">Monthly investment</span>
                    <span className="bg-indigo-50 text-indigo-600 px-4 py-1 rounded-full font-medium">₹ {sipMonthlyInvestment.toLocaleString()}</span>
                  </div>
                  <Slider 
                    value={[sipMonthlyInvestment]} 
                    min={1000} 
                    max={100000}
                    step={1000}
                    onValueChange={([value]) => setSipMonthlyInvestment(value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600 font-medium">Expected return rate (p.a)</span>
                    <span className="bg-indigo-50 text-indigo-600 px-4 py-1 rounded-full font-medium">{sipReturnRate}%</span>
                  </div>
                  <Slider 
                    value={[sipReturnRate]} 
                    min={1} 
                    max={30}
                    step={0.1}
                    onValueChange={([value]) => setSipReturnRate(value)}
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600 font-medium">Time period</span>
                    <span className="bg-indigo-50 text-indigo-600 px-4 py-1 rounded-full font-medium">{sipTimePeriod} Yr</span>
                  </div>
                  <Slider 
                    value={[sipTimePeriod]} 
                    min={1} 
                    max={30}
                    onValueChange={([value]) => setSipTimePeriod(value)}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800">Investment Growth</h2>
                <div className="h-64 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sipChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {sipChartData.map((entry, index) => (
  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
))}
                      </Pie>
                      <Tooltip content={<CustomTooltip active={undefined} payload={undefined} />} />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        formatter={(value) => <span className="text-sm font-medium">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <Card className="bg-gradient-to-br from-indigo-50 to-white p-6 border-none shadow-md">
                  <div className="space-y-4">
                    <div className="flex justify-between text-gray-600">
                      <span>Invested amount</span>
                      <span className="font-medium">₹{sipResults.investedAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Est. returns</span>
                      <span className="font-medium">₹{sipResults.estimatedReturns.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xl font-semibold text-indigo-900">
                      <span>Total value</span>
                      <span>₹{sipResults.totalValue.toLocaleString()}</span>
                    </div>
                  </div>
                </Card>

                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-lg py-6 rounded-xl">
                  INVEST NOW
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Loan Calculator Tab */}
        <TabsContent value="loan">
          <Card className="p-8 border-none shadow-xl bg-white/80 backdrop-blur">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <h2 className="text-2xl font-semibold text-gray-800">Loan Details</h2>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600 font-medium">Loan Amount</span>
                    <span className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full font-medium">₹ {loanAmount.toLocaleString()}</span>
                  </div>
                  <Slider 
                    value={[loanAmount]} 
                    min={100000} 
                    max={50000000}
                    step={100000}
                    onValueChange={([value]) => setLoanAmount(value)}
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>₹1 Lac</span>
                    <span>₹5 Cr</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600 font-medium">Loan Tenure (in years)</span>
                    <span className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full font-medium">{loanTenure} Years</span>
                  </div>
                  <Slider
                    value={[loanTenure]}
                    min={5}
                    max={30}
                    step={1}
                    onValueChange={([value]) => setLoanTenure(value)}
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>5 Years</span>
                    <span>30 Years</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600 font-medium">Interest Rate (p.a)</span>
                    <span className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full font-medium">{loanInterestRate}%</span>
                  </div>
                  <Slider
                    value={[loanInterestRate]}
                    min={1}
                    max={15}
                    step={0.1}
                    onValueChange={([value]) => setLoanInterestRate(value)}
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>1%</span>
                    <span>15%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800">Loan Summary</h2>
                <div className="h-64 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={loanChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {loanChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip active={undefined} payload={undefined} />} />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => <span className="text-sm font-medium">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <Card className="bg-gradient-to-br from-blue-50 to-white p-6 border-none shadow-md">
                  <div className="space-y-4">
                    <div className="flex justify-between text-gray-600">
                      <span>Monthly EMI</span>
                      <span className="font-medium">₹{loanResults.monthlyEMI.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Total Interest</span>
                      <span className="font-medium">₹{loanResults.totalInterest.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xl font-semibold text-blue-900">
                      <span>Total Payment</span>
                      <span>₹{loanResults.totalPayment.toLocaleString()}</span>
                    </div>
                  </div>
                </Card>

                <Button
                  onClick={() => setSelectedLoanDetails(loanResults)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6 rounded-xl"
                >
                  VIEW DETAILED AMORTIZATION
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <LoanDetailsDialog selectedDetails={selectedLoanDetails} />
    </div>
  );
};

export default FinancialCalculators;

