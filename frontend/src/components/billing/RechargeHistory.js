import React, { useState, useEffect } from 'react';
import { billingAPI } from '../../services/api';
import Card from '../ui/Card';
import { History, CreditCard } from 'lucide-react';

const RechargeHistory = ({ refreshTrigger }) => {
  const [recharges, setRecharges] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRechargeHistory = async () => {
    try {
      const response = await billingAPI.getRechargeHistory();
      setRecharges(response.data);
    } catch (error) {
      console.error('Failed to fetch recharge history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRechargeHistory();
  }, [refreshTrigger]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <Card>
        <Card.Content>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title className="flex items-center space-x-2">
          <History className="h-5 w-5" />
          <span>Recharge History</span>
        </Card.Title>
      </Card.Header>
      <Card.Content>
        {recharges.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No recharge history yet.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recharges.map((recharge) => (
              <div
                key={recharge.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">
                      +{recharge.amount} credits
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(recharge.created_at)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      recharge.status
                    )}`}
                  >
                    {recharge.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card.Content>
    </Card>
  );
};

export default RechargeHistory;
