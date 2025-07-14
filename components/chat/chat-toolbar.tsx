'use client';

import { Phone, Video, User, MoreHorizontal, Circle } from 'lucide-react';
import { Conversation } from './chat-sidebar';

interface ChatToolbarProps {
  conversation: Conversation;
  onViewProfile: () => void;
}

export function ChatToolbar({ conversation, onViewProfile }: ChatToolbarProps) {
  return (
    <div className="flex items-center justify-between px-6 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-3">
        <div className="relative">
          {conversation.avatar ? (
            <img
              src={conversation.avatar}
              alt={conversation.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : conversation.isGroup ? (
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {conversation.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </span>
            </div>
          ) : (
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {conversation.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </span>
            </div>
          )}
          {conversation.online && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></span>
          )}
        </div>
        <div>
          <h2 className="text-base font-medium text-gray-900 dark:text-gray-100">
            {conversation.name}
          </h2>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            {conversation.typing ? (
              <span className="text-green-600 dark:text-green-400">Escribiendo...</span>
            ) : conversation.online ? (
              <>
                <Circle className="w-2 h-2 mr-1 text-green-500 fill-current" />
                <span>En línea</span>
              </>
            ) : (
              <span>Última vez: {conversation.time}</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
          <Phone size={20} />
        </button>
        <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
          <Video size={20} />
        </button>
        <button 
          onClick={onViewProfile}
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <User size={20} />
        </button>
        <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </div>
    </div>
  );
}