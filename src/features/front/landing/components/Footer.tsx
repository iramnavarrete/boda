import HeartIcon from "@/icons/heart-icon";
import JnInvitacionesIcon from "@/icons/jn-invitaciones-icon";
import theme from "@/utils/theme";
import { IconBrandFacebook, IconBrandInstagram } from "@tabler/icons-react";
import { useRouter } from "next/router";

const Footer: React.FC = () => {
  const router = useRouter();
  return (
    <footer className="bg-primary text-paper relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 pt-16 pb-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
          <div className="md:col-span-2 space-y-4 md:pr-32">
            <JnInvitacionesIcon
              primaryColor={theme.colors.paper}
              secondaryColor={theme.colors.gold.DEFAULT}
              onClick={() => router.replace("/")}
              className="w-48 h-11 cursor-pointer"
            />
            <p className="text-paper/80 text-sm font-light leading-relaxed">
              Invitaciones digitales diseñadas para hacer tu evento inolvidable
              desde la primera impresión.
            </p>
            <div className="flex gap-3 mt-4">
              <a
                href="#"
                className="w-8 h-8 rounded-full border border-paper/20 flex items-center justify-center hover:text-primary hover:bg-paper transition-all"
              >
                <IconBrandInstagram size={16} />
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-full border border-paper/20 flex items-center justify-center hover:text-primary hover:bg-paper transition-all"
              >
                <IconBrandFacebook size={16} />
              </a>
            </div>
          </div>

          <div>
            <h5 className="font-bold uppercase tracking-widest text-gold text-xs mb-6">
              Enlaces rápidos
            </h5>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="/#demo" className="hover:text-gold transition-colors">
                  Características
                </a>
              </li>
              <li>
                <a
                  href="/#dashboard"
                  className="hover:text-gold transition-colors"
                >
                  Gestión inteligente
                </a>
              </li>
              <li>
                <a
                  href="/#paquetes"
                  className="hover:text-gold transition-colors"
                >
                  Precios
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 3: Compañía */}
          <div>
            <h5 className="font-bold uppercase tracking-widest text-gold text-xs mb-6">
              Compañía
            </h5>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="hover:text-gold transition-colors">
                  Sobre Nosotros
                </a>
              </li>
              <li>
                <a href="/admin" className="hover:text-gold transition-colors">
                  Acceso Clientes
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/+526142537718?text=${encodeURIComponent("Hola me comunico para saber màs información sobre las invitaciones digitales.")}`}
                  target="_blank"
                  className="hover:text-gold transition-colors"
                >
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 4: Legal / Contacto Rápido */}
          <div>
            <h5 className="font-bold uppercase tracking-widest text-gold text-xs mb-6">
              Legal
            </h5>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="privacy" className="hover:text-gold transition-colors">
                  Privacidad
                </a>
              </li>
              <li>
                <a
                  href="terms-and-conditions"
                  className="hover:text-gold transition-colors"
                >
                  Términos
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-paper/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>© {new Date().getFullYear()}. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1">
            Hecho con{" "}
            <span>
              <HeartIcon className="w-4 h-4 text-gold" />
            </span>{" "}
            en México
          </p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
