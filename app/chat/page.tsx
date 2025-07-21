'use client';

import { useState, useEffect } from 'react';
import { ProtectedLayout } from '@/components/layout/protected-layout';
import { ChatSidebar, Conversation } from '@/components/chat/chat-sidebar';
import { ChatToolbar } from '@/components/chat/chat-toolbar';
import { ChatWindow } from '@/components/chat/chat-window';
import { ChatInput } from '@/components/chat/chat-input';
import { Message } from '@/components/chat/message-bubble';
import { UserProfileDrawer } from '@/components/chat/user-profile-drawer';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuth } from '@/context/AuthContext';

// Mock data
const mockConversations: Conversation[] = [
  {
    id: '1',
    name: 'Juan Carlos Pérez',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    lastMessage: 'Necesito ayuda con la orden #ORD-1234',
    time: '10:30',
    unread: 2,
    online: true,
    isGroup: false
  },
  {
    id: '2',
    name: 'María González',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    lastMessage: 'Ya revisé el equipo #EQ-001',
    time: 'Ayer',
    unread: 0,
    online: false,
    isGroup: false
  },
  {
    id: '3',
    name: 'Equipo Técnico',
    lastMessage: 'Carlos: Voy a revisar la rutina #RUT-001',
    time: 'Lun',
    unread: 5,
    online: true,
    isGroup: true,
    members: 8
  },
  {
    id: '4',
    name: 'Soporte IT',
    lastMessage: 'Ana: ¿Alguien puede ayudar con el sistema?',
    time: '23/05',
    unread: 0,
    online: false,
    isGroup: true,
    members: 12
  },
  {
    id: '5',
    name: 'Pedro Martínez',
    lastMessage: 'Gracias por la información',
    time: '20/05',
    unread: 0,
    online: false,
    isGroup: false
  },
  {
    id: '6',
    name: 'Ana López',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    lastMessage: 'Te envié los documentos por email',
    time: '18/05',
    unread: 0,
    online: true,
    typing: true,
    isGroup: false
  }
];

// Mock messages for each conversation
const mockMessages: Record<string, Message[]> = {
  '1': [
    {
      id: '101',
      content: 'Hola, necesito ayuda con la orden #ORD-1234',
      sender: {
        id: 'user-1',
        name: 'Juan Carlos Pérez',
        avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
      },
      timestamp: '2023-05-30T10:30:00',
      isOwn: false
    },
    {
      id: '102',
      content: 'Claro, ¿qué problema tienes con esa orden?',
      sender: {
        id: 'current-user',
        name: 'Yo'
      },
      timestamp: '2023-05-30T10:32:00',
      isOwn: true,
      read: true
    },
    {
      id: '103',
      content: 'No puedo ver los detalles del equipo #EQ-002 asociado',
      sender: {
        id: 'user-1',
        name: 'Juan Carlos Pérez',
        avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
      },
      timestamp: '2023-05-30T10:33:00',
      isOwn: false
    },
    {
      id: '104',
      content: 'Déjame revisar y te aviso. Puede ser un problema de permisos.',
      sender: {
        id: 'current-user',
        name: 'Yo'
      },
      timestamp: '2023-05-30T10:35:00',
      isOwn: true,
      read: true
    },
    {
      id: '105',
      content: 'Te comparto la captura de pantalla del error',
      sender: {
        id: 'user-1',
        name: 'Juan Carlos Pérez',
        avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
      },
      timestamp: '2023-05-30T10:36:00',
      isOwn: false,
      attachments: [
        {
          id: 'att-1',
          name: 'error-screenshot.png',
          type: 'image/png',
          size: 1240000,
          url: '#'
        }
      ]
    },
    {
      id: '106',
      content: 'Gracias, ya lo veo. Voy a asignar este caso al equipo de soporte técnico.',
      sender: {
        id: 'current-user',
        name: 'Yo'
      },
      timestamp: '2023-05-30T10:40:00',
      isOwn: true
    }
  ],
  '2': [
    {
      id: '201',
      content: 'Hola, ya revisé el equipo #EQ-001 y está funcionando correctamente',
      sender: {
        id: 'user-2',
        name: 'María González',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
      },
      timestamp: '2023-05-29T14:15:00',
      isOwn: false
    },
    {
      id: '202',
      content: 'Excelente María, ¿completaste el formulario de mantenimiento?',
      sender: {
        id: 'current-user',
        name: 'Yo'
      },
      timestamp: '2023-05-29T14:20:00',
      isOwn: true,
      read: true
    },
    {
      id: '203',
      content: 'Sí, aquí está el informe completo',
      sender: {
        id: 'user-2',
        name: 'María González',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
      },
      timestamp: '2023-05-29T14:25:00',
      isOwn: false,
      attachments: [
        {
          id: 'att-2',
          name: 'informe-mantenimiento-EQ001.pdf',
          type: 'application/pdf',
          size: 2450000,
          url: '#'
        }
      ]
    }
  ],
  '3': [
    {
      id: '301',
      content: 'Buenos días equipo, hoy tenemos que revisar varias órdenes pendientes',
      sender: {
        id: 'user-admin',
        name: 'Gerardo (Admin)'
      },
      timestamp: '2023-05-29T09:00:00',
      isOwn: true,
      read: true
    },
    {
      id: '302',
      content: 'Yo me encargo de las órdenes de la zona norte',
      sender: {
        id: 'user-1',
        name: 'Juan Carlos Pérez',
        avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
      },
      timestamp: '2023-05-29T09:05:00',
      isOwn: false
    },
    {
      id: '303',
      content: 'Yo revisaré la rutina #RUT-001 que está pendiente desde ayer',
      sender: {
        id: 'user-3',
        name: 'Carlos Rodríguez'
      },
      timestamp: '2023-05-29T09:10:00',
      isOwn: false
    }
  ]
};

