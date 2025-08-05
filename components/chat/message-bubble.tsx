'use client';

import { useState } from 'react';
import { File, Download, ExternalLink, MoreVertical, Copy, Reply, Trash2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
  isOwn: boolean;
  attachments?: {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
  }[];
  read?: boolean;
}

interface MessageBubbleProps {
  message: Message;
  showAvatar?: boolean;
  isLastInGroup?: boolean;
}

export function MessageBubble({ message, showAvatar = true, isLastInGroup = true }: MessageBubbleProps) {
  const [showMenu, setShowMenu] = useState(false);

  // Function to detect and format app links like #ORD-1234
  const formatMessageContent = (content: string) => {
    const patterns = [
      { regex: /#(ORD-\d+)/g, className: 'text-blue-600 dark:text-blue-400 hover:underline', prefix: 'orders' },
      { regex: /#(EQ-\d+)/g, className: 'text-green-600 dark:text-green-400 hover:underline', prefix: 'equipos' },
      { regex: /#(RUT-\d+)/g, className: 'text-purple-600 dark:text-purple-400 hover:underline', prefix: 'rutinas' }
    ];

    let formattedContent = content;

    patterns.forEach(({ regex, className, prefix }) => {
      formattedContent = formattedContent.replace(regex, (match, id) => {
        return `<a href="/${prefix}/${id}" class="${className}">${match}</a>`;
      });
    });

    return <div dangerouslySetInnerHTML={{ __html: formattedContent }} />;
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return '🖼️';
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('excel') || type.includes('sheet')) return '📊';
    if (type.includes('zip') || type.includes('compressed')) return '🗜️';
    return '📎';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={cn(
      "flex w-full mb-1",
      message.isOwn ? "justify-end" : "justify-start",
      isLastInGroup && "mb-4"
    )}>
      {!message.isOwn && showAvatar && (
        <div className="flex-shrink-0 mr-3 mt-1">
          {message.sender.avatar ? (
            <img
              src={message.sender.avatar}
              alt={message.sender.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-white">
                {message.sender.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </span>
            </div>
          )}
        </div>
      )}

      {!message.isOwn && !showAvatar && (
        <div className="w-8 mr-3"></div>
      )}

      <div className={cn(
        "max-w-[75%] relative group",
        message.isOwn ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "px-4 py-2 rounded-lg shadow-sm",
          message.isOwn 
            ? "bg-orange-500 text-white rounded-br-none" 
            : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none"
        )}>
          {!message.isOwn && !showAvatar && (
            <div className="text-xs font-medium mb-1 text-gray-500 dark:text-gray-400">
              {message.sender.name}
            </div>
          )}

          <div className="text-sm">
            {formatMessageContent(message.content)}
          </div>

          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.attachments.map((attachment) => (
                <div 
                  key={attachment.id}
                  className={cn(
                    "flex items-center p-2 rounded",
                    message.isOwn 
                      ? "bg-orange-400 text-white" 
                      : "bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                  )}
                >
                  <div className="mr-2 text-lg">{getFileIcon(attachment.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{attachment.name}</div>
                    <div className="text-xs opacity-80">{formatFileSize(attachment.size)}</div>
                  </div>
                  <a 
                    href={attachment.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={cn(
                      "p-1 rounded-full",
                      message.isOwn 
                        ? "hover:bg-orange-600" 
                        : "hover:bg-gray-300 dark:hover:bg-gray-500"
                    )}
                  >
                    <Download size={16} />
                  </a>
                </div>
              ))}
            </div>
          )}

          <div className={cn(
            "text-xs mt-1 flex items-center justify-end space-x-1",
            message.isOwn ? "text-orange-100" : "text-gray-500 dark:text-gray-400"
          )}>
            <span>{formatTime(message.timestamp)}</span>
            {message.isOwn && message.read && (
              <span>✓✓</span>
            )}
          </div>
        </div>

        <div className={cn(
          "absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity",
          message.isOwn ? "left-0 -translate-x-full" : "right-0 translate-x-full"
        )}>
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 bg-white dark:bg-gray-800 rounded-full shadow-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <MoreVertical size={16} />
          </button>

          {showMenu && (
            <div className="absolute top-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 w-36 z-10">
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                <Reply size={14} className="mr-2" />
                <span>Responder</span>
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                <Copy size={14} className="mr-2" />
                <span>Copiar</span>
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                <Trash2 size={14} className="mr-2" />
                <span>Eliminar</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}