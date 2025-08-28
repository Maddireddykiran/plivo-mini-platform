import React, { useState } from 'react';
import { billingAPI } from '../../services/api';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import { CreditCard } from 'lucide-react';

const RechargeForm = ({ onRechargeSuccess }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const predefinedAmounts = [10, 25, 50, 100];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const rechargeAmount = parseInt(amount);
    
    if (!rechargeAmount || rechargeAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);

    try {
      await billingAPI.recharge(rechargeAmount);
      toast.success(`Successfully recharged ${rechargeAmount} credits!`);
      setAmount('');
      
      if (onRechargeSuccess) {
        onRechargeSuccess();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Recharge failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Card.Header>
        <Card.Title className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5" />
          <span>Recharge Credits</span>
        </Card.Title>
      </Card.Header>
      <Card.Content>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Quick Select
            </label>
            <div className="grid grid-cols-2 gap-2">
              {predefinedAmounts.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(preset.toString())}
                  className={amount === preset.toString() ? 'ring-2 ring-primary-500' : ''}
                >
                  {preset} credits
                </Button>
              ))}
            </div>
          </div>

          <Input
            label="Custom Amount"
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
          />

          <Button
            type="submit"
            loading={loading}
            disabled={!amount || parseInt(amount) <= 0}
            className="w-full"
          >
            Recharge {amount ? `${amount} credits` : ''}
          </Button>
        </form>
      </Card.Content>
    </Card>
  );
};

export default RechargeForm;
