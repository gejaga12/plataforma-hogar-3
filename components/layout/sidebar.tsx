"use client";

import { useState, useEffect, useRef } from "react";
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
  ChevronLeft,
  Shield,
  Sigma as Sitemap,
  Cog,
  MessageSquare,
  Bell,
  MapPinned,
} from "lucide-react";

import { MenuItem } from "@/utils/types";
import { cn } from "@/utils/cn";
import { useAuth } from "@/hooks/useAuth";

/* ===== tus datos del menú (sin cambios) ===== */
const menuItems: MenuItem[] = [
  // Operaciones Principales
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "Home",
    href: "/dashboard",
    roles: ["TÉCNICO", "Supervisor", "Admin"],
  },
  {
    id: "agenda",
    label: "Agenda de Trabajo",
    icon: "Calendar",
    href: "/agenda",
    roles: ["TÉCNICO", "Supervisor", "Admin"],
  },
  {
    id: "incidencias",
    label: "Incidencias",
    icon: "AlertTriangle",
    href: "/incidencias",
    roles: ["TÉCNICO", "Supervisor", "Admin"],
    badge: "3",
  },
  {
    id: "orders",
    label: "Órdenes de Trabajo",
    icon: "ClipboardList",
    href: "/orders",
    roles: ["TÉCNICO", "Supervisor", "Admin"],
  },
  {
    id: "equipos",
    label: "Gestión de Equipos",
    icon: "Cog",
    href: "/equipos",
    roles: ["TÉCNICO", "Supervisor", "Admin"],
  },
  {
    id: "panoramica",
    label: "Mapa Panorámico",
    icon: "MapPin",
    href: "/panoramica",
    roles: ["TÉCNICO", "Supervisor", "Admin"],
    isNew: true,
  },
  {
    id: "solicitudes",
    label: "Solicitudes",
    icon: "FileText",
    href: "/solicitudes",
    roles: ["TÉCNICO", "Supervisor", "Admin"],
  },
  {
    id: "formularios-express",
    label: "Formularios Express",
    icon: "Zap",
    href: "/formularios-express",
    roles: ["TÉCNICO", "Supervisor", "Admin"],
  },
  {
    id: "compra-materiales",
    label: "Compra de Materiales",
    icon: "ShoppingCart",
    href: "/compra-materiales",
    roles: ["TÉCNICO", "Supervisor", "Admin"],
  },
  {
    id: "reportes-errores",
    label: "Reportes de Errores",
    icon: "Bug",
    href: "/reportes-errores",
    roles: ["TÉCNICO", "Supervisor", "Admin"],
  },
  {
    id: "news",
    label: "Información",
    icon: "Info",
    href: "/news",
    roles: ["TÉCNICO", "Supervisor", "Admin"],
  },
  {
    id: "documentos",
    label: "Documentos",
    icon: "FolderOpen",
    href: "/documentos",
    roles: ["TÉCNICO", "Supervisor", "Admin"],
  },
  {
    id: "ranking-tecnicos",
    label: "Ranking de Técnicos",
    icon: "Trophy",
    href: "/ranking-tecnicos",
    roles: ["Supervisor", "Admin"],
  },
  {
    id: "papelera",
    label: "Papelera",
    icon: "Trash2",
    href: "/papelera",
    roles: ["Supervisor", "Admin"],
  },
  {
    id: "chat",
    label: "Chat",
    icon: "MessageSquare",
    href: "/chat",
    roles: ["TÉCNICO", "Supervisor", "Admin"],
    badge: "7",
    isNew: true,
  },
  {
    id: "novedades",
    label: "Novedades",
    icon: "Bell",
    href: "/novedades",
    roles: ["Admin", "Supervisor"],
    isNew: true,
  },

  // Gestión de Personal
  {
    id: "users",
    label: "Usuarios",
    icon: "Users",
    href: "/users",
    roles: ["Supervisor", "Admin"],
  },
  {
    id: "roles",
    label: "Roles",
    icon: "Shield",
    href: "/roles",
    roles: ["Admin"],
  },
  {
    id: "organigrama",
    label: "Organigrama Empresarial",
    icon: "Sitemap",
    href: "/organigrama",
    roles: ["Supervisor", "Admin"],
  },
  {
    id: "tecnicos",
    label: "Técnicos",
    icon: "UserCheck",
    href: "/tecnicos",
    roles: ["Supervisor", "Admin"],
  },
  {
    id: "ingreso-egreso",
    label: "Ingreso-Egreso",
    icon: "Clock",
    href: "/ingreso-egreso",
    roles: ["Supervisor", "Admin"],
  },
  {
    id: "horas-extras",
    label: "Horas Extras",
    icon: "UserPlus",
    href: "/horas-extras",
    roles: ["Supervisor", "Admin"],
  },
  {
    id: "ingresos",
    label: "Procesos de Ingreso",
    icon: "UserPlus",
    href: "/ingresos",
    roles: ["Supervisor", "Admin"],
    isNew: true,
  },

  // Gestión de Clientes y Ubicaciones
  {
    id: "clientes",
    label: "Clientes",
    icon: "Building",
    href: "/clientes",
    roles: ["Supervisor", "Admin"],
  },

  {
    id: "sucursales-clientes",
    label: "Sucursales clientes",
    icon: "Building2",
    href: "/sucursales-clientes",
    roles: ["Supervisor", "Admin"],
  },
  {
    id: "depositos",
    label: "Depósitos",
    icon: "Warehouse",
    href: "/depositos",
    roles: ["Supervisor", "Admin"],
    isNew: true,
  },
  {
    id: "grupos",
    label: "Grupos",
    icon: "Users",
    href: "/grupos",
    roles: ["Supervisor", "Admin"],
  },
  {
    id: "servicios",
    label: "Servicios",
    icon: "Wrench",
    href: "/servicios",
    roles: ["Supervisor", "Admin"],
  },

  {
    id: "sucursales",
    label: "Sucursales internas",
    icon: "Building2",
    href: "/sucursales",
    roles: ["Supervisor", "Admin"],
  },
  {
    id: "zonas",
    label: "Zonas",
    icon: "MapPinned",
    href: "/zonas",
    roles: ["Admin"],
  },
  {
    id: "paises",
    label: "Países",
    icon: "Globe",
    href: "/paises",
    roles: ["Admin"],
  },
  {
    id: "provincias",
    label: "Provincias",
    icon: "Map",
    href: "/provincias",
    roles: ["Admin"],
  },
  {
    id: "ciudades",
    label: "Ciudades",
    icon: "MapPin",
    href: "/ciudades",
    roles: ["Admin"],
  },
  {
    id: "facility",
    label: "Facility",
    icon: "UserCog",
    href: "/facility",
    roles: ["Supervisor", "Admin"],
  },

  // Configuración y Datos
  {
    id: "datos-usuario",
    label: "Datos de Usuario",
    icon: "UserCog",
    href: "/datos-usuario",
    roles: ["TÉCNICO", "Supervisor", "Admin"],
  },
  {
    id: "datos-sucursal",
    label: "Datos de Sucursal",
    icon: "Building2",
    href: "/datos-sucursal",
    roles: ["Supervisor", "Admin"],
  },
  {
    id: "opciones-clientes",
    label: "Opciones de Clientes",
    icon: "Settings",
    href: "/opciones-clientes",
    roles: ["Supervisor", "Admin"],
  },
  {
    id: "plan-tasks",
    label: "Plan de Tareas",
    icon: "FileCheck",
    href: "/plan-tasks",
    roles: ["Supervisor", "Admin"],
  },
  {
    id: "listaTareas",
    label: "Lista de Tareas",
    icon: "Layers",
    href: "/lista-tareas",
    roles: ["Supervisor", "Admin"],
  },
  {
    id: "task",
    label: "Tareas",
    icon: "Type",
    href: "/task",
    roles: ["Supervisor", "Admin"],
  },
  {
    id: "reports",
    label: "Reportes",
    icon: "BarChart3",
    href: "/reports",
    roles: ["Supervisor", "Admin"],
  },
  {
    id: "settings",
    label: "Configuración",
    icon: "Settings",
    href: "/settings",
    roles: ["TÉCNICO", "Supervisor", "Admin"],
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
  MapPinned,
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
  Warehouse: Building2, // temporal
};

