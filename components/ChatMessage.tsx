import React from 'react';
import type { Message } from '../types';
import { UserIcon, BotIcon, SourceIcon } from './IconComponents';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex items-start space-x-4 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center ring-2 ring-accent/50">
          <BotIcon className="w-6 h-6 text-accent" />
        </div>
      )}
      
      <div 
        className={`max-w-xl p-4 rounded-lg shadow-md ${
          isUser 
            ? 'bg-accent text-primary rounded-br-none' 
            : 'bg-gray-800 text-gray-200 rounded-bl-none'
        }`}
      >
        <div className="prose prose-invert max-w-none text-inherit" dangerouslySetInnerHTML={{ __html: message.text.replace(/\n/g, '<br />') }} />
        
        {message.sources && message.sources.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-700/50">
                <h4 className="text-xs font-semibold text-gray-400 mb-2">Sources:</h4>
                <ul className="space-y-2">
                    {message.sources.map((source, index) => (
                        <li key={index} className="flex items-start space-x-2">
                            <SourceIcon className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-500"/>
                            <a 
                                href={source.uri} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-sm text-accent/80 hover:text-accent hover:underline break-all"
                                title={source.uri}
                            >
                                {source.title}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center ring-2 ring-gray-600">
          <UserIcon className="w-6 h-6 text-gray-400" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;