// Generate more messages for conversation 1
for (let i = 107; i <= 120; i++) {
  const isOwn = i % 2 === 0;
  mockMessages['1'].push({
    id: `${i}`,
    content: `Mensaje de prueba ${i - 106}`,
    sender: isOwn 
      ? { id: 'current-user', name: 'Yo' }
      : { 
          id: 'user-1', 
          name: 'Juan Carlos Pérez',
          avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
        },
    timestamp: new Date(Date.now() - (120 - i) * 60000).toISOString(),
    isOwn,
    read: isOwn
  });
}

export default function ChatPage() {
  const { user } = useAuth();
  const [activeConversationId, setActiveConversationId] = useState<string>('1');
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [loading, setLoading] = useState(true);

  // Get active conversation
  const activeConversation = conversations.find(c => c.id === activeConversationId) || conversations[0];

  // Load messages for active conversation
  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setMessages(mockMessages[activeConversationId] || []);
      setLoading(false);
      
      // Mark conversation as read
      if (activeConversation?.unread) {
        setConversations(prev => 
          prev.map(conv => 
            conv.id === activeConversationId 
              ? { ...conv, unread: 0 } 
              : conv
          )
        );
      }
    }, 500);
  }, [activeConversationId]);

  // Handle sending a new message
  const handleSendMessage = (content: string, attachments?: any[]) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content,
      sender: {
        id: 'current-user',
        name: 'Yo'
      },
      timestamp: new Date().toISOString(),
      isOwn: true,
      attachments: attachments?.map(att => ({
        ...att,
        url: '#'
      }))
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Update last message in conversation list
    setConversations(prev => 
      prev.map(conv => 
        conv.id === activeConversationId 
          ? { 
              ...conv, 
              lastMessage: content || 'Archivo adjunto', 
              time: 'Ahora',
              typing: false
            } 
          : conv
      )
    );

    // Simulate reply for demo purposes
    if (!activeConversation.isGroup) {
      // Show typing indicator
      setTimeout(() => {
        setConversations(prev => 
          prev.map(conv => 
            conv.id === activeConversationId 
              ? { ...conv, typing: true } 
              : conv
          )
        );
        setIsTyping(true);
      }, 1000);

      // Send reply
      setTimeout(() => {
        const replyMessage: Message = {
          id: `msg-${Date.now() + 1}`,
          content: `Respuesta automática a: ${content.substring(0, 20)}${content.length > 20 ? '...' : ''}`,
          sender: {
            id: activeConversation.id,
            name: activeConversation.name,
            avatar: activeConversation.avatar
          },
          timestamp: new Date().toISOString(),
          isOwn: false
        };
        
        setMessages(prev => [...prev, replyMessage]);
        setIsTyping(false);
        
        // Update conversation
        setConversations(prev => 
          prev.map(conv => 
            conv.id === activeConversationId 
              ? { 
                  ...conv, 
                  lastMessage: replyMessage.content, 
                  time: 'Ahora',
                  typing: false
                } 
              : conv
          )
        );
      }, 3000);
    }
  };

  return (
    <ProtectedLayout>
      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <div className="w-80 border-r border-gray-200 dark:border-gray-700 hidden md:block">
          <ChatSidebar
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={setActiveConversationId}
          />
        </div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col">
          {activeConversation ? (
            <>
              <ChatToolbar 
                conversation={activeConversation} 
                onViewProfile={() => setShowProfileDrawer(true)} 
              />
              
              {loading ? (
                <div className="flex-1 flex items-center justify-center">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <ChatWindow 
                  messages={messages} 
                  isTyping={isTyping}
                  typingUser={activeConversation.name}
                />
              )}
              
              <ChatInput onSendMessage={handleSendMessage} />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Selecciona una conversación
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Elige un chat de la lista para comenzar a conversar
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Profile drawer */}
        {activeConversation && (
          <UserProfileDrawer
            isOpen={showProfileDrawer}
            onClose={() => setShowProfileDrawer(false)}
            conversation={activeConversation}
          />
        )}
      </div>
    </ProtectedLayout>
  );
}