// Categorías (sin cambios)
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
      "sucursales-clientes",
      "depositos",
      "grupos",
      "servicios",
      "sucursales",
      "zonas",
      "paises",
      "provincias",
      "ciudades",
      "facility",
    ],
  },
  {
    id: "forms",
    label: "Formularios",
    items: ["plan-tasks", "listaTareas", "task"],
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
  const [isOpen, setIsOpen] = useState(false); // mobile off-canvas
  const [isCollapsed, setIsCollapsed] = useState(false); // desktop colapsado
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    "operations",
  ]);

  const navRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const filteredMenuItems = menuItems.filter((item) =>
    Array.isArray(user?.roles)
      ? user?.roles.some((role) => item.roles.includes(role.name))
      : false
  );

  const getItemsByCategory = (categoryItems: string[]) =>
    categoryItems
      .map((itemId) => filteredMenuItems.find((item) => item.id === itemId))
      .filter(Boolean) as MenuItem[];

  const findCategoryForPath = (path: string): string | null => {
    for (const category of menuCategories) {
      const items = getItemsByCategory(category.items);
      if (items.some((item) => item.href === path)) return category.id;
    }
    return null;
  };

  // Desktop: sidebar visible por defecto; Mobile: off-canvas
  useEffect(() => {
    const checkIfMobile = () => setIsOpen(window.innerWidth >= 1024);
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Expandir categoría de la ruta activa
  useEffect(() => {
    const activeCategory = findCategoryForPath(pathname);
    if (activeCategory && !expandedCategories.includes(activeCategory)) {
      setExpandedCategories((prev) => [...prev, activeCategory]);
    }
  }, [pathname, expandedCategories]);

  // Actualiza la variable CSS para empujar el <main>
  useEffect(() => {
    const updateSidebarWidthVar = () => {
      const isDesktop = window.innerWidth >= 1024;
      const widthPx = isDesktop ? (isCollapsed ? 64 : 256) : isOpen ? 256 : 0; // mobile abre a 256px
      document.documentElement.style.setProperty(
        "--sidebar-width",
        `${widthPx}px`
      );
    };
    updateSidebarWidthVar();
    window.addEventListener("resize", updateSidebarWidthVar);
    return () => window.removeEventListener("resize", updateSidebarWidthVar);
  }, [isCollapsed, isOpen]);

  useEffect(() => {
    const savedScroll = sessionStorage.getItem("sidebar-scroll");
    if (navRef.current && savedScroll) {
      navRef.current.scrollTop = parseInt(savedScroll, 10);
    }
  }, []);

  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  if (!user) return null;

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const isExpanding = !prev.includes(categoryId);
      const newExpanded = isExpanding
        ? [...prev, categoryId]
        : prev.filter((id) => id !== categoryId);

      // Scroll después de expandir
      if (isExpanding) {
        setTimeout(() => {
          const el = categoryRefs.current[categoryId];
          el?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100); // Esperar al re-render
      }

      return newExpanded;
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (e) {
      console.error("Error signing out:", e);
    }
  };

  const toggleSidebarMobile = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Botón mobile para abrir/cerrar off-canvas */}
      <button
        onClick={toggleSidebarMobile}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-orange-500 text-white rounded-md shadow-lg"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-lg transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
        style={{
          width:
            typeof window !== "undefined" && window.innerWidth >= 1024
              ? isCollapsed
                ? "4rem"
                : "16rem"
              : "16rem",
        }}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Home className="text-white" size={20} />
              </div>
              <div
                className={cn(
                  "overflow-hidden transition-all duration-200",
                  isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
                )}
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  HogarApp
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {Array.isArray(user.roles)
                    ? user.roles.map((r) => r.name).join(", ")
                    : String(user.roles)}
                </p>
              </div>
            </div>
          </div>

          {/* Info de usuario (oculto al colapsar) */}
          {/* User info */}
          <div
            className={cn(
              "border-b border-gray-200 dark:border-gray-700 transition-all duration-200",
              isCollapsed ? "px-2 py-2" : "p-4"
            )}
          >
            <div className="flex items-center gap-3">
              {/* Avatar (oculto al colapsar) */}
              <div
                className={cn(
                  "transition-all duration-200 flex-shrink-0",
                  isCollapsed
                    ? "opacity-0 w-0 h-0 -ml-2"
                    : "opacity-100 w-8 h-8"
                )}
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.fullName || user.email}
                    className={cn(
                      "rounded-full",
                      isCollapsed ? "w-0 h-0" : "w-8 h-8"
                    )}
                  />
                ) : (
                  <div
                    className={cn(
                      "bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center",
                      isCollapsed ? "w-0 h-0" : "w-8 h-8"
                    )}
                  >
                    {!isCollapsed && (
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {(user.fullName || user.email).charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Nombre + correo (ocultos al colapsar) */}
              <div
                className={cn(
                  "flex-1 min-w-0 transition-all duration-200 overflow-hidden",
                  isCollapsed
                    ? "opacity-0 w-0 pointer-events-none"
                    : "opacity-100 w-auto"
                )}
              >
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {user.fullName || user.email}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </p>
              </div>

              {/* Flecha para colapsar/expandir (queda sola al colapsar) */}
              <button
                onClick={() => setIsCollapsed((v) => !v)}
                className="hidden lg:inline-flex p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={isCollapsed ? "Expandir" : "Colapsar"}
                aria-label={
                  isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"
                }
              >
                {isCollapsed ? (
                  <ChevronRight size={18} />
                ) : (
                  <ChevronLeft size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Navegación */}
          <nav
            ref={navRef}
            className={cn("flex-1 p-4 space-y-2 overflow-y-auto")}
          >
            {menuCategories.map((category) => {
              const categoryItems = getItemsByCategory(category.items);
              if (categoryItems.length === 0) return null;

              const isExpanded = expandedCategories.includes(category.id);

              return (
                <div
                  key={category.id}
                  ref={(el) => (categoryRefs.current[category.id] = el)}
                  className="space-y-1"
                >
                  {/* Encabezado de categoría (oculto al colapsar) */}
                  {!isCollapsed && (
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
                  )}

                  {/* Lista de items */}
                  {(isCollapsed || isExpanded) && (
                    <div className={cn("space-y-1", isCollapsed ? "" : "ml-2")}>
                      {categoryItems.map((item) => {
                        const Icon = iconMap[item.icon as keyof typeof iconMap];
                        const isActive = pathname === item.href;

                        return (
                          <Link
                            key={item.id}
                            href={item.href}
                            onClick={() => {
                              if (navRef.current) {
                                sessionStorage.setItem(
                                  "sidebar-scroll",
                                  String(navRef.current.scrollTop)
                                );
                              }
                              // Cerrar sidebar si es mobile
                              if (window.innerWidth < 1024) {
                                setIsOpen(false);
                              }
                            }}
                            className={cn(
                              "flex items-center rounded-lg text-sm font-medium transition-colors px-3 py-2",
                              isCollapsed
                                ? "justify-center"
                                : "justify-between",
                              isActive
                                ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800"
                                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                            )}
                            title={item.label}
                          >
                            <div
                              className={cn(
                                "flex items-center",
                                isCollapsed ? "gap-0" : "gap-3"
                              )}
                            >
                              <Icon size={18} />
                              {/* Etiqueta (oculta al colapsar) */}
                              <span
                                className={cn(
                                  "transition-opacity",
                                  isCollapsed
                                    ? "opacity-0 hidden"
                                    : "opacity-100"
                                )}
                              >
                                {item.label}
                              </span>
                            </div>

                            {/* Badges/Nuevo (ocultos al colapsar) */}
                            {!isCollapsed && (item.badge || item.isNew) && (
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
              title="Cerrar sesión"
              className={cn(
                "group flex items-center w-full rounded-lg transition-colors",
                "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100",
                isCollapsed ? "justify-center p-2" : "justify-start px-3 py-2"
              )}
            >
              {/* 👇 Tamaño fijo y sin encogerse */}
              <LogOut
                className={cn("shrink-0", isCollapsed ? "w-4 h-4" : "w-5 h-5")}
                aria-hidden="true"
              />
              {/* Etiqueta solo expandido */}
              {!isCollapsed && (
                <span className="ml-3 text-sm font-medium">Cerrar Sesión</span>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
