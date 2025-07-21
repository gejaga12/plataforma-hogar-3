"use client";

import { useState } from "react";
import {
  Trash2,
  Database,
  RefreshCw,
  Shield,
  Bell,
  User,
  Smartphone,
  Globe,
  AlertTriangle,
} from "lucide-react";
import { ProtectedLayout } from "@/components/layout/protected-layout";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/hooks/useAuth";

function SettingsContent() {
  const [loading, setLoading] = useState(false);
  const [showClearCacheModal, setShowClearCacheModal] = useState(false);
  const { user } = useAuth();

  const handleClearCache = async () => {
    setLoading(true);
    try {
      // Clear IndexedDB cache
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }

      // Clear localStorage (preserve auth data)
      const authData = localStorage.getItem("auth-token");
      localStorage.clear();
      if (authData) {
        localStorage.setItem("auth-token", authData);
      }

      // Clear sessionStorage
      sessionStorage.clear();

      // Reload page to reflect changes
      window.location.reload();
    } catch (error) {
      console.error("Error clearing cache:", error);
    } finally {
      setLoading(false);
      setShowClearCacheModal(false);
    }
  };

  const handleDataExport = () => {
    // Implementation for data export
    console.log("Exporting user data...");
  };

  const handleNotificationTest = () => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification("HogarApp", {
          body: "Las notificaciones están funcionando correctamente.",
          icon: "/favicon.ico",
        });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification("HogarApp", {
              body: "Las notificaciones han sido habilitadas.",
              icon: "/favicon.ico",
            });
          }
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Configuración
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Gestiona las preferencias y configuraciones de tu cuenta
        </p>
      </div>

      {/* Profile Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <User className="text-orange-500" size={20} />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Perfil de Usuario
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || user.email}
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-xl font-medium text-white">
                  {(user?.displayName || user?.email || "")
                    .charAt(0)
                    .toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {user?.displayName || user?.email}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {user?.email}
              </p>
              <p className="text-sm text-orange-600 dark:text-orange-400">
                {user?.role}
              </p>
            </div>
          </div>

          <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors">
            Editar Perfil
          </button>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Bell className="text-orange-500" size={20} />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Notificaciones
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Notificaciones Push
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Recibir notificaciones en tiempo real
              </p>
            </div>
            <button
              onClick={handleNotificationTest}
              className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 px-3 py-1 rounded text-sm transition-colors"
            >
              Probar
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Nuevas Órdenes
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Notificar cuando se asignen nuevas órdenes
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="rounded border-gray-300 dark:border-gray-600 text-orange-600 focus:ring-orange-500 dark:bg-gray-700"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Noticias y Anuncios
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Recibir notificaciones de nuevas noticias
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="rounded border-gray-300 dark:border-gray-600 text-orange-600 focus:ring-orange-500 dark:bg-gray-700"
            />
          </div>
        </div>
      </div>

      {/* App Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Smartphone className="text-orange-500" size={20} />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Configuración de la App
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Modo Offline
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Sincronizar datos para uso sin conexión
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="rounded border-gray-300 dark:border-gray-600 text-orange-600 focus:ring-orange-500 dark:bg-gray-700"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Geolocalización
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Permitir acceso a ubicación para órdenes
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="rounded border-gray-300 dark:border-gray-600 text-orange-600 focus:ring-orange-500 dark:bg-gray-700"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Cámara y Galería
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Permitir acceso para adjuntar fotos
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="rounded border-gray-300 dark:border-gray-600 text-orange-600 focus:ring-orange-500 dark:bg-gray-700"
            />
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Database className="text-orange-500" size={20} />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Gestión de Datos
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <RefreshCw
                className="text-gray-600 dark:text-gray-400"
                size={20}
              />
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Limpiar Caché
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Eliminar datos temporales almacenados
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowClearCacheModal(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Limpiar
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <Globe className="text-gray-600 dark:text-gray-400" size={20} />
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Exportar Datos
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Descargar una copia de tus datos
                </p>
              </div>
            </div>
            <button
              onClick={handleDataExport}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Shield className="text-orange-500" size={20} />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Seguridad
          </h2>
        </div>

        <div className="space-y-4">
          <button className="w-full text-left p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Cambiar Contraseña
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Actualizar tu contraseña de acceso
            </p>
          </button>

          <button className="w-full text-left p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Sesiones Activas
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Revisar y cerrar sesiones en otros dispositivos
            </p>
          </button>
        </div>
      </div>

      {/* Clear Cache Modal */}
      {showClearCacheModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle className="text-orange-500" size={24} />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Confirmar Limpieza de Caché
              </h3>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Esto eliminará todos los datos temporales almacenados en tu
              navegador. La aplicación se reiniciará para aplicar los cambios.
            </p>

            <div className="flex space-x-4">
              <button
                onClick={() => setShowClearCacheModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={handleClearCache}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? <LoadingSpinner size="sm" /> : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedLayout>
      <SettingsContent />
    </ProtectedLayout>
  );
}
