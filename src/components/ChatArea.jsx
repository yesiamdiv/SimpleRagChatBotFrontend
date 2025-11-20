import React, { useEffect, useState } from 'react';
import { Send, Loader, User, Bot, AlertCircle, Check, X } from 'lucide-react';
import useChatStore from '../store/useChatStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Simple Markdown Component
const MarkdownRenderer = ({ content }) => {
  const renderMarkdown = (text) => {
    // Handle tables
    if (text.includes('|')) {
      const lines = text.split('\n');
      const tableLines = [];
      let inTable = false;
      let otherContent = [];
      
      lines.forEach(line => {
        if (line.trim().startsWith('|')) {
          inTable = true;
          tableLines.push(line);
        } else if (inTable && line.trim() === '') {
          inTable = false;
        } else if (!inTable) {
          otherContent.push(line);
        }
      });
      
      if (tableLines.length > 0) {
        const headers = tableLines[0].split('|').filter(h => h.trim()).map(h => h.trim());
        const rows = tableLines.slice(2).map(row => 
          row.split('|').filter(cell => cell.trim()).map(cell => cell.trim())
        );
        
        return (
          <div>
            {otherContent.length > 0 && <div className="mb-4 whitespace-pre-wrap">{otherContent.join('\n')}</div>}
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    {headers.map((header, idx) => (
                      <th key={idx} className="border border-gray-300 px-4 py-2 text-left font-semibold">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      {row.map((cell, cellIdx) => (
                        <td key={cellIdx} className="border border-gray-300 px-4 py-2">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      }
    }
    
    // Handle lists
    const parts = text.split('\n').map((line, idx) => {
      if (line.match(/^[-*]\s/)) {
        return <li key={idx} className="ml-4">{line.replace(/^[-*]\s/, '')}</li>;
      }
      if (line.match(/^\d+\.\s/)) {
        return <li key={idx} className="ml-4">{line.replace(/^\d+\.\s/, '')}</li>;
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <strong key={idx}>{line.slice(2, -2)}</strong>;
      }
      return <div key={idx}>{line}</div>;
    });
    
    return <div className="space-y-1">{parts}</div>;
  };
  
  return <div className="text-gray-800">{renderMarkdown(content)}</div>;
};
const ChatArea = () => {
  const [inputMessage, setInputMessage] = useState('');
  const { 
    messages, 
    currentUser, 
    currentModel, 
    isMemoryEnabled, 
    isLoading, 
    addMessage, 
    setLoading 
  } = useChatStore();

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentUser || !currentModel) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    addMessage(userMessage);
    setInputMessage('');
    setLoading(true);

    try {
      const history = isMemoryEnabled ? messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })) : [];

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          user_id: currentUser,
          model_id: currentModel,
          use_memory: isMemoryEnabled,
          history: history,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const botMessage = {
        role: 'assistant',
        content: data.response,
        tool_used: data.tool_used,
        timestamp: new Date().toISOString(),
      };

      addMessage(botMessage);
    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        content: '❌ Error: Failed to communicate with backend. Please check your connection.',
        isError: true,
        timestamp: new Date().toISOString(),
      };
      addMessage(errorMessage);
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-400">
              <Bot className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No messages yet</p>
              <p className="text-sm">Start a conversation with the HR chatbot</p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-2xl rounded-lg p-4 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : msg.isError
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-white border border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {msg.role === 'assistant' && (
                    <Bot className={`w-5 h-5 mt-1 flex-shrink-0 ${msg.isError ? 'text-red-500' : 'text-gray-600'}`} />
                  )}
                  {msg.role === 'user' && (
                    <User className="w-5 h-5 mt-1 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    {msg.role === 'assistant' && !msg.isError ? (
                      <MarkdownRenderer content={msg.content} />
                    ) : (
                      <p className={msg.isError ? 'text-red-700' : ''}>{msg.content}</p>
                    )}
                    {msg.tool_used && (
                      <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Tool used: <span className="font-mono">{msg.tool_used}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <Loader className="w-5 h-5 text-blue-600 animate-spin" />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4">
        {!currentUser || !currentModel ? (
          <div className="flex items-center justify-center gap-2 text-yellow-700 bg-yellow-50 p-3 rounded-lg">
            <AlertCircle className="w-5 h-5" />
            <span>Please select a user and model from the Dev Console</span>
          </div>
        ) : (
          <div className="flex gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatArea;
