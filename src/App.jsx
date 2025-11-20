import React, { useEffect, useState } from 'react';
import { Send, Loader, User, Bot, AlertCircle, Check, X } from 'lucide-react';
import useChatStore from './store/useChatStore';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Main App Component
const App = () => {
  const [apiStatus, setApiStatus] = useState('checking');
  const { setConfig, setCurrentUser, setCurrentModel } = useChatStore();

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/config`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setConfig(data);
        
        // Set defaults
        if (data.users.length > 0) {
          setCurrentUser(data.users[0]);
        }
        if (data.models.length > 0) {
          setCurrentModel(data.models[0]);
        }
        
        setApiStatus('connected');
      } catch (error) {
        console.error('Failed to fetch config:', error);
        setApiStatus('disconnected');
        // Set fallback config for development
        setConfig({
          models: ['Ollama', 'GPT-4'],
          users: ['Alice', 'Bob', 'Eve'],
          features: ['memory_toggle']
        });
        setCurrentUser('Alice');
        setCurrentModel('Ollama');
      }
    };

    fetchConfig();
  }, [setConfig, setCurrentUser, setCurrentModel]);

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Vulnerable HR Chatbot Interface</h1>
          <div className="text-sm text-gray-400">Production Grade Testing Environment</div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <ChatArea />
        <Sidebar apiStatus={apiStatus} />
      </div>
    </div>
  );
};

export default App;