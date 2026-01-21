"use client";
import React, { useCallback, useState } from "react";
import {
  LogOut,
  Heart,
  Menu,
  X,
  User as UserIcon,
  Home,
  ChevronRight,
  CalendarHeart,
} from "lucide-react";
import { useRouter, usePathname, useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { AuthService } from "@/services/authService";
import { cn } from "@heroui/theme";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const invitationId = params.invitationId;
  const onLogout = useCallback(AuthService.logout, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
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
    <header className="bg-white/90 border-b border-sand sticky top-0 z-40">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative z-50">
        <div className="flex items-center">
          <Link
            href="/admin"
            className="hidden md:flex items-center gap-2 text-sm font-bold text-[#A8A29E] hover:text-[#C5A669] transition-colors group mr-6 pr-6 border-r border-[#EBE5DA]"
            title="Volver a mis eventos"
          >
            <div className="p-1.5 rounded-lg bg-transparent group-hover:bg-[#FDFBF7] transition-colors">
              <CalendarHeart
                size={20}
                className="group-hover:-translate-x-0.5 transition-transform"
              />
            </div>
            <span>Mis Eventos</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-stone-900 rounded-full flex items-center justify-center text-gold shadow-sm">
              <Heart className="fill-current" size={16} />
            </div>
            <div>
              <h1 className="text-lg font-serif font-bold text-stone-700 leading-none">
                Boda X&J
              </h1>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mt-0.5">
                Panel de Administración
              </p>
            </div>
          </div>
        </div>

        {invitationId && (
          <nav className="hidden md:flex items-center gap-1 md:flex-1 justify-end px-2">
            {navItems.map((item) => (
              <DesktopNavLink key={item.href} {...item} />
            ))}
          </nav>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={onLogout}
            className="hidden md:flex items-center gap-2 text-stone-400 hover:text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            <LogOut size={18} /> Cerrar sesión
          </button>

          <button
            onClick={toggleMenu}
            className={`md:hidden flex items-center gap-2 p-2 rounded-lg transition-all active:scale-95 text-stone-600 ${isMenuOpen ? "bg-sand-100" : "hover:bg-sand-100"}`}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-stone-900/10 backdrop-blur-sm z-30 top-16 md:hidden"
            />
            <motion.div
              initial={{ y: -10, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -10, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute top-16 z-40 bg-white border-b border-sand -mt-16 pt-16 shadow-2xl overflow-hidden left-0 w-full rounded-b-2xl md:hidden"
            >
              <div className="flex flex-col p-4 space-y-2">
                {invitationId ? (
                  <>
                    {navItems.map((item) => (
                      <MenuItem key={item.href} {...item} />
                    ))}
                  </>
                ) : (
                  <div className="p-4 text-center text-stone-400 text-sm italic bg-sand-light rounded-lg m-2">
                    Selecciona un evento para ver las opciones.
                  </div>
                )}

                <div className="h-px bg-sand my-2" />
                <MenuItem
                  className="hover:bg-sand-50"
                  icon={<CalendarHeart size={18} />}
                  label="Volver a mis eventos"
                  href="/admin"
                />
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

              <div className="bg-sand-light p-3 text-center border-t border-sand">
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
    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
      active
        ? "text-stone-custom bg-paper border-sand shadow-sm"
        : "text-[#8A8A8A] border-transparent hover:text-stone-custom hover:bg-white hover:border-sand"
    }`}
  >
    {icon && (
      <span
        className={
          active ? "text-gold" : "text-[#A39885] group-hover:text-gold"
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
  active = false,
  href,
  className,
}: {
  label: string;
  active?: boolean;
  href: string;
  icon?: React.ReactNode;
  className?: string;
}) => (
  <Link
    href={href}
    className={cn(
      "flex items-center gap-3 w-full p-3 rounded-xl transition-all group border active:scale-[0.98]",
      active
        ? "text-stone-custom bg-paper border-sand shadow-sm"
        : "text-[#8A8A8A] border-transparent hover:text-stone-custom hover:border-sand",
      className,
    )}
  >
    <div
      className={`p-2 rounded-lg transition-colors shadow-sm ${
        active
          ? "bg-white text-gold"
          : "bg-sand-50 text-stone-500 group-hover:text-gold"
      }`}
    >
      {icon}
    </div>
    <div className="flex-1 text-left">
      <div
        className={`text-sm font-medium flex items-center justify-between ${active ? "text-stone-900" : "text-stone-700"}`}
      >
        {label}
        {active && <ChevronRight size={14} className="text-gold" />}
      </div>
    </div>
  </Link>
);

export default Header;
