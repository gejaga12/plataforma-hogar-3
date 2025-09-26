"use client";

import { useState } from "react";
import {
  Bell,
  Search,
  MessageSquare,
  Globe2,
  Globe,
  Globe2Icon,
  Locate,
  Earth,
  LocateOff,
} from "lucide-react";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useGeoPermission } from "@/hooks/useGeoPermission";
import toast from "react-hot-toast";

export function Header() {
  const { user } = useAuth();
  const { status, busy, lastPosition, request } = useGeoPermission();

  const [unreadMessages, setUnreadMessages] = useState(7);

  if (!user) return null;

  const handleGeoClick = async () => {
    if (status === "unsupported") {
      toast.error("Tu navegador no soporta geolocalización.");
      return;
    }
    if (status === "denied") {
      toast(
        (t) => (
          <div>
            <div className="font-medium">Permiso de ubicación denegado</div>
            <div className="text-sm opacity-80">
              Habilitalo desde la configuración del navegador para continuar.
            </div>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="mt-2 px-3 py-1.5 bg-gray-900 text-white rounded"
            >
              Entendido
            </button>
          </div>
        ),
        { duration: 6000 }
      );
      return;
    }
    // prompt o granted → pedimos/actualizamos
    const pos = await request();
    if (pos) {
      toast.success("Ubicación lista.");
    } else {
      toast.error("No se pudo obtener la ubicación.");
    }
  };

  const isGranted = status === "granted";

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 transition-colors">
      <div className="flex items-center justify-end">
        <div className="flex items-center space-x-4">
          <ThemeToggle />

          {/* Estado de geolocalización */}
          <button
            onClick={handleGeoClick}
            disabled={busy}
            title={
              isGranted
                ? lastPosition
                  ? `Ubicación activa: ${lastPosition.lat.toFixed(
                      5
                    )}, ${lastPosition.lng.toFixed(5)}`
                  : "Ubicación activa"
                : status === "denied"
                ? "Ubicación bloqueada (abrí la configuración del navegador)"
                : "Permitir ubicación"
            }
            className={`p-2 transition-colors rounded ${
              isGranted
                ? "text-rose-600 hover:text-rose-700"
                : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            }`}
          >
            {isGranted ? <Locate size={20} /> : <LocateOff size={20} />}
          </button>

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
