'use client';

import { X, Mail, Phone, Calendar, MapPin, FileText, Bell, Settings } from 'lucide-react';
import { Conversation } from './chat-sidebar';

interface UserProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation;
}

export function UserProfileDrawer({ isOpen, onClose, conversation }: UserProfileDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-lg z-50 transition-transform transform-gpu">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Perfil</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Profile content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Avatar and name */}
          <div className="flex flex-col items-center mb-6">
            {conversation.avatar ? (
              <img
                src={conversation.avatar}
                alt={conversation.name}
                className="w-24 h-24 rounded-full object-cover mb-3"
              />
            ) : conversation.isGroup ? (
              <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl font-medium text-white">
                  {conversation.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
            ) : (
              <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl font-medium text-white">
                  {conversation.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
            )}
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{conversation.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {conversation.isGroup ? 'Grupo' : 'Técnico'}
            </p>
            {conversation.online && (
              <div className="flex items-center mt-1 text-sm text-green-600 dark:text-green-400">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
                <span>En línea</span>
              </div>
            )}
          </div>

          {/* Contact info */}
          {!conversation.isGroup && (
            <div className="space-y-4 mb-6">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                Información de contacto
              </h4>
              
              <div className="flex items-center space-x-3 text-sm">
                <Mail className="text-gray-400 dark:text-gray-500" size={18} />
                <span className="text-gray-700 dark:text-gray-300">usuario@hogarapp.com</span>
              </div>
              
              <div className="flex items-center space-x-3 text-sm">
                <Phone className="text-gray-400 dark:text-gray-500" size={18} />
                <span className="text-gray-700 dark:text-gray-300">+54 11 1234-5678</span>
              </div>
              
              <div className="flex items-center space-x-3 text-sm">
                <MapPin className="text-gray-400 dark:text-gray-500" size={18} />
                <span className="text-gray-700 dark:text-gray-300">Zona Norte, Buenos Aires</span>
              </div>
              
              <div className="flex items-center space-x-3 text-sm">
                <Calendar className="text-gray-400 dark:text-gray-500" size={18} />
                <span className="text-gray-700 dark:text-gray-300">Ingresó el 15/01/2023</span>
              </div>
            </div>
          )}

          {/* Group info */}
          {conversation.isGroup && (
            <div className="space-y-4 mb-6">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                Información del grupo
              </h4>
              
              <div className="flex items-center space-x-3 text-sm">
                <Calendar className="text-gray-400 dark:text-gray-500" size={18} />
                <span className="text-gray-700 dark:text-gray-300">Creado el 10/03/2023</span>
              </div>
              
              <div className="flex items-center space-x-3 text-sm">
                <FileText className="text-gray-400 dark:text-gray-500" size={18} />
                <span className="text-gray-700 dark:text-gray-300">Grupo de trabajo para proyectos</span>
              </div>
              
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider mt-6">
                Miembros ({conversation.members})
              </h4>
              
              <div className="space-y-3">
                {/* Mock members */}
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-white">
                        {`U${i}`}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Usuario {i}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {i === 1 ? 'Administrador' : 'Miembro'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Options */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider">
              Opciones
            </h4>
            
            <button className="w-full flex items-center space-x-3 p-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Bell className="text-gray-400 dark:text-gray-500" size={18} />
              <span>Silenciar notificaciones</span>
            </button>
            
            <button className="w-full flex items-center space-x-3 p-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Settings className="text-gray-400 dark:text-gray-500" size={18} />
              <span>Configuración de chat</span>
            </button>
            
            <button className="w-full flex items-center space-x-3 p-3 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <X className="text-red-500" size={18} />
              <span>{conversation.isGroup ? 'Abandonar grupo' : 'Bloquear usuario'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}