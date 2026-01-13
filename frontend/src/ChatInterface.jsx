import { useState } from 'react';
import axios from 'axios';

const ChatInterface = ({user}) => {
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Hello! I am your AI agent. How can I help you?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        if (!input.trim()) return;

        // 1. Add User Message (Keep existing format: 'sender' and 'text')
        const userMessage = { sender: 'user', text: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            // 2. Send to Python Backend
            // We added 'user_role' because the Python Graph needs it to pick the right prompt
            const response = await axios.post('http://127.0.0.1:8000/api/chat', {
                message: input,
                user_role: user.role, //dynamic change
                thread_id: user.username   
            });

            // 3. Add AI Response
            const botMessage = { sender: 'bot', text: response.data.reply };
            setMessages((prev) => [...prev, botMessage]);

        } catch (error) {
            console.error("Error talking to Python:", error);
            const errorMessage = { sender: 'bot', text: "Error: Could not connect to the local Python brain." };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto border border-gray-300 rounded-lg shadow-lg bg-white font-sans">

            {/* Header */}
            <div className="bg-blue-600 p-4 text-white rounded-t-lg font-bold text-lg">
                AI Support Agent
            </div>

            {/* Chat Window */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-gray-50">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`max-w-[75%] px-4 py-2 rounded-2xl leading-relaxed ${msg.sender === 'user'
                                ? 'self-end bg-blue-600 text-white rounded-br-none'
                                : 'self-start bg-gray-200 text-gray-800 rounded-bl-none'
                            }`}
                    >
                        {msg.text}
                    </div>
                ))}

                {loading && (
                    <div className="self-start text-gray-500 text-sm italic animate-pulse">
                        Thinking...
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="flex p-3 border-t border-gray-200 bg-white rounded-b-lg">
                <input
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                />
                <button
                    className="ml-3 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
                    onClick={sendMessage}
                    disabled={loading}
                >
                    {loading ? '...' : 'Send'}
                </button>
            </div>
        </div>
    );
};

export default ChatInterface;