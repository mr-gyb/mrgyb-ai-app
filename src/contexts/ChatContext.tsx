import React, { createContext, useState, useContext, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { Chat, Message, OpenAIMessage } from '../types/chat';
import { generateAIResponse } from '../api/services/chat.service';

interface ChatContextType {
  chats: Chat[];
  currentChatId: string | null;
  isLoading: boolean;
  error: string | null;
  createNewChat: () => Promise<string | null>;
  addMessage: (chatId: string, content: string | OpenAIMessage, role: 'user' | 'assistant' | 'system', senderId?: string, aiAgent?: string) => Promise<void>;
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
    if (!user) {
      setChats([]);
      setCurrentChatId(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const q = query(
      collection(db, 'chats'),
      where('userId', '==', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const chatData: Chat[] = [];
        
        for (const chatDoc of snapshot.docs) {
          const chatId = chatDoc.id;
          const chatDOCData = chatDoc.data();
          
          // Get messages for this chat
          const messagesQuery = query(
            collection(db, 'messages'),
            where('chatId', '==', chatId),
            orderBy('createdAt', 'asc')
          );
          
          const messagesSnapshot = await getDocs(messagesQuery);
          const messages = messagesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Message[];
          
          chatData.push({
            id: chatId,
            title: chatDOCData.title,
            userId: chatDOCData.userId,
            createdAt: chatDOCData.createdAt,
            updatedAt: chatDOCData.updatedAt,
            messages
          });
        }
        
        setChats(chatData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading chats:', err);
        setError('Failed to load chats');
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const createNewChat = async () => {
    if (!user) return null;

    try {
      const newChat = {
        title: 'New Chat',
        userId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const chatRef = await addDoc(collection(db, 'chats'), newChat);
      const newChatWithId: Chat = {
        id: chatRef.id,
        ...newChat,
        messages: []
      };
      
      setChats(prev => [newChatWithId, ...prev]);
      setCurrentChatId(chatRef.id);
      return chatRef.id;
    } catch (err) {
      console.error('Error creating chat:', err);
      setError('Failed to create new chat');
      return null;
    }
  };

  const addMessage = async (chatId: string, content: string | OpenAIMessage, role: 'user' | 'assistant' | 'system', senderId?: string, aiAgent?: string) => {
    try {
      const messageContent = typeof content === 'string' ? content : JSON.stringify(content);
      const newMessage = {
        chatId,
        senderId: senderId || null,
        aiAgent: aiAgent || null, // Convert undefined to null
        content: messageContent,
        role,
        createdAt: new Date().toISOString()
      };
      
      const messageRef = await addDoc(collection(db, 'messages'), newMessage);
      
      // Update chat's updatedAt timestamp
      await updateDoc(doc(db, 'chats', chatId), {
        updatedAt: new Date().toISOString()
      });

      // Update local state
      setChats(prev =>
        prev.map(chat =>
          chat.id === chatId
            ? {
                ...chat,
                messages: [...(chat.messages || []), { id: messageRef.id, ...newMessage }],
                updatedAt: new Date().toISOString()
              }
            : chat
        )
      );

      // If it's a user message, get AI response
      if (role === 'user') {
        const currentChat = chats.find(c => c.id === chatId);
        if (currentChat) {
          const messages: OpenAIMessage[] = (currentChat.messages || []).map(m => ({
            role: m.role,
            content: m.content
          }));

          try {
            const aiResponse = await generateAIResponse([...messages, { role: 'user', content: messageContent }], aiAgent || 'Mr.GYB AI');
            if (aiResponse) {
              await addMessage(chatId, aiResponse, 'assistant', undefined, aiAgent || null);
            }
          } catch (error) {
            console.error('Failed to get AI response:', error);
            setError('Failed to get AI response');
          }
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      // Delete all messages in the chat
      const messagesQuery = query(
        collection(db, 'messages'),
        where('chatId', '==', chatId)
      );
      
      const messagesSnapshot = await getDocs(messagesQuery);
      const deletePromises = messagesSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      
      await Promise.all(deletePromises);
      
      // Delete the chat document
      await deleteDoc(doc(db, 'chats', chatId));
      
      // Update local state
      setChats(prev => prev.filter(chat => chat.id !== chatId));
      if (currentChatId === chatId) {
        setCurrentChatId(null);
      }
      
      return true;
    } catch (err) {
      console.error('Error deleting chat:', err);
      setError('Failed to delete chat');
      return false;
    }
  };

  const updateChatTitle = async (chatId: string, newTitle: string) => {
    try {
      await updateDoc(doc(db, 'chats', chatId), {
        title: newTitle,
        updatedAt: new Date().toISOString()
      });
      
      setChats(prev =>
        prev.map(chat =>
          chat.id === chatId
            ? { ...chat, title: newTitle }
            : chat
        )
      );
      
      return true;
    } catch (err) {
      console.error('Error updating chat title:', err);
      setError('Failed to update chat title');
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