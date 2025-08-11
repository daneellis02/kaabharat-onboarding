import React from 'react';
import { MessageSender } from '../types';
import type { Message } from '../types';
import BotIcon from './icons/BotIcon';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === MessageSender.USER;

  const bubbleClasses = isUser
    ? 'bg-blue-600 text-white self-end'
    : 'bg-gray-200 text-slate-800 self-start';

  const containerClasses = isUser ? 'justify-end' : 'justify-start';

  return (
    <div className={`flex items-end gap-2 ${containerClasses} w-full`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
            <BotIcon className="w-5 h-5 text-gray-600" />
        </div>
      )}
      <div
        className={`max-w-xs md:max-w-md lg:max-w-2xl rounded-2xl px-1 py-1 whitespace-pre-wrap ${bubbleClasses} flex flex-col`}
      >
        {isUser && message.file && (
            <img src={message.file.url} alt={message.file.name} className="w-full h-auto rounded-t-xl object-cover" />
        )}
        <p className="px-3 py-2">{message.text}</p>
      </div>
    </div>
  );
};

export default MessageBubble;