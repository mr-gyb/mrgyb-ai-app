import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Send,
  PlusCircle,
  Camera,
  Image as ImageIcon,
  Folder,
  Mic,
  Video,
  Headphones,
  Edit2,
  Check,
  X,
} from 'lucide-react';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import { getChat } from '../lib/firebase/chats';

const Chat: React.FC = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addMessage, updateChatTitle } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const [currentAgent, setCurrentAgent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentChat, setCurrentChat] = useState<any>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadChat = async () => {
      if (chatId) {
        setIsLoading(true);
        const chatData = await getChat(chatId);
        if (chatData) {
          setCurrentChat(chatData);
          setEditedTitle(chatData.title);
          const lastAiMessage = chatData.messages?.find(
            (m) => m.role === 'assistant'
          );
          if (lastAiMessage?.aiAgent) {
            setCurrentAgent(lastAiMessage.aiAgent);
          }
        } else {
          navigate('/new-chat');
        }
        setIsLoading(false);
      }
    };

    loadChat();
  }, [chatId, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat?.messages]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditingTitle]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatId) return;

    const messageContent = newMessage;
    setNewMessage('');

    try {
      // Add user message
      console.log("user message sent");
      await addMessage(chatId, messageContent, 'user', user?.uid);

      // Update local state immediately
      setCurrentChat((prev) => ({
        ...prev,
        messages: [
          ...(prev.messages || []),
          {
            id: Date.now().toString(),
            chatId,
            content: messageContent,
            role: 'user',
            createdAt: new Date().toISOString(),
          },
        ],
      }));

      // Simulate AI response
      setTimeout(async () => {
        const aiResponse = `This is a response from ${
          currentAgent || 'AI Assistant'
        } to your message: "${messageContent}"`;
        await addMessage(
          chatId,
          aiResponse,
          'assistant',
          undefined,
          currentAgent
        );

        // Update local state with AI response
        setCurrentChat((prev) => ({
          ...prev,
          messages: [
            ...(prev.messages || []),
            {
              id: (Date.now() + 1).toString(),
              chatId,
              content: aiResponse,
              role: 'assistant',
              aiAgent: currentAgent,
              createdAt: new Date().toISOString(),
            },
          ],
        }));

        // Scroll to bottom
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
      // Optionally show error to user
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleTitleUpdate = async () => {
    if (chatId && editedTitle.trim()) {
      const success = await updateChatTitle(chatId, editedTitle.trim());
      if (success) {
        setCurrentChat((prev) => ({ ...prev, title: editedTitle.trim() }));
        setIsEditingTitle(false);
      }
    }
  };

  const handleTitleKeyPress = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === 'Enter') {
      handleTitleUpdate();
    } else if (event.key === 'Escape') {
      setIsEditingTitle(false);
      setEditedTitle(currentChat?.title || '');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy-blue"></div>
      </div>
    );
  }

  if (!currentChat) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Fixed Header */}
      <div className="fixed top-16 left-0 right-0 z-20 bg-navy-blue text-white">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex-grow mr-4">
              {isEditingTitle ? (
                <div className="flex items-center">
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onKeyDown={handleTitleKeyPress}
                    className="bg-white/10 text-white px-2 py-1 rounded flex-grow"
                    placeholder="Enter chat title..."
                  />
                  <button
                    onClick={handleTitleUpdate}
                    className="ml-2 p-1 hover:bg-white/10 rounded"
                  >
                    <Check size={20} />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingTitle(false);
                      setEditedTitle(currentChat.title);
                    }}
                    className="ml-1 p-1 hover:bg-white/10 rounded"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center">
                  <h1 className="text-lg font-semibold mr-2">
                    {currentChat.title}
                  </h1>
                  <button
                    onClick={() => setIsEditingTitle(true)}
                    className="p-1 hover:bg-white/10 rounded"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {currentAgent && (
                <p className="text-sm opacity-75">
                  Chatting with: {currentAgent}
                </p>
              )}
              <button
                onClick={() => navigate('/new-chat')}
                className="bg-gold text-navy-blue px-3 py-1 rounded-full flex items-center text-sm"
              >
                <PlusCircle size={16} className="mr-1" />
                New Chat
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Chat Content */}
      <div className="flex-1 overflow-y-auto mt-32 mb-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-4">
            {currentChat.messages?.map((message: any, index: number) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs sm:max-w-md lg:max-w-lg rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-gold text-navy-blue'
                      : 'bg-navy-blue text-white'
                  }`}
                >
                  <p className="text-sm sm:text-base">{message.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Fixed Message Input */}
      <div className="fixed bottom-16 left-0 right-0 z-20 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center bg-gray-100 rounded-full">
            <div className="flex items-center space-x-1 sm:space-x-2 px-2">
              <button className="p-2 text-gray-600 hover:text-navy-blue">
                <Camera size={20} />
              </button>
              <button className="p-2 text-gray-600 hover:text-navy-blue">
                <ImageIcon size={20} />
              </button>
              <button className="p-2 text-gray-600 hover:text-navy-blue">
                <Folder size={20} />
              </button>
            </div>
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Message"
              className="flex-grow bg-transparent border-none focus:outline-none px-4 py-2 text-navy-blue"
            />
            <div className="flex items-center space-x-1 sm:space-x-2 px-2">
              <button className="p-2 text-gray-600 hover:text-navy-blue">
                <Mic size={20} />
              </button>
              <button className="p-2 text-gray-600 hover:text-navy-blue">
                <Headphones size={20} />
              </button>
              <button className="p-2 text-gray-600 hover:text-navy-blue">
                <Video size={20} />
              </button>
              <button
                onClick={handleSendMessage}
                className={`p-2 ${
                  newMessage.trim()
                    ? 'text-navy-blue hover:text-blue-600'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
                disabled={!newMessage.trim()}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;