import React, { useState, useRef } from 'react';
import {
  Send,
  Mic,
  Plus,
  Camera,
  ImageIcon,
  Folder,
  X,
  VideoIcon,
} from 'lucide-react';
import FileUploadButton from './FileUploadButton';
import { processFileForAI } from '../../api/services/chat.service';
import { OpenAIMessage } from '../../types/chat';

interface MessageInputProps {
  onSendMessage: (content: string | OpenAIMessage) => Promise<void>;
  isProcessing: boolean;
  videoAvatar: any;
  setVideoAvatar: any;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  isProcessing,
  videoAvatar,
  setVideoAvatar,
}) => {
  const [input, setInput] = useState('');
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileMessage, setFileMessage] = useState<OpenAIMessage | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = async () => {
    if ((!input.trim() && !selectedFile) || isProcessing) return;

    if (selectedFile && fileMessage) {
      // Add user's query to the file message content
      if (Array.isArray(fileMessage.content)) {
        fileMessage.content.push({
          type: 'text',
          text: input.trim() || 'Please analyze this file.',
        });
      }
      await onSendMessage(fileMessage);
      setSelectedFile(null);
      setFileMessage(null);
    } else {
      await onSendMessage(input);
    }
    setInput('');
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = async (file: File) => {
    if (isProcessing) return;
    try {
      const message = await processFileForAI(file);
      setSelectedFile(file);
      setFileMessage(message);
      setDropdownOpen(false);
    } catch (error) {
      console.error('Error processing file:', error);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setFileMessage(null);
  };

  return (
    <div className="p-4 border-t border-gray-200 fixed bottom-16 w-full bg-white">
      {selectedFile && (
        <div className="mb-2 p-2 bg-gray-100 rounded-lg flex items-center justify-between">
          <span className="text-sm text-gray-600">{selectedFile.name}</span>
          <button
            onClick={clearSelectedFile}
            className="text-gray-500 hover:text-red-500"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex items-center bg-gray-100 rounded-full">
        <div className="relative flex items-center space-x-1 sm:space-x-2 px-2">
          <button
            onClick={() => setDropdownOpen(!isDropdownOpen)}
            className="p-2 text-gray-600 hover:text-navy-blue"
          >
            <Plus size={20} />
          </button>
          {isDropdownOpen && (
            <div className="absolute bottom-16 left-0 bg-white shadow-lg rounded-lg z-10 transform flex flex-col justify-center">
              <FileUploadButton
                type="camera"
                onFileSelect={handleFileSelect}
                accept="image/*"
                icon={Camera}
              />
              <FileUploadButton
                type="image"
                onFileSelect={handleFileSelect}
                accept="image/*"
                icon={ImageIcon}
              />
              <FileUploadButton
                type="document"
                onFileSelect={handleFileSelect}
                accept=".pdf,.doc,.docx,.txt"
                icon={Folder}
              />
            </div>
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={
            selectedFile ? 'Add your question or description...' : 'Message'
          }
          className="flex-grow bg-transparent border-none focus:outline-none px-4 py-2 text-navy-blue"
          disabled={isProcessing}
        />

        <div className="flex items-center space-x-1 sm:space-x-2 px-2">
          <button className="p-2 text-gray-600 hover:text-navy-blue">
            <Mic size={20} />
          </button>
          <button className="p-2 text-gray-600 hover:text-navy-blue">
            <VideoIcon
              size={20}
              onClick={() => {
                setVideoAvatar(!videoAvatar);
              }}
            />
          </button>
          <button
            onClick={handleSendMessage}
            disabled={(!input.trim() && !selectedFile) || isProcessing}
            className={`p-2 ${
              (input.trim() || selectedFile) && !isProcessing
                ? 'text-navy-blue hover:text-blue-600'
                : 'text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
