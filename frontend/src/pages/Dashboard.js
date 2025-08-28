import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { billingAPI } from '../services/api';
import Layout from '../components/Layout';
import SendMessage from '../components/messaging/SendMessage';
import MessageHistory from '../components/messaging/MessageHistory';
import RechargeForm from '../components/billing/RechargeForm';
import RechargeHistory from '../components/billing/RechargeHistory';
import Card from '../components/ui/Card';
import { MessageCircle, CreditCard, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(user?.credits || 0);
  const [messageRefresh, setMessageRefresh] = useState(0);
  const [rechargeRefresh, setRechargeRefresh] = useState(0);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const response = await billingAPI.getBalance();
      setBalance(response.data.credits);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  };

  const handleMessageSent = () => {
    setMessageRefresh(prev => prev + 1);
    fetchBalance();
  };

  const handleRechargeSuccess = () => {
    setRechargeRefresh(prev => prev + 1);
    fetchBalance();
  };

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.username}!
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your messages and account balance from your dashboard.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <Card.Content className="flex items-center">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CreditCard className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Available Credits
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {balance}
                    </dd>
                  </dl>
                </div>
              </div>
            </Card.Content>
          </Card>

          <Card>
            <Card.Content className="flex items-center">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <MessageCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Message Cost
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      1 credit
                    </dd>
                  </dl>
                </div>
              </div>
            </Card.Content>
          </Card>

          <Card>
            <Card.Content className="flex items-center">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Account Status
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Active
                    </dd>
                  </dl>
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            <SendMessage 
              onMessageSent={handleMessageSent}
              onBalanceUpdate={setBalance}
            />
            <RechargeForm onRechargeSuccess={handleRechargeSuccess} />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <MessageHistory refreshTrigger={messageRefresh} />
            <RechargeHistory refreshTrigger={rechargeRefresh} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
