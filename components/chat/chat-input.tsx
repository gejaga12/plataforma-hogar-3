'use client';

import { useState, useRef } from 'react';
import { Smile, Paperclip, Send, Image, File, X } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (content: string, attachments?: any[]) => void;
}

export function ChatInput({ onSendMessage }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<{ id: string; name: string; type: string; size: number }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (message.trim() || attachments.length > 0) {
      onSendMessage(message, attachments);
      setMessage('');
      setAttachments([]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newAttachments = Array.from(e.target.files).map(file => ({
        id: Math.random().toString(36).substring(2, 11),
        name: file.name,
        type: file.type,
        size: file.size
      }));
      
      setAttachments(prev => [...prev, ...newAttachments]);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(attachment => attachment.id !== id));
  };

  // Function to highlight app links like #ORD-1234 as the user types
  const highlightLinks = (text: string) => {
    const patterns = [
      { regex: /#(ORD-\d+)/g, className: 'text-blue-600 dark:text-blue-400' },
      { regex: /#(EQ-\d+)/g, className: 'text-green-600 dark:text-green-400' },
      { regex: /#(RUT-\d+)/g, className: 'text-purple-600 dark:text-purple-400' }
    ];

    let formattedText = text;
    let lastIndex = 0;
    const parts: JSX.Element[] = [];

    patterns.forEach(({ regex, className }) => {
      const matches = Array.from(text.matchAll(regex));
      
      if (matches.length > 0) {
        matches.forEach((match) => {
          const matchIndex = match.index as number;
          
          // Add text before the match
          if (matchIndex > lastIndex) {
            parts.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex, matchIndex)}</span>);
          }
          
          // Add the highlighted match
          parts.push(
            <span key={`match-${matchIndex}`} className={className}>
              {match[0]}
            </span>
          );
          
          lastIndex = matchIndex + match[0].length;
        });
        
        // Add any remaining text
        if (lastIndex < text.length) {
          parts.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex)}</span>);
        }
        
        formattedText = '';
      }
    });

    return parts.length > 0 ? <>{parts}</> : formattedText;
  };

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((attachment) => (
            <div 
              key={attachment.id} 
              className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-1.5"
            >
              {attachment.type.includes('image') ? (
                <Image size={14} className="text-blue-500 mr-2" />
              ) : (
                <File size={14} className="text-orange-500 mr-2" />
              )}
              <span className="text-xs text-gray-700 dark:text-gray-300 truncate max-w-[120px]">
                {attachment.name}
              </span>
              <button 
                onClick={() => removeAttachment(attachment.id)}
                className="ml-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end space-x-2">
        <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje..."
            className="w-full bg-transparent border-0 focus:ring-0 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-none min-h-[40px] max-h-32 py-2 px-2"
            rows={1}
          />
          
          {/* Preview of message with highlighted links */}
          {message.includes('#') && (
            <div className="px-2 py-1 text-sm text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-600">
              {highlightLinks(message)}
            </div>
          )}
          
          <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
            <div className="flex space-x-1">
              <button className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors">
                <Smile size={18} />
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
              >
                <Paperclip size={18} />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  multiple
                />
              </button>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Presiona Enter para enviar
            </div>
          </div>
        </div>
        
        <button
          onClick={handleSendMessage}
          disabled={!message.trim() && attachments.length === 0}
          className="p-3 bg-orange-600 hover:bg-orange-700 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}