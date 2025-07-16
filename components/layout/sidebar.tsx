"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ClipboardList,
  Newspaper,
  Settings,
  Users,
  BarChart3,
  Menu,
  X,
  LogOut,
  Calendar,
  AlertTriangle,
  FileText,
  Zap,
  ShoppingCart,
  Bug,
  Info,
  FolderOpen,
  Trophy,
  Trash2,
  UserCheck,
  Clock,
  UserPlus,
  MapPin,
  Building,
  Globe,
  Map,
  UserCog,
  Building2,
  Wrench,
  FileCheck,
  Layers,
  Type,
  ChevronDown,
  ChevronRight,
  Shield,
  Sigma as Sitemap,
  Cog,
  MessageSquare,
  Bell,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { UserRole, MenuItem } from "@/utils/types";
import { cn } from "@/lib/utils";

const menuItems: MenuItem[] = [
  // Operaciones Principales
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "Home",
    href: "/dashboard",
    roles: ["TÉCNICO", "SUPERVISOR", "ADMIN"],
  },
  {
    id: "agenda",
    label: "Agenda de Trabajo",
    icon: "Calendar",
    href: "/agenda",
    roles: ["TÉCNICO", "SUPERVISOR", "ADMIN"],
  },
  {
    id: "incidencias",
    label: "Incidencias",
    icon: "AlertTriangle",
    href: "/incidencias",
    roles: ["TÉCNICO", "SUPERVISOR", "ADMIN"],
    badge: "3",
  },
  {
    id: "orders",
    label: "Órdenes de Trabajo",
    icon: "ClipboardList",
    href: "/orders",
    roles: ["TÉCNICO", "SUPERVISOR", "ADMIN"],
  },
  {
    id: "equipos",
    label: "Gestión de Equipos",
    icon: "Cog",
    href: "/equipos",
    roles: ["TÉCNICO", "SUPERVISOR", "ADMIN"],
  },
  {
    id: "panoramica",
    label: "Mapa Panorámico",
    icon: "MapPin",
    href: "/panoramica",
    roles: ["TÉCNICO", "SUPERVISOR", "ADMIN"],
    isNew: true,
  },
  {
    id: "solicitudes",
    label: "Solicitudes",
    icon: "FileText",
    href: "/solicitudes",
    roles: ["TÉCNICO", "SUPERVISOR", "ADMIN"],
  },
  {
    id: "formularios-express",
    label: "Formularios Express",
    icon: "Zap",
    href: "/formularios-express",
    roles: ["TÉCNICO", "SUPERVISOR", "ADMIN"],
  },
  {
    id: "compra-materiales",
    label: "Compra de Materiales",
    icon: "ShoppingCart",
    href: "/compra-materiales",
    roles: ["TÉCNICO", "SUPERVISOR", "ADMIN"],
  },
  {
    id: "reportes-errores",
    label: "Reportes de Errores",
    icon: "Bug",
    href: "/reportes-errores",
    roles: ["TÉCNICO", "SUPERVISOR", "ADMIN"],
  },
  {
    id: "news",
    label: "Información",
    icon: "Info",
    href: "/news",
    roles: ["TÉCNICO", "SUPERVISOR", "ADMIN"],
  },
  {
    id: "documentos",
    label: "Documentos",
    icon: "FolderOpen",
    href: "/documentos",
    roles: ["TÉCNICO", "SUPERVISOR", "ADMIN"],
  },
  {
    id: "ranking-tecnicos",
    label: "Ranking de Técnicos",
    icon: "Trophy",
    href: "/ranking-tecnicos",
    roles: ["SUPERVISOR", "ADMIN"],
  },
  {
    id: "papelera",
    label: "Papelera",
    icon: "Trash2",
    href: "/papelera",
    roles: ["SUPERVISOR", "ADMIN"],
  },
  {
    id: "chat",
    label: "Chat",
    icon: "MessageSquare",
    href: "/chat",
    roles: ["TÉCNICO", "SUPERVISOR", "ADMIN"],
    badge: "7",
    isNew: true,
  },
  {
    id: "novedades",
    label: "Novedades",
    icon: "Bell",
    href: "/novedades",
    roles: ["ADMIN", "SUPERVISOR"],
    isNew: true,
  },

  // Gestión de Personal
  {
    id: "users",
    label: "Usuarios",
    icon: "Users",
    href: "/users",
    roles: ["SUPERVISOR", "ADMIN"],
  },
  {
    id: "roles",
    label: "Roles",
    icon: "Shield",
    href: "/roles",
    roles: ["ADMIN"],
  },
  {
    id: "organigrama",
    label: "Organigrama Empresarial",
    icon: "Sitemap",
    href: "/organigrama",
    roles: ["SUPERVISOR", "ADMIN"],
  },
  {
    id: "tecnicos",
    label: "Técnicos",
    icon: "UserCheck",
    href: "/tecnicos",
    roles: ["SUPERVISOR", "ADMIN"],
  },
  {
    id: "ingreso-egreso",
    label: "Ingreso-Egreso",
    icon: "Clock",
    href: "/ingreso-egreso",
    roles: ["SUPERVISOR", "ADMIN"],
  },
  {
    id: "horas-extras",
    label: "Horas Extras",
    icon: "UserPlus",
    href: "/horas-extras",
    roles: ["SUPERVISOR", "ADMIN"],
  },
  {
    id: "ingresos",
    label: "Procesos de Ingreso",
    icon: "UserPlus",
    href: "/ingresos",
    roles: ["SUPERVISOR", "ADMIN"],
    isNew: true,
  },

  // Gestión de Clientes y Ubicaciones
  {
    id: "clientes",
    label: "Clientes",
    icon: "Building",
    href: "/clientes",
    roles: ["SUPERVISOR", "ADMIN"],
  },
  {
    id: "depositos",
    label: "Depósitos",
    icon: "Warehouse",
    href: "/depositos",
    roles: ["SUPERVISOR", "ADMIN"],
    isNew: true,
  },
  {
    id: "grupos",
    label: "Grupos",
    icon: "Users",
    href: "/grupos",
    roles: ["SUPERVISOR", "ADMIN"],
  },
  {
    id: "servicios",
    label: "Servicios",
    icon: "Wrench",
    href: "/servicios",
    roles: ["SUPERVISOR", "ADMIN"],
  },
  {
    id: "sucursales",
    label: "Sucursales",
    icon: "Building2",
    href: "/sucursales",
    roles: ["SUPERVISOR", "ADMIN"],
  },
  {
    id: "paises",
    label: "Países",
    icon: "Globe",
    href: "/paises",
    roles: ["ADMIN"],
  },
  {
    id: "provincias",
    label: "Provincias",
    icon: "Map",
    href: "/provincias",
    roles: ["ADMIN"],
  },
  {
    id: "ciudades",
    label: "Ciudades",
    icon: "MapPin",
    href: "/ciudades",
    roles: ["ADMIN"],
  },
  {
    id: "facility",
    label: "Facility",
    icon: "UserCog",
    href: "/facility",
    roles: ["SUPERVISOR", "ADMIN"],
  },

  // Configuración y Datos
  {
    id: "datos-usuario",
    label: "Datos de Usuario",
    icon: "UserCog",
    href: "/datos-usuario",
    roles: ["TÉCNICO", "SUPERVISOR", "ADMIN"],
  },
  {
    id: "datos-sucursal",
    label: "Datos de Sucursal",
    icon: "Building2",
    href: "/datos-sucursal",
    roles: ["SUPERVISOR", "ADMIN"],
  },
  {
    id: "opciones-clientes",
    label: "Opciones de Clientes",
    icon: "Settings",
    href: "/opciones-clientes",
    roles: ["SUPERVISOR", "ADMIN"],
  },

  // Formularios y Campos
  {
    id: "formularios",
    label: "Formularios",
    icon: "FileCheck",
    href: "/formularios",
    roles: ["SUPERVISOR", "ADMIN"],
  },
  {
    id: "modulos",
    label: "Módulos",
    icon: "Layers",
    href: "/modulos",
    roles: ["SUPERVISOR", "ADMIN"],
  },
  {
    id: "campos",
    label: "Campos",
    icon: "Type",
    href: "/campos",
    roles: ["SUPERVISOR", "ADMIN"],
  },

  // Reportes y Configuración
  {
    id: "reports",
    label: "Reportes",
    icon: "BarChart3",
    href: "/reports",
    roles: ["SUPERVISOR", "ADMIN"],
  },
  {
    id: "settings",
    label: "Configuración",
    icon: "Settings",
    href: "/settings",
    roles: ["TÉCNICO", "SUPERVISOR", "ADMIN"],
  },
];

