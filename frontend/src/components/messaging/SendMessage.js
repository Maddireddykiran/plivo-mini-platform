import React, { useState } from 'react';
import { messageAPI, billingAPI } from '../../services/api';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import { Send } from 'lucide-react';

const SendMessage = ({ onMessageSent, onBalanceUpdate }) => {
  const [formData, setFormData] = useState({
    recipient_username: '',
    content: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await messageAPI.sendMessage(formData);
      toast.success('Message sent successfully!');
      
      // Clear form
      setFormData({
        recipient_username: '',
        content: ''
      });
      
      // Refresh messages and balance
      if (onMessageSent) onMessageSent();
      
      // Update balance
      const balanceResponse = await billingAPI.getBalance();
      if (onBalanceUpdate) onBalanceUpdate(balanceResponse.data.credits);
      
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to send message';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Card.Header>
        <Card.Title className="flex items-center space-x-2">
          <Send className="h-5 w-5" />
          <span>Send Message</span>
        </Card.Title>
      </Card.Header>
      <Card.Content>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Recipient Username"
            name="recipient_username"
            type="text"
            required
            value={formData.recipient_username}
            onChange={handleChange}
            placeholder="Enter recipient's username"
          />
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Message
            </label>
            <textarea
              name="content"
              rows={4}
              required
              value={formData.content}
              onChange={handleChange}
              placeholder="Type your message here..."
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <Button
            type="submit"
            loading={loading}
            disabled={!formData.recipient_username || !formData.content}
            className="w-full"
          >
            Send Message (1 credit)
          </Button>
        </form>
      </Card.Content>
    </Card>
  );
};

export default SendMessage;
