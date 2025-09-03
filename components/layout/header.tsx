"use client";

import { useState } from "react";
import { Bell, Search, MessageSquare } from "lucide-react";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
  const { user } = useAuth();
  const [unreadMessages, setUnreadMessages] = useState(7);

  if (!user) return null;

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 transition-colors">
      <div className="flex items-center justify-end">
        {/* <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar órdenes, noticias..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
            />
          </div>
        </div> */}
        <div className="flex items-center space-x-4">
          <ThemeToggle />

          <Link
            href="/chat"
            className="relative p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <MessageSquare size={20} />
            {unreadMessages > 0 && (
              <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-orange-600 text-[10px] font-bold text-white">
                {unreadMessages > 9 ? "9+" : unreadMessages}
              </span>
            )}
          </Link>

          <button className="relative p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="flex items-center space-x-3">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.fullName || user.email}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {(user.fullName || user.email).charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {user.fullName || user.email}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user.roles[0]?.name}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
