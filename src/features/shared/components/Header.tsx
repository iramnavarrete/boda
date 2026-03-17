"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  LogOut,
  Menu,
  X,
  User as UserIcon,
  Home,
  ChevronRight,
  CalendarHeart,
  Gem,
  Play,
  Star,
  MessageCircle,
  AppWindow,
  Mail,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, usePathname } from "next/navigation";
import { cn } from "@heroui/theme";
import Link from "next/link";
import { AuthService } from "@/services/authService";
import JnInvitacionesIcon from "@/icons/jn-invitaciones-icon";
import { useRouter } from "next/router";

export type HeaderVariant = "admin" | "landing";

export interface NavItemType {
  label: string;
  href: string;
  icon?: React.ReactNode;
  active?: boolean;
}

interface HeaderProps {
  // Configuración Principal
  variant?: HeaderVariant;

  // Estilos (Sobrescriben los defaults del variant)
  className?: string;

  // Contenido
  title?: string;
  subtitle?: string;

  // Navegación Manual (Opcional)
  navItems?: NavItemType[];

  // Callbacks
  onLogout?: () => void;
  onCotizar?: () => void;
}

// --- CONFIGURACIÓN DE VARIANTES ---
// Aquí se definen los estilos y textos por defecto para cada modo
const VARIANT_CONFIG = {
  admin: {
    containerClass: "bg-paper/95",
    titleClass: "text-primary",
    subtitleClass: "text-charcoal-400",
    logoBg: "bg-primary",
    logoText: "text-gold",
    logoIcon: <Gem className="text-current" size={16} />,
    backButtonIcon: <CalendarHeart size={20} />,
    backButtonText: "Mis Eventos",
    backButtonHref: "/admin",
    backButtonClass: "text-stone-400 hover:text-primary",
    navLinkBase: "text-primary hover:text-gold hover:bg-white",
    navLinkActive: "text-gold bg-white shadow-sm ring-1 ring-border-button",
    mobileBg: "bg-paper",
  },
  landing: {
    containerClass: "bg-paper/95 border-border-button",
    titleClass: "text-primary",
    subtitleClass: "text-charcoal-400",
    logoBg: "bg-primary",
    logoText: "text-gold",
    logoIcon: <Gem className="text-current" size={16} />,
    backButtonIcon: <Star size={18} />,
    backButtonText: "Exclusividad",
    backButtonHref: "#",
    backButtonClass: "text-stone-400 hover:text-gold-500",
    navLinkBase: "text-primary hover:text-gold hover:bg-white",
    navLinkActive: "text-gold bg-white shadow-sm ring-1 ring-border-button",
    mobileBg: "bg-paper",
  },
};

