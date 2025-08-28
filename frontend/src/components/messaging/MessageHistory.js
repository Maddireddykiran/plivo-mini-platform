import React, { useState, useEffect } from 'react';
import { messageAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Card from '../ui/Card';
import { MessageCircle, Clock, CheckCircle } from 'lucide-react';

const MessageHistory = ({ refreshTrigger }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchMessages = async () => {
    try {
      const response = await messageAPI.getMessages();
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [refreshTrigger]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'failed':
        return <Clock className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
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
          <MessageCircle className="h-5 w-5" />
          <span>Message History</span>
        </Card.Title>
      </Card.Header>
      <Card.Content>
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No messages yet. Send your first message!</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-4 rounded-lg border ${
                  message.sender_id === user.id
                    ? 'bg-primary-50 border-primary-200 ml-8'
                    : 'bg-gray-50 border-gray-200 mr-8'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">
                      {message.sender_id === user.id ? 'You' : message.sender_username}
                    </span>
                    <span className="text-xs text-gray-500">→</span>
                    <span className="text-sm text-gray-600">
                      {message.recipient_id === user.id ? 'You' : message.recipient_username}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(message.status)}
                    <span className="text-xs text-gray-500 capitalize">
                      {message.status}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-800 mb-2">{message.content}</p>
                
                <div className="text-xs text-gray-500">
                  {formatDate(message.created_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card.Content>
    </Card>
  );
};

export default MessageHistory;
