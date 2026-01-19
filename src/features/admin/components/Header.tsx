"use client";
import React, { useCallback, useState } from "react";
import {
  LogOut,
  Heart,
  ArrowLeft,
  Menu,
  X,
  User as UserIcon,
  Home,
  ChevronRight,
} from "lucide-react";// EN PRODUCCIÓN: Descomenta estas líneas y borra los MOCKS de abajo
import { useRouter, usePathname, useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { AuthService } from "@/services/authService";

const HeaderAlternative: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const rawId = params ? params.invitationId || params.invitation_id : null;
  const invitationId = Array.isArray(rawId) ? rawId[0] : rawId;

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const onLogout = useCallback(AuthService.logout, [])

  const basePath = invitationId
    ? `/admin/invitations/${invitationId}`
    : "/admin";

  const navItems = [
    {
      label: "Inicio",
      href: `${basePath}/dashboard`,
      icon: <Home size={16} />,
      active: pathname?.includes("/dashboard"),
    },
    {
      label: "Invitados",
      href: basePath,
      icon: <UserIcon size={16} />,
      active: pathname === basePath,
    },
  ];

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between bg-white relative z-50">
        {/* IZQUIERDA: LOGO + VOLVER */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/admin")}
            className="p-2 -ml-2 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-50 transition-colors"
            title="Volver a mis eventos"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-stone-900 rounded-full flex items-center justify-center text-[#C5A669]">
              <Heart className="fill-current" size={16} />
            </div>
            <div>
              <h1 className="text-lg font-serif font-bold text-stone-800 leading-none">
                Boda X&J
              </h1>
              <p className="text-[10px] text-stone-400 font-medium uppercase tracking-wider ">
                Panel de Administración
              </p>
            </div>
          </div>
        </div>

        {/* NAVEGACIÓN DESKTOP */}
        {invitationId && (
          <nav className="hidden md:flex items-center gap-1 md:flex-1 justify-end px-2">
            {navItems.map((item) => (
              <DesktopNavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={item.active}
              />
            ))}
          </nav>
        )}

        {/* DERECHA: ACCIONES + HAMBURGUESA */}
        <div className="flex items-center gap-3">
          <button
            onClick={onLogout}
            className="hidden md:flex items-center gap-2 text-stone-400 hover:text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>

          {/* Botón Menú (Solo Móvil) */}
          <button
            onClick={toggleMenu}
            className={`md:hidden flex items-center gap-2 p-2 rounded-lg transition-all active:scale-95 ${
              isMenuOpen
                ? "bg-stone-100 text-stone-900"
                : "text-stone-600 hover:bg-stone-50"
            }`}
            aria-label="Abrir menú"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MENÚ MÓVIL DESPLEGABLE */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-stone-900/10 backdrop-blur-sm z-30 top-16 md:hidden"
            />

            {/* Contenido del Menú */}
            <motion.div
              initial={{ y: -10, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -10, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={`
                absolute top-16 z-40 bg-white border-b border-stone-200 shadow-2xl overflow-hidden
                left-0 w-full rounded-b-2xl md:hidden
              `}
            >
              <div className="flex flex-col p-4 space-y-2">
                {invitationId ? (
                  <>
                    {navItems.map((item) => (
                      <MenuItem
                        key={item.href}
                        href={item.href}
                        icon={item.icon}
                        label={item.label}
                        active={item.active}
                        onClick={() => setIsMenuOpen(false)}
                      />
                    ))}
                  </>
                ) : (
                  <div className="p-4 text-center text-stone-500 text-sm italic bg-stone-50 rounded-lg m-2">
                    Selecciona un evento para ver las opciones.
                  </div>
                )}
                <div className="h-px bg-stone-100 my-2" />
                <button
                  onClick={() => {
                    onLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full p-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-medium text-sm group active:scale-[0.98]"
                >
                  <div className="p-2 bg-red-50 text-red-500 rounded-lg group-hover:bg-red-100 transition-colors">
                    <LogOut size={18} />
                  </div>
                  Cerrar Sesión
                </button>
              </div>

              <div className="bg-stone-50 p-3 text-center border-t border-stone-100">
                <p className="text-[10px] text-stone-400 font-medium uppercase tracking-widest">
                  JN Invitaciones • {new Date().getFullYear()}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

// --- SUBCOMPONENTES ---

const DesktopNavLink = ({
  label,
  active,
  href,
  icon,
}: {
  label: string;
  active?: boolean;
  href: string;
  icon?: React.ReactNode;
}) => (
  <Link
    href={href}
    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
      active
        ? "text-stone-900 bg-stone-100 font-semibold"
        : "text-stone-500 hover:text-stone-800 hover:bg-stone-50"
    }`}
  >
    {icon && (
      <span
        className={
          active
            ? "text-[#C5A669]"
            : "text-stone-400 group-hover:text-stone-600"
        }
      >
        {icon}
      </span>
    )}
    {label}
  </Link>
);

const MenuItem = ({
  icon,
  label,
  description,
  active = false,
  href,
  onClick,
}: any) => (
  <Link
    href={href}
    onClick={onClick}
    className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all group active:scale-[0.98] ${
      active
        ? "bg-stone-50 border border-stone-200"
        : "hover:bg-stone-50 border border-transparent"
    }`}
  >
    <div
      className={`p-2 rounded-lg transition-colors ${
        active
          ? "bg-white text-[#C5A669] shadow-sm"
          : "bg-stone-100 text-stone-500 group-hover:bg-white group-hover:text-stone-700"
      }`}
    >
      {icon}
    </div>
    <div className="flex-1 text-left">
      <div
        className={`text-sm font-medium flex items-center justify-between ${active ? "text-stone-900" : "text-stone-700"}`}
      >
        {label}
        {active && <ChevronRight size={14} className="text-[#C5A669]" />}
      </div>
      {description && (
        <p className="text-[11px] text-stone-400 mt-0.5 font-normal leading-tight">
          {description}
        </p>
      )}
    </div>
  </Link>
);

export default HeaderAlternative;
