// frontend/src/ChatInterface.jsx
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  MessageSquare, 
  PlusCircle, 
  History, 
  LogOut, 
  Send, 
  ShieldAlert, 
  FileText, 
  CheckCircle, 
  Search,
  User,
  Bot
} from 'lucide-react';

const ChatInterface = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Define Quick Actions based on Role
  const getQuickActions = () => {
    if (user.role === 'MANAGER') {
      return [
        { icon: <CheckCircle className="w-6 h-6 text-green-500" />, title: "Approve Refunds", prompt: "I need to review pending refund requests." },
        { icon: <ShieldAlert className="w-6 h-6 text-red-500" />, title: "Team Performance", prompt: "Analyze the support team's resolution time." },
        { icon: <FileText className="w-6 h-6 text-blue-500" />, title: "Audit Logs", prompt: "Show me the recent policy override attempts." },
        { icon: <Search className="w-6 h-6 text-purple-500" />, title: "Knowledge Base", prompt: "Search the manager handbook for escalation protocols." }
      ];
    } else {
      return [
        { icon: <Search className="w-6 h-6 text-blue-500" />, title: "Check Refund Policy", prompt: "What is the policy for refunding a damaged item?" },
        { icon: <MessageSquare className="w-6 h-6 text-purple-500" />, title: "Draft Response", prompt: "Draft a polite response to an angry customer." },
        { icon: <FileText className="w-6 h-6 text-green-500" />, title: "Order Status", prompt: "Check the status of order #12345." },
        { icon: <ShieldAlert className="w-6 h-6 text-orange-500" />, title: "Escalate Ticket", prompt: "I need to escalate this ticket to a manager." }
      ];
    }
  };

  const handleSend = async (text = input) => {
    if (!text.trim()) return;

    // Add User Message
    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/chat', {
        message: text,
        messages: newMessages,
        user_role: user.role,
        thread_id: user.username
      });

      // Add AI Response
      setMessages([...newMessages, { role: 'ai', content: response.data.response }]);
    } catch (error) {
      setMessages([...newMessages, { role: 'ai', content: "Error: Could not connect to the local Brain." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      
      {/* 1. SIDEBAR */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Bot className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl text-gray-800">TechFlow AI</span>
        </div>

        <div className="p-4">
          <button 
            onClick={() => setMessages([])}
            className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-all shadow-sm font-medium"
          >
            <PlusCircle className="w-4 h-4" /> New Session
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 mt-2">Recent Consultations</h3>
          {/* Mock History Items */}
          <div className="space-y-2">
            {['Order #8821 Refund', 'Policy Check: Warranty', 'Defective Item Escalation'].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-2 text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer text-sm">
                <History className="w-4 h-4" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role.replace('_', ' ').toLowerCase()}</p>
            </div>
          </div>
          <button onClick={() => window.location.reload()} className="flex items-center gap-2 text-red-500 hover:text-red-600 text-sm">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* 2. MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col h-full relative">
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
          {messages.length === 0 ? (
            /* ZERO STATE: DASHBOARD CARDS */
            <div className="h-full flex flex-col items-center justify-center max-w-4xl mx-auto animate-fade-in-up">
              <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome back, <span className="text-blue-600">{user.name.split(' ')[0]}</span>.
                </h1>
                <p className="text-gray-500">How can I assist with your support tickets today?</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {getQuickActions().map((action, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleSend(action.prompt)}
                    className="flex flex-col items-start p-6 bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg rounded-xl transition-all text-left group"
                  >
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                      {action.icon}
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1">{action.title}</h3>
                    <p className="text-sm text-gray-500">{action.prompt}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* CHAT HISTORY */
            <div className="space-y-6 max-w-3xl mx-auto pb-24">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'ai' && (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}
                  
                  <div className={`p-4 rounded-2xl max-w-[80%] shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-sm' 
                      : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'
                  }`}>
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                  )}
                </div>
              ))}
              
              {loading && (
                <div className="flex gap-4 animate-pulse">
                   <div className="w-8 h-8 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex items-center gap-1 bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-tl-sm">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* INPUT AREA */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent">
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-xl border border-gray-200 flex items-center p-2">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={messages.length === 0 ? "Or type your own question..." : "Ask a follow-up question..."}
              className="flex-1 p-3 bg-transparent outline-none text-gray-700 placeholder-gray-400"
              disabled={loading}
            />
            <button 
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ChatInterface;