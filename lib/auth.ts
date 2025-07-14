'use client';

import { User, UserRole } from './types';

// Mock users for demonstration
const mockUsers = [
  {
    uid: '1',
    email: 'admin@hogarapp.com',
    displayName: 'Administrador',
    photoURL: '',
    role: 'ADMINISTRADOR' as UserRole,
    permissions: ['orders:*', 'news:*', 'users:*', 'reports:*', 'settings:*', 'analytics:view'],
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  },
  {
    uid: '2',
    email: 'supervisor@hogarapp.com',
    displayName: 'Supervisor',
    photoURL: '',
    role: 'SUPERVISOR' as UserRole,
    permissions: ['orders:view', 'orders:create', 'orders:update', 'orders:assign', 'orders:complete', 'news:view', 'news:create', 'reports:view', 'team:view', 'profile:edit'],
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  },
  {
    uid: '3',
    email: 'tecnico@hogarapp.com',
    displayName: 'Técnico',
    photoURL: '',
    role: 'TÉCNICO' as UserRole,
    permissions: ['orders:view', 'orders:update', 'orders:complete', 'news:view', 'profile:edit'],
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  }
];

export class AuthService {
  private static currentUser: User | null = null;
  private static listeners: ((user: User | null) => void)[] = [];

  static async signInWithEmail(email: string, password: string): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = mockUsers.find(u => u.email === email);
    if (!user || password.length < 6) {
      throw new Error('Credenciales inválidas');
    }

    const userData = { ...user, lastLoginAt: new Date().toISOString() };
    this.currentUser = userData;
    
    // Store in localStorage for persistence
    localStorage.setItem('auth-user', JSON.stringify(userData));
    
    // Notify listeners
    this.listeners.forEach(listener => listener(userData));
    
    return userData;
  }

  static async signInWithGoogle(): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For demo, return the admin user
    const userData = { 
      ...mockUsers[0], 
      lastLoginAt: new Date().toISOString(),
      displayName: 'Usuario Google',
      photoURL: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    };
    
    this.currentUser = userData;
    
    // Store in localStorage for persistence
    localStorage.setItem('auth-user', JSON.stringify(userData));
    
    // Notify listeners
    this.listeners.forEach(listener => listener(userData));
    
    return userData;
  }

  static async signOut(): Promise<void> {
    this.currentUser = null;
    localStorage.removeItem('auth-user');
    
    // Notify listeners
    this.listeners.forEach(listener => listener(null));
  }

  static getCurrentUser(): User | null {
    if (this.currentUser) {
      return this.currentUser;
    }

    // Try to restore from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('auth-user');
      if (stored) {
        try {
          this.currentUser = JSON.parse(stored);
          return this.currentUser;
        } catch (error) {
          localStorage.removeItem('auth-user');
        }
      }
    }

    return null;
  }

  static onAuthStateChanged(callback: (user: User | null) => void): () => void {
    // Add listener
    this.listeners.push(callback);
    
    // Immediately call with current user
    const currentUser = this.getCurrentUser();
    callback(currentUser);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  static getDefaultPermissions(role: UserRole): string[] {
    const permissions: Record<UserRole, string[]> = {
      'TÉCNICO': [
        'orders:view',
        'orders:update',
        'orders:complete',
        'news:view',
        'profile:edit'
      ],
      'SUPERVISOR': [
        'orders:view',
        'orders:create',
        'orders:update',
        'orders:assign',
        'orders:complete',
        'news:view',
        'news:create',
        'reports:view',
        'team:view',
        'profile:edit'
      ],
      'ADMINISTRADOR': [
        'orders:*',
        'news:*',
        'users:*',
        'reports:*',
        'settings:*',
        'analytics:view'
      ]
    };

    return permissions[role] || permissions['TÉCNICO'];
  }
}