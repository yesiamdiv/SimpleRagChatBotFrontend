import { create } from 'zustand';

const useChatStore = create((set, get) => ({
  messages: [],
  currentUser: null,
  currentModel: null,
  isMemoryEnabled: true,
  isLoading: false,
  config: { models: [], users: [], features: [] },
  
  setConfig: (config) => set({ config }),
  
  setCurrentUser: (user) => {
    const prevUser = get().currentUser;
    set({ currentUser: user });
    // Clear messages when user changes
    if (prevUser && prevUser !== user) {
      set({ messages: [] });
    }
  },
  
  setCurrentModel: (model) => set({ currentModel: model }),
  
  toggleMemory: () => set((state) => ({ isMemoryEnabled: !state.isMemoryEnabled })),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  
  clearMessages: () => set({ messages: [] }),
}));

export default useChatStore;