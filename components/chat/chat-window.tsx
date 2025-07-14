'use client';

import { useEffect, useRef } from 'react';
import { Message, MessageBubble } from './message-bubble';

interface ChatWindowProps {
  messages: Message[];
  isTyping?: boolean;
  typingUser?: string;
}

export function ChatWindow({ messages, isTyping, typingUser }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Group messages by date
  const groupedMessages: { [key: string]: Message[] } = {};
  messages.forEach(message => {
    const date = new Date(message.timestamp).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
    
    if (!groupedMessages[date]) {
      groupedMessages[date] = [];
    }
    
    groupedMessages[date].push(message);
  });

  // Group consecutive messages from the same sender
  const getMessageGroups = (messages: Message[]) => {
    const groups: Message[][] = [];
    let currentGroup: Message[] = [];
    
    messages.forEach((message, index) => {
      if (index === 0) {
        currentGroup.push(message);
      } else {
        const prevMessage = messages[index - 1];
        const isSameSender = prevMessage.sender.id === message.sender.id;
        const isCloseInTime = new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime() < 5 * 60 * 1000; // 5 minutes
        
        if (isSameSender && isCloseInTime) {
          currentGroup.push(message);
        } else {
          groups.push([...currentGroup]);
          currentGroup = [message];
        }
      }
    });
    
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }
    
    return groups;
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-800">
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <div key={date} className="mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="h-px bg-gray-300 dark:bg-gray-600 flex-1"></div>
            <span className="px-4 text-xs font-medium text-gray-500 dark:text-gray-400">{date}</span>
            <div className="h-px bg-gray-300 dark:bg-gray-600 flex-1"></div>
          </div>

          {getMessageGroups(dateMessages).map((group, groupIndex) => (
            <div key={groupIndex} className="mb-4">
              {group.map((message, messageIndex) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  showAvatar={messageIndex === 0}
                  isLastInGroup={messageIndex === group.length - 1}
                />
              ))}
            </div>
          ))}
        </div>
      ))}

      {isTyping && (
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-white">
              {typingUser?.split(' ').map(n => n[0]).join('').toUpperCase()}
            </span>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}