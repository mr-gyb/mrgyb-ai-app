import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Chat, Message, OpenAIMessage } from '../types/chat';
import { createChat, getUserChats, addMessage as addMessageToDb, deleteChat as deleteChatFromDb, updateChatTitle as updateChatTitleDb } from '../lib/supabase/chats';
import { generateAIResponse } from '../api/services/chat.service';

interface ChatContextType {
  chats: Chat[];
  currentChatId: string | null;
  isLoading: boolean;
  error: string | null;
  createNewChat: () => Promise<string | null>;
  addMessage: (chatId: string, content: string, role: 'user' | 'assistant' | 'system', senderId?: string, aiAgent?: string) => Promise<void>;
  setCurrentChat: (chatId: string) => void;
  deleteChat: (chatId: string) => Promise<boolean>;
  updateChatTitle: (chatId: string, newTitle: string) => Promise<boolean>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const initializeChat = async () => {
      if (!user) {
        setChats([]);
        setCurrentChatId(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
 
        const userChats = await getUserChats(user.id);
        setChats(userChats);
      } catch (err) {
        setError('Failed to load chats');
        console.error('Error loading chats:', err);
      } finally {
 
        setIsLoading(false);
      }
    };

    initializeChat();
  }, [user]);

  const createNewChat = async () => {
    console.log("createnewcaht");
    if (!user) return null;
    try {
      
      const newChat = await createChat(user.id);
      if (newChat) {
        setChats(prev => [newChat, ...prev]);
        setCurrentChatId(newChat.id);
        return newChat.id;
      }
      return null;
    } catch (err) {
      setError('Failed to create new chat');
      console.error('Error creating chat:', err);
      return null;
    }
  };

  const addMessage = async (chatId: string, content: string, role: 'user' | 'assistant' | 'system', senderId?: string, aiAgent?: string) => {
    try {
      const message = await addMessageToDb(chatId, content, role, senderId, aiAgent);

      if (message) {
        setChats(prev =>
          prev.map(chat =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: [...(chat.messages || []), message],
                  updatedAt: new Date().toISOString()
                }
              : chat
          )
        );

        // If it's a user message, get AI response
        if (role === 'user') {
          const currentChat = chats.find(c => c.id === chatId);
          if (currentChat) {
            // Convert chat history to OpenAI format
            const messages: OpenAIMessage[] = (currentChat.messages || []).map(m => ({
              role: m.role,
              content: m.content
            }));

            try {
              const aiResponse = await generateAIResponse([...messages, { role: 'user', content }], aiAgent || 'Mr.GYB AI');
              if (aiResponse) {
                await addMessage(chatId, aiResponse, 'assistant', undefined, aiAgent);
              }
            } catch (error) {
              console.error('Failed to get AI response:', error);
              setError('Failed to get AI response');
            }
          }
        }
      }
    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      const success = await deleteChatFromDb(chatId);
      if (success) {
        setChats(prev => prev.filter(chat => chat.id !== chatId));
        if (currentChatId === chatId) {
          setCurrentChatId(null);
        }
      }
      return success;
    } catch (err) {
      setError('Failed to delete chat');
      console.error('Error deleting chat:', err);
      return false;
    }
  };

  const updateChatTitle = async (chatId: string, newTitle: string) => {
    try {
      const success = await updateChatTitleDb(chatId, newTitle);
      if (success) {
        setChats(prev =>
          prev.map(chat =>
            chat.id === chatId
              ? { ...chat, title: newTitle }
              : chat
          )
        );
      }
      return success;
    } catch (err) {
      setError('Failed to update chat title');
      console.error('Error updating chat title:', err);
      return false;
    }
  };

  const value = {
    chats,
    currentChatId,
    isLoading,
    error,
    createNewChat,
    addMessage,
    setCurrentChat: setCurrentChatId,
    deleteChat,
    updateChatTitle
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};