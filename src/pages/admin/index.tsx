import { User } from "firebase/auth";
import { useEffect, useMemo, useRef, useState } from "react";
import { DashboardStats, Guest, GuestFormData } from "../../../types/types";
import { AuthService } from "@/services/authService";
import { GuestService } from "@/services/guestService";
import {
  CheckSquare,
  FileSpreadsheet,
  Edit2,
  Heart,
  LayoutList,
  MessageCircle,
  Plus,
  Search,
  Smartphone,
  Square,
  Trash2,
  Users,
  Phone,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  ChevronDown,
  Filter,
} from "lucide-react";
import Header from "@/components/admin/Header";
import BulkActionsBar from "@/components/admin/BulkActionsProps";
import GuestFormModal from "@/components/admin/GuestFormModal";
import ConfirmationModal from "@/components/ConfirmationModal";
import { useToast } from "@/components/Toast";
import { exportGuestsToExcel } from "@/services/excelService";

const defaultGuest = {
  nombre: "",
  asistencia: null,
  invitados: 1,
  telefono: null,
  confirmados: null,
  mensaje: null,
  cambiosPermitidos: true,
  comentarios: null,
};


// Tipo para el estado del filtro
type FilterType = 'all' | 'confirmed' | 'pending' | 'rejected';

export default function WeddingAdminPanel() {
  // --- STATE ---
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "table">("list");
  const [selectedGuests, setSelectedGuests] = useState<Set<string>>(new Set());

  // Filtros y Búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterType>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false); // Estado para el dropdown
  const filterRef = useRef<HTMLDivElement>(null); // Ref para click outside

  // Estado del Modal de Formulario
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentGuestId, setCurrentGuestId] = useState<string | null>(null);
  const [formData, setFormData] = useState<GuestFormData>({ ...defaultGuest });

  const { toast } = useToast();

  // --- NUEVO: Estado para el Modal de Confirmación ---
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    isDanger: false,
    isLoading: false,
    // Aquí guardamos la función que se ejecutará si el usuario dice "SÍ"
    action: null as (() => Promise<void>) | null,
  });

  // --- EFECTOS ---
  useEffect(() => {
    AuthService.initAuth();
    return AuthService.onUserChange((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = GuestService.subscribeToGuests((data) =>
      setGuests(data)
    );
    return () => unsubscribe();
  }, [user]);

  // Click Outside para cerrar el filtro
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- HANDLERS ---

  // ... (Select Guest y Select All se mantienen igual) ...
  const handleSelectGuest = (id: string) => {
    const newSelected = new Set(selectedGuests);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedGuests(newSelected);
  };

  const handleSelectAll = (filtered: Guest[]) => {
    if (selectedGuests.size === filtered.length && filtered.length > 0)
      setSelectedGuests(new Set());
    else setSelectedGuests(new Set(filtered.map((g) => g.id)));
  };

  // --- NUEVO HANDLER GENÉRICO PARA EJECUTAR LA ACCIÓN CONFIRMADA ---
  const handleExecuteConfirmation = async () => {
    if (!confirmModal.action) return;

    setConfirmModal((prev) => ({ ...prev, isLoading: true })); // Mostrar spinner
    try {
      await confirmModal.action();
      // Cerrar modal al terminar éxito
      toast("Acción completada exitosamente", "success"); // Feedback positivo
      setConfirmModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
    } catch (error) {
      console.error(error);
      setConfirmModal((prev) => ({ ...prev, isLoading: false }));
      toast("No se pudo completar la acción", "error");
    }
  };

  // --- MODIFICADO: Solo prepara el modal, no ejecuta ---
  const handleBulkUpdateLock = (shouldLock: boolean) => {
    if (!user || selectedGuests.size === 0) return;

    // Configurar el modal
    setConfirmModal({
      isOpen: true,
      title: shouldLock ? "Bloquear Edición" : "Permitir Edición",
      message: `Estás a punto de ${
        shouldLock ? "bloquear" : "desbloquear"
      } la edición para ${
        selectedGuests.size
      } invitados seleccionados. ¿Deseas continuar?`,
      isDanger: false, // No es peligroso, es reversible
      isLoading: false,
      action: async () => {
        // La lógica real se mueve aquí dentro
        await GuestService.batchUpdateLock(
          Array.from(selectedGuests),
          shouldLock
        );
        setSelectedGuests(new Set());
      },
    });
  };

  // --- MODIFICADO: Solo prepara el modal ---
  const handleDeleteGuest = (id: string) => {
    if (!user) return;

    setConfirmModal({
      isOpen: true,
      title: "Eliminar Invitado",
      message:
        "Esta acción es permanente y no se puede deshacer. ¿Estás seguro de que quieres eliminar a este invitado?",
      isDanger: true, // Rojo para eliminar
      isLoading: false,
      action: async () => {
        await GuestService.deleteGuest(id);
        if (selectedGuests.has(id)) {
          const newSel = new Set(selectedGuests);
          newSel.delete(id);
          setSelectedGuests(newSel);
        }
      },
    });
  };

  const handleSaveGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!user) return;
      const guestId = currentGuestId || (await GuestService.getUniqueGuestId());
      await GuestService.saveGuest(guestId, formData, !currentGuestId);
      toast(
        currentGuestId
          ? "Invitado actualizado correctamente"
          : "Invitado creado con éxito",
        "success"
      );
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      toast("Hubo un error al guardar los datos. Intenta de nuevo.", "error");
    }
  };

  // ... (UI Handlers y Stats se mantienen igual) ...
  const handleOpenModal = (guest: Guest | null = null) => {
    if (guest) {
      setCurrentGuestId(guest.id);
      setFormData({
        ...guest,
        cambiosPermitidos: !!guest.cambiosPermitidos,
      });
    } else {
      setCurrentGuestId(null);
      setFormData({ ...defaultGuest });
    }
    setIsModalOpen(true);
  };

  const sendWhatsApp = (guest: Guest) => {
    if (!guest.telefono) return;
    const link = `https://bodajy.info/invitacion/${guest.id}`;
    const msg = `¡Hola ${guest.nombre.split(" ")[0]}! ${
      guest.mensaje || ""
    } Confirma aquí: ${link}`;
    window.open(
      `https://wa.me/${guest.telefono
        .replace(/\+/g, "")
        .replace(/\s/g, "")}?text=${encodeURIComponent(msg)}`,
      "_blank"
    );

    toast("Abriendo WhatsApp...", "info");
  };

  // Stats Logic
  const stats: DashboardStats = useMemo(
    () =>
      guests.reduce(
        (acc, c) => ({
          total: acc.total + (Number(c.invitados) || 0),
          confirmed: acc.confirmed + (Number(c.confirmados) || 0),
          count: acc.count + 1,
        }),
        { total: 0, confirmed: 0, count: 0 }
      ),
    [guests]
  );

  const filteredGuests = useMemo(() => {
    return guests.filter((g) => {
      const matchesSearch =
        g.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (g.telefono && g.telefono.includes(searchTerm));
      let matchesFilter = true;
      if (filterStatus === "confirmed") matchesFilter = g.asistencia === true;
      else if (filterStatus === "rejected")
        matchesFilter = g.asistencia === false;
      else if (filterStatus === "pending")
        matchesFilter = g.asistencia === null || g.asistencia === undefined;
      return matchesSearch && matchesFilter;
    });
  }, [guests, searchTerm, filterStatus]);

  const filterCounts = useMemo(() => {
    return guests.reduce(
      (acc, curr) => ({
        all: acc.all + 1,
        confirmed: acc.confirmed + (curr.asistencia === true ? 1 : 0),
        rejected: acc.rejected + (curr.asistencia === false ? 1 : 0),
        pending:
          acc.pending +
          (curr.asistencia === null || curr.asistencia === undefined ? 1 : 0),
      }),
      { all: 0, confirmed: 0, rejected: 0, pending: 0 }
    );
  }, [guests]);

  // --- RENDER ---
  if (loading)
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );

  if (!user)
    return (
      // ... Tu pantalla de login
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 text-center max-w-md w-full">
          <Heart className="mx-auto text-yellow-600 mb-4" size={48} />
          <h1 className="text-2xl font-serif text-stone-800 mb-6">
            Boda J&Y Admin
          </h1>
          <button
            onClick={() => AuthService.initAuth()}
            className="w-full bg-stone-900 text-white py-3 rounded-lg"
          >
            Entrar
          </button>
        </div>
      </div>
    );

  // Label del filtro actual para el botón
  const getFilterLabel = () => {
    switch (filterStatus) {
      case "confirmed":
        return "Confirmados";
      case "pending":
        return "Pendientes";
      case "rejected":
        return "Rechazados";
      default:
        return "Todos";
    }
  };

  const getFilterColor = () => {
    switch (filterStatus) {
      case "confirmed":
        return "text-green-700 bg-green-50 border-green-200";
      case "pending":
        return "text-yellow-700 bg-yellow-50 border-yellow-200";
      case "rejected":
        return "text-red-700 bg-red-50 border-red-200";
      default:
        return "text-stone-700 bg-white border-stone-200";
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-sans pb-20">
      <Header
        stats={stats}
        guestCount={guests.length}
        onLogout={AuthService.logout}
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Renderizado condicional de acciones masivas o búsqueda */}
        {selectedGuests.size > 0 ? (
          <BulkActionsBar
            count={selectedGuests.size}
            onUpdateLock={handleBulkUpdateLock}
            onCancel={() => setSelectedGuests(new Set())}
          />
        ) : (
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 mb-6">
            {/* GRUPO IZQUIERDO: Búsqueda + Filtro */}
            <div className="flex flex-1 gap-2">
              {/* Búsqueda */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Search size={18} />
                </div>
                <input
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all text-sm"
                  placeholder="Buscar invitados..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* FILTRO COMPACTO (Dropdown) */}
              <div className="relative" ref={filterRef}>
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors whitespace-nowrap ${getFilterColor()}`}
                >
                  <Filter size={16} />
                  <span className="hidden sm:inline">{getFilterLabel()}</span>
                  <span className="inline sm:hidden">Filtro</span>
                  <span className="bg-black/10 px-1.5 rounded-full text-xs">
                    {filterStatus === "all"
                      ? filterCounts.all
                      : filterStatus === "confirmed"
                      ? filterCounts.confirmed
                      : filterStatus === "pending"
                      ? filterCounts.pending
                      : filterCounts.rejected}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                      isFilterOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Menú Desplegable */}
                {isFilterOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-stone-100 overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                    <div className="p-1 space-y-0.5">
                      <button
                        onClick={() => {
                          setFilterStatus("all");
                          setIsFilterOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                          filterStatus === "all"
                            ? "bg-stone-100 font-medium"
                            : "hover:bg-stone-50"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <LayoutList size={14} /> Todos
                        </span>
                        <span className="text-stone-400 text-xs">
                          {filterCounts.all}
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          setFilterStatus("confirmed");
                          setIsFilterOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-green-700 ${
                          filterStatus === "confirmed"
                            ? "bg-green-50 font-medium"
                            : "hover:bg-green-50/50"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <CheckCircle2 size={14} /> Confirmados
                        </span>
                        <span className="text-green-600/70 text-xs">
                          {filterCounts.confirmed}
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          setFilterStatus("pending");
                          setIsFilterOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-yellow-700 ${
                          filterStatus === "pending"
                            ? "bg-yellow-50 font-medium"
                            : "hover:bg-yellow-50/50"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Clock size={14} /> Pendientes
                        </span>
                        <span className="text-yellow-600/70 text-xs">
                          {filterCounts.pending}
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          setFilterStatus("rejected");
                          setIsFilterOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-red-700 ${
                          filterStatus === "rejected"
                            ? "bg-red-50 font-medium"
                            : "hover:bg-red-50/50"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <XCircle size={14} /> Rechazados
                        </span>
                        <span className="text-red-600/70 text-xs">
                          {filterCounts.rejected}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* GRUPO DERECHO: Acciones */}
            <div className="flex gap-2 shrink-0">
              {/* Excel (Solo Desktop) */}
              <button
                onClick={async () => {
                  try {
                    await exportGuestsToExcel(guests);
                    toast("Descarga iniciada", "success");
                  } catch (e) {
                    toast("Error", "error");
                  }
                }}
                className="hidden sm:flex items-center justify-center p-2.5 bg-white text-stone-600 border border-stone-200 rounded-lg hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-colors"
                title="Exportar Excel"
              >
                <Download size={20} />
              </button>

              {/* Toggle Vista (Solo Desktop) */}
              <div className="hidden sm:flex bg-white rounded-lg border border-stone-200 p-1">
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded ${
                    viewMode === "list"
                      ? "bg-stone-100 text-stone-900 shadow-sm"
                      : "text-stone-400 hover:text-stone-600"
                  }`}
                >
                  <Smartphone size={18} />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded ${
                    viewMode === "table"
                      ? "bg-stone-100 text-stone-900 shadow-sm"
                      : "text-stone-400 hover:text-stone-600"
                  }`}
                >
                  <LayoutList size={18} />
                </button>
              </div>

              {/* Nuevo Invitado */}
              <button
                onClick={() => handleOpenModal()}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-4 py-2.5 rounded-lg transition-colors shadow-lg shadow-stone-900/20 text-sm font-medium"
              >
                <Plus size={18} /> <span>Nuevo</span>
              </button>
            </div>
          </div>
        )}

        {filteredGuests.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-stone-300">
            <Users className="mx-auto h-12 w-12 text-stone-300" />
            <p className="mt-2 text-stone-500">No se encontraron invitados.</p>
          </div>
        ) : (
          <>
            {/* VIEW TABLE */}
            <div
              className={`hidden ${
                viewMode === "table" ? "md:block" : ""
              } bg-white shadow-sm rounded-xl border border-stone-200 overflow-hidden`}
            >
              <table className="min-w-full divide-y divide-stone-200">
                <thead className="bg-stone-50">
                  <tr>
                    <th className="px-6 py-3 text-left flex">
                      <button
                        onClick={() => handleSelectAll(filteredGuests)}
                        className="text-stone-400 hover:text-stone-600"
                      >
                        {selectedGuests.size === filteredGuests.length ? (
                          <CheckSquare size={20} />
                        ) : (
                          <Square size={20} />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase">
                      Invitado
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-stone-500 uppercase">
                      Cupos
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-stone-500 uppercase">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-stone-500 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-stone-200">
                  {filteredGuests.map((g) => (
                    <tr
                      key={g.id}
                      className={`hover:bg-stone-50 ${
                        selectedGuests.has(g.id) ? "bg-yellow-50/50" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleSelectGuest(g.id)}
                          className={
                            selectedGuests.has(g.id)
                              ? "text-yellow-600"
                              : "text-stone-300"
                          }
                        >
                          {selectedGuests.has(g.id) ? (
                            <CheckSquare size={20} />
                          ) : (
                            <Square size={20} />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-stone-900">
                          {g.nombre}
                        </div>
                        <div className="text-xs text-stone-500 font-mono">
                          ID: {g.id}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-bold">
                        {g.asistencia === true ? g.confirmados : 0} /{" "}
                        <span className="text-stone-400">{g.invitados}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {g.asistencia === null ? (
                          <span className="text-yellow-600 text-xs font-bold bg-yellow-100 px-2 py-1 rounded-full">
                            Pendiente
                          </span>
                        ) : g.asistencia === false ? (
                          <span className="text-red-600 text-xs font-bold bg-red-100 px-2 py-1 rounded-full">
                            No asistirá
                          </span>
                        ) : (
                          <span className="text-green-600 text-xs font-bold bg-green-100 px-2 py-1 rounded-full">
                            Confirmado
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          {g.telefono && g.telefono !== "" && (
                            <button
                              title="Enviar Whatsapp"
                              onClick={() => sendWhatsApp(g)}
                              className="text-green-600 flex justify-center items-center relative"
                            >
                              <MessageCircle size={18} />
                              <Phone
                                size={9}
                                className="absolute top-[5px] left-[4px] z-10"
                              />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenModal(g)}
                            className="text-yellow-600"
                            title="Editar"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteGuest(g.id)}
                            className="text-red-400"
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* VIEW CARDS */}
            <div
              className={`${
                viewMode === "table" ? "md:hidden" : ""
              } grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`}
            >
              <div className="col-span-full flex justify-end">
                <button
                  onClick={() => handleSelectAll(filteredGuests)}
                  className="text-xs font-medium text-stone-500 flex items-center gap-1 mb-2"
                >
                  {selectedGuests.size === filteredGuests.length
                    ? "Deseleccionar todos"
                    : "Seleccionar todos"}{" "}
                  {selectedGuests.size === filteredGuests.length ? (
                    <CheckSquare size={14} />
                  ) : (
                    <Square size={14} />
                  )}
                </button>
              </div>
              {filteredGuests.map((g) => (
                <div
                  key={g.id}
                  className={`bg-white rounded-xl shadow-sm border p-5 ${
                    selectedGuests.has(g.id)
                      ? "border-yellow-400 ring-1 ring-yellow-400"
                      : "border-stone-200"
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleSelectGuest(g.id)}
                        className={
                          selectedGuests.has(g.id)
                            ? "text-yellow-600"
                            : "text-stone-300"
                        }
                      >
                        {selectedGuests.has(g.id) ? (
                          <CheckSquare size={24} />
                        ) : (
                          <Square size={24} />
                        )}
                      </button>
                      <div>
                        <h3 className="font-semibold text-stone-800">
                          {g.nombre}
                        </h3>
                        <p className="text-xs text-stone-500 font-mono">
                          ID: {g.id}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs font-bold bg-stone-100 px-2 py-1 rounded">
                      {g.asistencia === true ? g.confirmados : 0}/{g.invitados}
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-stone-100">
                    <div className="text-xs text-stone-400">
                      {g.cambiosPermitidos ? "Editable" : "Bloqueado"}
                    </div>
                    <div className="flex gap-2">
                      {g.telefono && g.telefono !== "" && (
                        <button
                          title="Enviar Whatsapp"
                          onClick={() => sendWhatsApp(g)}
                          className="bg-green-50 text-green-600 p-2 rounded-lg flex justify-center items-center relative"
                        >
                          <MessageCircle size={18} />
                          <Phone
                            size={9}
                            className="absolute top-[13px] left-[12px] z-10"
                          />
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenModal(g)}
                        className="bg-stone-50 text-stone-600 p-2 rounded-lg"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteGuest(g.id)}
                        className="bg-red-50 text-red-500 p-2 rounded-lg"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* MODAL DE FORMULARIO */}
      <GuestFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSaveGuest}
        isEdit={!!currentGuestId}
      />

      {/* NUEVO: MODAL DE CONFIRMACIÓN */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleExecuteConfirmation}
        isLoading={confirmModal.isLoading}
        isDanger={confirmModal.isDanger}
        confirmText={confirmModal.isDanger ? "Eliminar" : "Confirmar"}
      />
    </div>
  );
}
