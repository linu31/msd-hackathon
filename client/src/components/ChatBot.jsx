import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/ChatBot.css';

const ChatBot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Welcome message when opening chat
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 1,
          text: `Hello ${user?.name || 'there'}! 👋 I'm Vignan AI Assistant.\nI can help you with fee payments, installments, exam eligibility, and more!\n\nWhat would you like to know?`,
          sender: 'bot',
          timestamp: new Date()
        }
      ]);
    }
  }, [isOpen, user?.name]);

  // 🚨 IMPROVED: Better error handling and debugging
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      console.log('🔄 Sending to AI service:', inputMessage);
      
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          role: user?.role || 'student',
          user_data: user
        })
      });

      console.log('📨 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server error:', errorText);
        throw new Error(`AI service error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('🤖 AI Response received:', data);

      if (data.success && data.response) {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: data.response,
          sender: 'bot', 
          timestamp: new Date()
        }]);
      } else {
        console.error('❌ Invalid response format:', data);
        throw new Error('AI service returned invalid response format');
      }
    } catch (error) {
      console.error('❌ AI Chat error:', error);
      
      // More detailed error messages
      let fallbackResponse = "";
      
      if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
        fallbackResponse = `🌐 Network Connection Issue\n\nI cannot reach the AI service right now.\n\nPlease:\n• Check if AI service is running on port 8000\n• Try refreshing the page\n• Contact IT support if issue persists`;
      } else if (error.message.includes('500')) {
        fallbackResponse = `🔧 AI Service Error\n\nThe AI service encountered an internal error.\n\nFor immediate help:\n• Contact Finance: 040-23456789\n• Visit: Block A, Ground Floor\n• Try again in a few minutes`;
      } else {
        fallbackResponse = `🔧 Temporary Issue\n\n${error.message}\n\nFor immediate assistance:\n• Contact Finance Office: 040-23456789\n• Visit: Block A, Ground Floor`;
      }
      
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: fallbackResponse,
        sender: 'bot',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Test AI connection
  const testAIConnection = async () => {
    try {
      console.log('🧪 Testing AI connection...');
      const response = await fetch('http://localhost:8000/api/health');
      const data = await response.json();
      console.log('✅ AI Health check:', data);
      return data.status === 'healthy';
    } catch (error) {
      console.error('❌ AI Health check failed:', error);
      return false;
    }
  };

  // Test AI when component mounts
  useEffect(() => {
    if (isOpen) {
      testAIConnection();
    }
  }, [isOpen]);

  const quickReplies = [
    "How to pay tuition fees?",
    "What are installment options?",
    "Exam eligibility requirements",
    "How to download payment receipt?",
    "Fee payment deadlines",
    "Hostel fee payment process",
    "Contact finance department"
  ];

  const handleQuickReply = (reply) => {
    setInputMessage(reply);
    // Auto-send after a short delay
    setTimeout(() => {
      const fakeEvent = { preventDefault: () => {} };
      handleSendMessage(fakeEvent);
    }, 100);
  };

  return (
    <>
      {/* Chat Bot Icon */}
      <div className={`chatbot-icon ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        <div className="bot-avatar">
          <span>🤖</span>
        </div>
        <div className="pulse-ring"></div>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="bot-info">
              <div className="bot-avatar-small">🤖</div>
              <div>
                <h3>Vignan AI Assistant</h3>
                <span className="status">Powered by Gemini AI • Live</span>
              </div>
            </div>
            <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.sender}`}>
                <div className="message-bubble">
                  {message.text.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
                <span className="message-time">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            {isLoading && (
              <div className="message bot">
                <div className="message-bubble loading">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span style={{fontSize: '12px', color: '#666', marginLeft: '10px'}}>
                    AI is thinking...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          <div className="quick-replies">
            {quickReplies.map((reply, index) => (
              <button
                key={index}
                className="quick-reply-btn"
                onClick={() => handleQuickReply(reply)}
                disabled={isLoading}
              >
                {reply}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="chatbot-input">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about fees, payments, exams, deadlines..."
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={isLoading || !inputMessage.trim()}
              title="Send message"
            >
              {isLoading ? '⏳' : '🚀'}
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatBot;