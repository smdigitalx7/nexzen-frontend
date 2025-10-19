import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, DollarSign, Users, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PaymentProcessor, PaymentData } from './PaymentProcessor';

const PaymentDemo: React.FC = () => {
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);

  const demoScenarios = [
    {
      id: 'tuition-fee',
      title: 'Tuition Fee Payment',
      description: 'Pay monthly tuition fees for student enrollment',
      icon: DollarSign,
      color: 'bg-blue-500',
      paymentData: {
        id: 'payment-1',
        amount: 15000,
        currency: 'INR',
        description: 'Monthly Tuition Fee - January 2024',
        merchant: 'NexGen Academy',
        paymentMethod: 'card' as const,
        status: 'pending' as const
      }
    },
    {
      id: 'transport-fee',
      title: 'Transport Fee Payment',
      description: 'Pay monthly transport charges',
      icon: Users,
      color: 'bg-green-500',
      paymentData: {
        id: 'payment-2',
        amount: 2500,
        currency: 'INR',
        description: 'Monthly Transport Fee - January 2024',
        merchant: 'NexGen Academy',
        paymentMethod: 'upi' as const,
        status: 'pending' as const
      }
    },
    {
      id: 'exam-fee',
      title: 'Examination Fee',
      description: 'Pay semester examination fees',
      icon: CreditCard,
      color: 'bg-purple-500',
      paymentData: {
        id: 'payment-3',
        amount: 5000,
        currency: 'INR',
        description: 'Semester Examination Fee - 2024',
        merchant: 'NexGen Academy',
        paymentMethod: 'netbanking' as const,
        status: 'pending' as const
      }
    },
    {
      id: 'library-fee',
      title: 'Library Fee',
      description: 'Pay annual library membership fee',
      icon: Settings,
      color: 'bg-orange-500',
      paymentData: {
        id: 'payment-4',
        amount: 1200,
        currency: 'INR',
        description: 'Annual Library Membership Fee',
        merchant: 'NexGen Academy',
        paymentMethod: 'wallet' as const,
        status: 'pending' as const
      }
    }
  ];

  const handlePaymentComplete = (paymentData: PaymentData) => {
    console.log('Payment completed:', paymentData);
    setSelectedDemo(null);
  };

  const handlePaymentFailed = (error: string) => {
    console.error('Payment failed:', error);
  };

  const handlePaymentCancel = () => {
    console.log('Payment cancelled');
    setSelectedDemo(null);
  };

  if (selectedDemo) {
    const scenario = demoScenarios.find(s => s.id === selectedDemo);
    if (!scenario) return null;

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <PaymentProcessor
            paymentData={scenario.paymentData}
            onPaymentComplete={handlePaymentComplete}
            onPaymentFailed={handlePaymentFailed}
            onPaymentCancel={handlePaymentCancel}
            autoProcess={false}
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Payment Processing Demo
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Experience our animated payment processing system with various scenarios
          </p>
          <Badge variant="outline" className="text-sm">
            Interactive Demo
          </Badge>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {demoScenarios.map((scenario, index) => {
            const Icon = scenario.icon;
            return (
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200"
                  onClick={() => setSelectedDemo(scenario.id)}
                >
                  <CardHeader className="text-center pb-4">
                    <div className={`w-16 h-16 mx-auto rounded-full ${scenario.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-lg">{scenario.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      {scenario.description}
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-semibold">
                          {scenario.paymentData.currency} {scenario.paymentData.amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Method:</span>
                        <Badge variant="secondary" className="capitalize">
                          {scenario.paymentData.paymentMethod}
                        </Badge>
                      </div>
                    </div>
                    <Button className="w-full mt-4" variant="outline">
                      Try Payment
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Secure Processing</h3>
                  <p className="text-sm text-muted-foreground">
                    Bank-level security with encrypted transactions
                  </p>
                </div>
                <div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Multiple Methods</h3>
                  <p className="text-sm text-muted-foreground">
                    Support for cards, UPI, net banking, and wallets
                  </p>
                </div>
                <div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Settings className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Receipt Generation</h3>
                  <p className="text-sm text-muted-foreground">
                    Automatic PDF receipt generation and email delivery
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export { PaymentDemo };
