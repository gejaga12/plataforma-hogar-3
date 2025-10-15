"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Novedad } from "@/utils/types";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getUserTimeZone } from "@/utils/formatDate";

interface NovedadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    novedad: Omit<Novedad, "id" | "file"> & {
      users?: number[];
      zonas?: string[];
      areas?: string[];
    },
    file?: File
  ) => void;
  novedad?: Novedad;
  isLoading?: boolean;
  usersNovedades: any;
}

const iconosDisponibles = ["🔔", "⚠️", "🚨", "✅", "📢", "🎉"];

export function NovedadFormModal({
  onClose,
  onSubmit,
  isOpen,
  novedad,
  usersNovedades,
  isLoading = false,
}: NovedadFormModalProps) {
  const timeZone = getUserTimeZone();

  const [formData, setFormData] = useState<Omit<Novedad, "id" | "file">>({
    name: "",
    desc: "",
    icono: "🔔",
  });
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);

  // Inicializa/rehidrata al abrir o al cambiar la novedad
  useEffect(() => {
    if (!isOpen) return;

    setFormData({
      name: novedad?.name ?? "",
      desc: novedad?.desc ?? "",
      icono: novedad?.icono ?? "🔔",
    });

    setSelectedFile(undefined);
  }, [isOpen, novedad]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const users = selectedUsers.map(Number).filter((n) => !Number.isNaN(n));
    const zonas = selectedZonas;
    const areas = selectedAreas;

    const payload = {
      name: formData.name.trim(),
      desc: formData.desc.trim(),
      icono: formData.icono,
      users: users.length ? users : undefined,
      zonas: zonas.length ? zonas : undefined,
      areas: areas.length ? areas : undefined,
    };

    onSubmit(payload, selectedFile);
  };

  // ===== Derivar arrays desde usersNovedades (tolerante a forma)
  const areas: string[] = (usersNovedades as any)?.area ?? [];

  const zonas: Array<{ id: string; name: string }> = (
    (usersNovedades as any)?.zona ?? []
  ).map((z: any) => ({
    id: String(z?.id ?? z?.name ?? crypto.randomUUID()),
    name: String(z?.name ?? z?.id ?? ""),
  }));

  const usuarios: Array<{
    id: number;
    fullName: string;
    email?: string;
  }> = ((usersNovedades as any)?.users ?? []).map((u: any) => ({
    id: u.id,
    fullName: u.fullName ?? u.name ?? u.email ?? `#${u.id}`,
    email: u.email,
  }));

  // ===== Selecciones locales (solo UI)
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedZonas, setSelectedZonas] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  // Dropdowns abiertos/cerrados
  const [open, setOpen] = useState<{
    areas: boolean;
    zonas: boolean;
    users: boolean;
  }>({
    areas: false,
    zonas: false,
    users: false,
  });

  // Buscador de usuarios
  const [userSearch, setUserSearch] = useState("");
  const filteredUsers = usuarios.filter((u) => {
    const t = userSearch.trim().toLowerCase();
    if (!t) return true;
    return (
      u.fullName.toLowerCase().includes(t) ||
      (u.email ?? "").toLowerCase().includes(t)
    );
  });

  // Helpers toggle
  const toggleInArray = <T,>(arr: T[], item: T): T[] =>
    arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];

  const onToggleArea = (a: string) =>
    setSelectedAreas((prev) => toggleInArray(prev, a));
  const onToggleZona = (id: string) =>
    setSelectedZonas((prev) => toggleInArray(prev, id));
  const onToggleUser = (id: number) =>
    setSelectedUsers((prev) => toggleInArray(prev, id));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {novedad ? "Editar Novedad" : "Crear Nueva Novedad"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              type="button"
              aria-label="Cerrar"
              title="Cerrar"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Fila 1: Título + Iconos */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Título */}
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Título *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, name: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
            </div>

            {/* Iconos */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Icono
              </label>
              <div className="flex flex-wrap gap-2">
                {iconosDisponibles.map((icono) => (
                  <button
                    key={icono}
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, icono }))}
                    className={`w-10 h-10 text-xl flex items-center justify-center rounded-lg transition-colors ${
                      formData.icono === icono
                        ? "bg-orange-100 dark:bg-orange-900/30 border-2 border-orange-500"
                        : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                    aria-pressed={formData.icono === icono}
                    title={`Elegir ${icono}`}
                  >
                    {icono}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Fila 2: Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción *
            </label>
            <textarea
              value={formData.desc}
              onChange={(e) =>
                setFormData((p) => ({ ...p, desc: e.target.value }))
              }
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
              required
            />
          </div>

          {/* Destinatarios */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Dirigir novedad a:
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Áreas */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpen((o) => ({ ...o, areas: !o.areas }))}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <span className="truncate">
                    Áreas{" "}
                    {selectedAreas.length ? `(${selectedAreas.length})` : ""}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      open.areas ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {open.areas && (
                  <div className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
                    {areas.length ? (
                      <ul className="py-1">
                        {areas.map((a) => (
                          <li key={a}>
                            <label className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedAreas.includes(a)}
                                onChange={() => onToggleArea(a)}
                                className="rounded border-gray-300 dark:border-gray-600 text-orange-600 focus:ring-orange-500"
                              />
                              <span className="text-sm text-gray-800 dark:text-gray-100 capitalize">
                                {a}
                              </span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-3 text-sm text-gray-500 dark:text-gray-400">
                        Sin áreas
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Zonas */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpen((o) => ({ ...o, zonas: !o.zonas }))}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <span className="truncate">
                    Zonas{" "}
                    {selectedZonas.length ? `(${selectedZonas.length})` : ""}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      open.zonas ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {open.zonas && (
                  <div className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
                    {zonas.length ? (
                      <ul className="py-1">
                        {zonas.map((z) => (
                          <li key={z.id}>
                            <label className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedZonas.includes(z.id)}
                                onChange={() => onToggleZona(z.id)}
                                className="rounded border-gray-300 dark:border-gray-600 text-orange-600 focus:ring-orange-500"
                              />
                              <span className="text-sm text-gray-800 dark:text-gray-100">
                                {z.name}
                              </span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-3 text-sm text-gray-500 dark:text-gray-400">
                        Sin zonas
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Usuarios (con buscador) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpen((o) => ({ ...o, users: !o.users }))}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <span className="truncate">
                    Usuarios{" "}
                    {selectedUsers.length ? `(${selectedUsers.length})` : ""}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      open.users ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {open.users && (
                  <div className="absolute z-50 mt-1 w-full max-h-72 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg flex flex-col">
                    {/* Buscador */}
                    <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                      <input
                        type="text"
                        placeholder="Buscar usuario..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>

                    {/* Lista */}
                    <div className="overflow-auto">
                      {filteredUsers.length ? (
                        <ul className="py-1">
                          {filteredUsers.map((u) => (
                            <li key={u.id}>
                              <label className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedUsers.includes(u.id)}
                                  onChange={() => onToggleUser(u.id)}
                                  className="rounded border-gray-300 dark:border-gray-600 text-orange-600 focus:ring-orange-500"
                                />
                                <span className="text-sm text-gray-800 dark:text-gray-100">
                                  {u.fullName}
                                </span>
                              </label>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="p-3 text-sm text-gray-500 dark:text-gray-400">
                          Sin resultados
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Fila 3: Imagen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Imagen (opcional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? undefined;
                setSelectedFile(file);
              }}
              className="block w-full text-sm text-gray-900 dark:text-gray-100
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-lg file:border-0
                       file:text-sm file:font-semibold
                       file:bg-orange-50 file:text-orange-700
                       hover:file:bg-orange-100
                       dark:file:bg-orange-900/30 dark:file:text-orange-300"
            />
          </div>

          {/* Footer acciones */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={
                isLoading || !formData.name.trim() || !formData.desc.trim()
              }
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">
                    {novedad ? "Guardando..." : "Creando..."}
                  </span>
                </>
              ) : novedad ? (
                "Guardar cambios"
              ) : (
                "Crear novedad"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
