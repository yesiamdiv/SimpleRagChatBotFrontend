import React, { useEffect, useState } from 'react';
import { Send, Loader, User, Bot, AlertCircle, Check, X } from 'lucide-react';
import useChatStore from '../store/useChatStore';

// Sidebar Component
const Sidebar = ({ apiStatus }) => {
  const { 
    config, 
    currentUser, 
    currentModel, 
    isMemoryEnabled, 
    setCurrentUser, 
    setCurrentModel, 
    toggleMemory 
  } = useChatStore();

  return (
    <div className="w-80 bg-gray-900 border-l border-gray-700 p-6 flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-2">Dev Console</h2>
        <div className="flex items-center gap-2 text-sm">
          {apiStatus === 'connected' ? (
            <>
              <Check className="w-4 h-4 text-green-500" />
              <span className="text-green-500">API Connected</span>
            </>
          ) : apiStatus === 'disconnected' ? (
            <>
              <X className="w-4 h-4 text-red-500" />
              <span className="text-red-500">API Disconnected</span>
            </>
          ) : (
            <>
              <Loader className="w-4 h-4 text-yellow-500 animate-spin" />
              <span className="text-yellow-500">Checking...</span>
            </>
          )}
        </div>
      </div>

      <div className="space-y-6 flex-1">
        {/* User Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Active User
          </label>
          <select
            value={currentUser || ''}
            onChange={(e) => setCurrentUser(e.target.value)}
            className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>Select User</option>
            {config.users.map((user) => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>
        </div>

        {/* Model Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            LLM Model
          </label>
          <select
            value={currentModel || ''}
            onChange={(e) => setCurrentModel(e.target.value)}
            className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>Select Model</option>
            {config.models.map((model) => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>

        {/* Memory Toggle */}
        {config.features.includes('memory_toggle') && (
          <div>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-gray-300">
                Conversation Memory
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isMemoryEnabled}
                  onChange={toggleMemory}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </div>
            </label>
            <p className="text-xs text-gray-500 mt-2">
              {isMemoryEnabled ? 'History will be sent to backend' : 'Stateless conversation'}
            </p>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <h3 className="text-sm font-semibold text-gray-300 mb-2">Research Mode</h3>
        <p className="text-xs text-gray-400">
          This interface simulates different user personas to test chatbot vulnerabilities.
          Switch users to observe behavior changes.
        </p>
      </div>
    </div>
  );
};

export default Sidebar;