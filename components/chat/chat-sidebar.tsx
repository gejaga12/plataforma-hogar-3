'use client';

import { useState } from 'react';
import { Search, Plus, Users, User, Settings, Hash, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  isGroup: boolean;
  typing?: boolean;
  members?: number;
}

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
}

export function ChatSidebar({ 
  conversations, 
  activeConversationId, 
  onSelectConversation 
}: ChatSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'direct' | 'groups'>('direct');

  const filteredConversations = conversations.filter(conversation => {
    const matchesSearch = conversation.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'direct' ? !conversation.isGroup : conversation.isGroup;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      {/* Search */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Buscar conversaciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('direct')}
          className={cn(
            "flex-1 py-3 text-sm font-medium transition-colors",
            activeTab === 'direct'
              ? "text-orange-600 dark:text-orange-400 border-b-2 border-orange-500 dark:border-orange-400"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          )}
        >
          <div className="flex items-center justify-center space-x-2">
            <User size={16} />
            <span>Directos</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          className={cn(
            "flex-1 py-3 text-sm font-medium transition-colors",
            activeTab === 'groups'
              ? "text-orange-600 dark:text-orange-400 border-b-2 border-orange-500 dark:border-orange-400"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          )}
        >
          <div className="flex items-center justify-center space-x-2">
            <Users size={16} />
            <span>Grupos</span>
          </div>
        </button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={cn(
                  "p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors",
                  activeConversationId === conversation.id && "bg-orange-50 dark:bg-orange-900/20"
                )}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative flex-shrink-0">
                    {conversation.avatar ? (
                      <img
                        src={conversation.avatar}
                        alt={conversation.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : conversation.isGroup ? (
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <Users className="text-white" size={18} />
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
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {conversation.name}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {conversation.time}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {conversation.typing ? (
                          <span className="text-green-600 dark:text-green-400">Escribiendo...</span>
                        ) : (
                          conversation.lastMessage
                        )}
                      </p>
                      {conversation.unread > 0 && (
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-orange-600 rounded-full">
                          {conversation.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {conversation.isGroup && (
                  <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Users size={12} className="mr-1" />
                    <span>{conversation.members} miembros</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              {activeTab === 'direct' ? (
                <User className="text-gray-400 dark:text-gray-500" size={24} />
              ) : (
                <Users className="text-gray-400 dark:text-gray-500" size={24} />
              )}
            </div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              No hay conversaciones
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm
                ? `No se encontraron resultados para "${searchTerm}"`
                : activeTab === 'direct'
                ? 'No tienes conversaciones directas'
                : 'No estás en ningún grupo'}
            </p>
            <button className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-sm">
              <Plus size={16} />
              <span>{activeTab === 'direct' ? 'Nuevo mensaje' : 'Crear grupo'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors">
          <Plus size={16} />
          <span>{activeTab === 'direct' ? 'Nuevo mensaje' : 'Crear grupo'}</span>
        </button>
      </div>
    </div>
  );
}