const Header = ({
  variant = "admin",
  className,
  title,
  subtitle,
  navItems: customNavItems,
  onCotizar,
}: HeaderProps) => {
  const config = VARIANT_CONFIG[variant];
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null); // Solo para landing
  const router = useRouter();

  // Hooks de Next.js (Solo relevantes para Admin)
  const pathname = usePathname();
  const params = useParams();
  const invitationId = params?.invitationId;

  // --- LÓGICA SCROLL SPY (Solo Landing) ---
  useEffect(() => {
    if (variant !== "landing") return;
    if (pathname === "/") {
      setActiveSection("inicio");
    }

    const handleScroll = () => {
      const sections = ["inicio", "demo", "paquetes", "dashboard"];
      const scrollPosition = window.scrollY + 100;
      for (const section of sections) {
        const element = document.getElementById(section);
        if (
          element &&
          element.offsetTop <= scrollPosition &&
          element.offsetTop + element.offsetHeight > scrollPosition
        ) {
          setActiveSection(section);
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [variant]);

  // --- GENERACIÓN DE ITEMS DE NAVEGACIÓN ---
  const navItems = useMemo(() => {
    if (customNavItems) return customNavItems;

    if (variant === "landing") {
      return [
        {
          label: "Inicio",
          href: "/#inicio",
          icon: <Home size={18} />,
          active: activeSection === "inicio",
        },
        {
          label: "Demo",
          href: "/#demo",
          icon: <Play size={18} />,
          active: activeSection === "demo",
        },
        {
          label: "Dashboard",
          href: "/#dashboard",
          icon: <AppWindow size={18} />,
          active: activeSection === "dashboard",
        },
        {
          label: "Paquetes",
          href: "/#paquetes",
          icon: <Gem size={18} />,
          active: activeSection === "paquetes",
        },
      ];
    }

    // Default Admin logic
    const basePath = invitationId
      ? `/admin/invitations/${invitationId}`
      : "/admin";
    if (!invitationId) return [];

    return [
      {
        label: "Inicio",
        href: `${basePath}/dashboard`,
        icon: <Home size={18} />,
        active: pathname?.includes("/dashboard"),
      },
      {
        label: "Invitados",
        href: basePath,
        icon: <UserIcon size={18} />,
        active: pathname === basePath,
      },
      {
        label: "Mensajes",
        href: `${basePath}/quotes`,
        icon: <Mail size={18} />,
        active: pathname?.includes("/quotes"),
      },
    ];
  }, [variant, customNavItems, activeSection, invitationId, pathname]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const handleMobileClose = () => setIsMenuOpen(false);

  // --- RENDER ---
  return (
    <header
      className={cn(
        "border-b transition-colors z-50 sticky top-0 font-sans",
        config.containerClass,
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative z-50",
          variant === "admin" ? "max-w-screen-2xl" : "max-w-screen-xl",
        )}
      >
        {/* IZQUIERDA */}
        <div className="flex items-center">
          <div className="flex items-center">
            {variant === "admin" ? (
              <>
                <Link
                  href="/admin"
                  className="hidden p-1.5 md:flex items-center gap-2 text-sm font-bold text-primary hover:text-gold transition-colors hover:bg-sand-50 rounded-xl"
                  title="Volver a mis eventos"
                >
                  <div className="rounded-lg bg-transparent transition-colors">
                    <CalendarHeart size={20} />
                  </div>
                  <span className="hidden lg:block">Mis Eventos</span>
                </Link>
                <div className="hidden md:block bg-sand-200 w-px h-8 ml-2.5 mr-4" />
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-colors mr-2",
                    config.logoBg,
                    config.logoText,
                  )}
                >
                  {config.logoIcon}
                </div>
              </>
            ) : (
              <JnInvitacionesIcon
                primaryColor="#58624F"
                secondaryColor="rgb(197 166 105 / var(--tw-text-opacity, 1))"
                className="w-48 h-11 cursor-pointer"
                onClick={() => router.replace("/")}
              />
            )}
            <div>
              <h1
                className={cn(
                  "text-lg font-serif font-bold leading-none",
                  config.titleClass,
                )}
              >
                {title || (variant === "admin" ? "Boda X&J" : null)}
              </h1>
              {subtitle || variant === "admin" ? (
                <p
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider mt-0.5",
                    config.subtitleClass,
                  )}
                >
                  Panel de Administración
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {/* CENTRO (Desktop Nav) */}
        {navItems.length > 0 && (
          <nav className="hidden md:flex items-center gap-1 md:flex-1 justify-end px-2">
            {navItems.map((item) => (
              <DesktopNavLink
                key={item.href}
                {...item}
                baseClassName={config.navLinkBase}
                activeClassName={config.navLinkActive}
              />
            ))}
          </nav>
        )}

        {/* DERECHA (Acciones) */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2">
            {variant === "landing" ? (
              <button
                onClick={onCotizar}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-paper rounded-full text-xs font-bold uppercase tracking-widest hover:bg-charcoal-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                <Gem size={14} className="text-gold" />
                <span>Cotizar</span>
              </button>
            ) : (
              <button
                onClick={AuthService.logout}
                className="flex items-center gap-2 text-stone-400 hover:text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              >
                <LogOut size={18} />{" "}
                <span className="hidden lg:block">Cerrar Sesión</span>
              </button>
            )}
          </div>

          <button
            onClick={toggleMenu}
            className={cn(
              "md:hidden flex items-center gap-2 p-2 rounded-lg transition-all active:scale-95 text-stone-600",
              isMenuOpen ? "bg-sand-100" : "hover:bg-sand-100",
            )}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={handleMobileClose}
              className="fixed inset-0 bg-stone-900/10 backdrop-blur-sm z-30 top-16 md:hidden"
            />
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={cn(
                "absolute top-0 pt-16 z-40 w-full border-b shadow-2xl overflow-hidden rounded-b-2xl md:hidden",
                config.mobileBg,
              )}
            >
              <div className="flex flex-col p-4 space-y-2">
                {/* Mobile: Links */}
                {navItems.map((item) => (
                  <MenuItem
                    key={item.href}
                    {...item}
                    onClick={handleMobileClose}
                    activeClass={config.navLinkActive}
                    variant={variant}
                  />
                ))}

                <div className="h-px bg-black/10 my-2" />

                {/* Mobile: Back Button */}
                {variant === "admin" && (
                  <MenuItem
                    icon={config.backButtonIcon}
                    label={config.backButtonText}
                    href={config.backButtonHref}
                    className="hover:bg-sand-50"
                    variant={variant}
                  />
                )}

                {/* Mobile: Actions */}
                <div className="pt-2">
                  {variant === "landing" ? (
                    <>
                      <MenuItem
                        icon={<MessageCircle size={18} />}
                        label="Contactar Soporte"
                        href="#"
                        onClick={handleMobileClose}
                        variant={variant}
                      />
                      <button
                        onClick={() => {
                          onCotizar && onCotizar();
                          handleMobileClose();
                        }}
                        className="flex items-center justify-center gap-3 w-full p-3 rounded-xl text-paper bg-primary hover:bg-charcoal-700 transition-colors font-medium text-sm mt-2 shadow-md"
                      >
                        <Gem size={18} className="text-gold" /> Solicitar
                        Cotización
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={AuthService.logout}
                      className="flex items-center gap-3 w-full p-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-medium text-sm"
                    >
                      <div className="p-2 bg-red-50 text-red-500 rounded-lg">
                        <LogOut size={18} />
                      </div>{" "}
                      Cerrar Sesión
                    </button>
                  )}
                </div>
              </div>
              <div className="bg-black/5 p-3 text-center border-t border-black/5">
                <p className="text-[10px] text-stone-400 font-medium uppercase tracking-widest">
                  {new Date().getFullYear()} • Todos los derechos reservados
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
  baseClassName,
  activeClassName,
}: any) => (
  <Link
    href={href}
    className={cn(
      "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border border-transparent",
      baseClassName,
      active && activeClassName,
    )}
  >
    {icon && (
      <span
        className={cn(
          "transition-colors opacity-70 group-hover:opacity-100",
          active && "opacity-100 text-current",
        )}
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
  onClick,
  activeClass,
  variant,
}: any) => (
  <Link
    href={href}
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 w-full p-3 rounded-xl transition-all group border border-transparent active:scale-[0.98]",
      variant === "landing"
        ? "text-primary hover:bg-primary/5"
        : "text-stone-600 hover:bg-sand-200/20",
      active && (activeClass || "hover:bg-sand-200/20 font-bold"),
      className,
    )}
  >
    {icon && (
      <div
        className={cn(
          "p-2 rounded-lg transition-colors shadow-sm",
          active
            ? "bg-white text-current"
            : "bg-white text-stone-400 group-hover:text-current",
        )}
      >
        {icon}
      </div>
    )}
    <div className="flex-1 text-left flex justify-between">
      <span className="text-sm font-medium">{label}</span>
      {active && <ChevronRight size={14} className="opacity-50" />}
    </div>
  </Link>
);

export default Header;
