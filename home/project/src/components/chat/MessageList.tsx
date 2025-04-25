import React from 'react';
import { Message } from '../../types/chat';
import { FileText } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const renderMessageContent = (message: Message) => {
    try {
      if (typeof message.content === 'string') {
        const parsedContent = JSON.parse(message.content);
        if (Array.isArray(parsedContent.content)) {
          return (
            <div className="space-y-2">
              {parsedContent.content.map((item: any, index: number) => {
                if (item.type === 'image_url') {
                  return (
                    <img
                      key={index}
                      src={item.image_url.url}
                      alt="Uploaded content"
                      className="max-w-xs rounded-lg mb-2"
                    />
                  );
                }
                if (item.type === 'text') {
                  return <p key={index} className="mt-2">{item.text}</p>;
                }
                return null;
              })}
            </div>
          );
        }
      }

      if (message.fileType && message.fileName) {
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <FileText size={20} />
              <span>{message.fileName}</span>
            </div>
            <p>{message.content}</p>
          </div>
        );
      }

      return <p>{message.content}</p>;
    } catch (error) {
      return <p>{message.content}</p>;
    }
  };

  return (
    <div className="flex-grow overflow-y-auto p-4 space-y-4 mb-16">
      {messages.map((message, index) => (
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
            {renderMessageContent(message)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;