const iconMap = {
  Home,
  ClipboardList,
  Newspaper,
  Users,
  BarChart3,
  Settings,
  Calendar,
  AlertTriangle,
  FileText,
  Zap,
  ShoppingCart,
  Bug,
  Info,
  FolderOpen,
  Trophy,
  Trash2,
  UserCheck,
  Clock,
  UserPlus,
  MapPin,
  Building,
  Globe,
  Map,
  UserCog,
  Building2,
  Wrench,
  FileCheck,
  Layers,
  Type,
  Shield,
  Sitemap,
  Cog,
  MessageSquare,
  Bell,
  Warehouse: Building2, // Using Building2 as a temporary replacement for Warehouse
};

// Organizar menú por categorías
const menuCategories = [
  {
    id: "operations",
    label: "Operaciones",
    items: [
      "dashboard",
      "agenda",
      "incidencias",
      "orders",
      "equipos",
      "panoramica",
      "solicitudes",
      "formularios-express",
      "compra-materiales",
      "reportes-errores",
      "news",
      "documentos",
      "ranking-tecnicos",
      "papelera",
      "chat",
    ],
  },
  {
    id: "personnel",
    label: "Personal",
    items: [
      "users",
      "roles",
      "organigrama",
      "tecnicos",
      "ingreso-egreso",
      "horas-extras",
      "ingresos",
    ],
  },
  {
    id: "clients",
    label: "Clientes y Ubicaciones",
    items: [
      "clientes",
      "depositos",
      "grupos",
      "servicios",
      "sucursales",
      "paises",
      "provincias",
      "ciudades",
      "facility",
    ],
  },
  {
    id: "forms",
    label: "Formularios",
    items: ["formularios", "modulos", "campos"],
  },
  {
    id: "config",
    label: "Configuración",
    items: [
      "datos-usuario",
      "datos-sucursal",
      "opciones-clientes",
      "reports",
      "settings",
      "novedades",
    ],
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    "operations",
  ]);
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const filteredMenuItems = menuItems.filter((item) =>
    user ? item.roles.includes(user.role) : []
  );

  const getItemsByCategory = (categoryItems: string[]) => {
    return categoryItems
      .map((itemId) => filteredMenuItems.find((item) => item.id === itemId))
      .filter(Boolean) as MenuItem[];
  };

  // Find which category contains the current active page
  const findCategoryForPath = (path: string): string | null => {
    for (const category of menuCategories) {
      const items = getItemsByCategory(category.items);
      if (items.some((item) => item.href === path)) {
        return category.id;
      }
    }
    return null;
  };

  // Check if screen is mobile on initial render
  useEffect(() => {
    const checkIfMobile = () => {
      setIsOpen(window.innerWidth >= 1024);
    };

    // Set initial state
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Auto-expand category containing active page on initial load
  useEffect(() => {
    const activeCategory = findCategoryForPath(pathname);
    if (activeCategory && !expandedCategories.includes(activeCategory)) {
      setExpandedCategories((prev) => [...prev, activeCategory]);
    }
  }, [pathname, expandedCategories]);

  if (!user) return null;

  const toggleCategory = (categoryId: string) => {
    // Allow collapsing any category, including the one with active page
    if (expandedCategories.includes(categoryId)) {
      setExpandedCategories((prev) => prev.filter((id) => id !== categoryId));
    } else {
      setExpandedCategories((prev) => [...prev, categoryId]);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-orange-500 text-white rounded-md shadow-lg"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-lg transition-all duration-300 ease-in-out",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "w-64",
          className
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Home className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  HogarApp
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.role}
                </p>
              </div>
            </div>
          </div>

          {/* User info */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || user.email}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {(user.displayName || user.email).charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {user.displayName || user.email}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuCategories.map((category) => {
              const categoryItems = getItemsByCategory(category.items);
              if (categoryItems.length === 0) return null;

              // Check if this category contains the active page
              const hasActivePage = categoryItems.some(
                (item) => item.href === pathname
              );

              // Determine if this category should be expanded
              const isExpanded = expandedCategories.includes(category.id);

              return (
                <div key={category.id} className="space-y-1">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="flex items-center justify-between w-full px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    <span>{category.label}</span>
                    {isExpanded ? (
                      <ChevronDown size={14} />
                    ) : (
                      <ChevronRight size={14} />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="space-y-1 ml-2">
                      {categoryItems.map((item) => {
                        const Icon = iconMap[item.icon as keyof typeof iconMap];
                        const isActive = pathname === item.href;

                        return (
                          <Link
                            key={item.id}
                            href={item.href}
                            onClick={() =>
                              window.innerWidth < 1024 && setIsOpen(false)
                            }
                            className={cn(
                              "flex items-center justify-between rounded-lg text-sm font-medium transition-colors px-3 py-2",
                              isActive
                                ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800"
                                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                            )}
                            title={item.label}
                          >
                            <div className="flex items-center space-x-3">
                              <Icon size={18} />
                              <span>{item.label}</span>
                            </div>
                            {(item.badge || item.isNew) && (
                              <>
                                {item.badge && (
                                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                    {item.badge}
                                  </span>
                                )}
                                {item.isNew && !item.badge && (
                                  <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                                    Nuevo
                                  </span>
                                )}
                              </>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 rounded-lg transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut size={18} />
              <span className="ml-3">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
