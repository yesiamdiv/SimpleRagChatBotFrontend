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
    // Add markdown styles to document
    const style = document.createElement('style');
    style.textContent = `
      .markdown-content {
        line-height: 1.6;
      }
      .markdown-content h1 {
        font-size: 1.875rem;
        font-weight: 700;
        margin-top: 1.5rem;
        margin-bottom: 1rem;
        color: #1f2937;
      }
      .markdown-content h2 {
        font-size: 1.5rem;
        font-weight: 600;
        margin-top: 1.25rem;
        margin-bottom: 0.875rem;
        color: #374151;
      }
      .markdown-content h3 {
        font-size: 1.25rem;
        font-weight: 600;
        margin-top: 1rem;
        margin-bottom: 0.75rem;
        color: #4b5563;
      }
      .markdown-content p {
        margin-bottom: 1rem;
        color: #1f2937;
      }
      .markdown-content ul, .markdown-content ol {
        margin-left: 1.5rem;
        margin-bottom: 1rem;
        list-style-position: outside;
      }
      .markdown-content ul {
        list-style-type: disc;
      }
      .markdown-content ol {
        list-style-type: decimal;
      }
      .markdown-content li {
        margin-bottom: 0.375rem;
        color: #374151;
      }
      .markdown-content pre {
        background-color: #1f2937;
        color: #e5e7eb;
        padding: 1rem;
        border-radius: 0.5rem;
        overflow-x: auto;
        margin-bottom: 1rem;
        font-family: 'Courier New', monospace;
        font-size: 0.875rem;
      }
      .markdown-content code {
        font-family: 'Courier New', monospace;
        font-size: 0.875rem;
      }
      .markdown-content .inline-code {
        background-color: #f3f4f6;
        color: #dc2626;
        padding: 0.125rem 0.375rem;
        border-radius: 0.25rem;
        font-size: 0.875rem;
      }
      .markdown-content blockquote {
        border-left: 4px solid #3b82f6;
        padding-left: 1rem;
        margin: 1rem 0;
        color: #6b7280;
        font-style: italic;
      }
      .markdown-content a {
        color: #3b82f6;
        text-decoration: underline;
      }
      .markdown-content a:hover {
        color: #2563eb;
      }
      .markdown-content hr {
        border: 0;
        border-top: 2px solid #e5e7eb;
        margin: 1.5rem 0;
      }
      .markdown-content img {
        max-width: 100%;
        height: auto;
        border-radius: 0.5rem;
        margin: 1rem 0;
      }
      .markdown-content strong {
        font-weight: 600;
        color: #111827;
      }
      .markdown-content em {
        font-style: italic;
      }
      .markdown-content del {
        text-decoration: line-through;
        color: #9ca3af;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

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
          <h1 className="text-2xl font-bold text-white">Vulnerable HR Chatbot Research Interface</h1>
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