import LandingLayout from "@/features/shared/layouts/landing";

export default function AppCurvedTextured() {
  return (
    <LandingLayout>
      <div className="max-w-4xl mx-auto py-16 px-6 sm:px-8 lg:px-12">
        <h1 className="text-4xl font-bold mb-8">Política de Privacidad</h1>
        <p className="mb-8 text-sm opacity-70">
          Última actualización: 7 de Marzo, 2026
        </p>

        <div className="space-y-6 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold mb-3">
              1. Información que recopilamos
            </h2>
            <p>
              Recopilamos la información que nos proporcionas directamente al
              interactuar con nuestra plataforma, como tu nombre, dirección de
              correo electrónico y cualquier otro dato necesario para crear tu
              cuenta y brindarte nuestros servicios.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">
              2. Uso de la información
            </h2>
            <p>
              Utilizamos los datos recopilados para operar, mantener y mejorar
              nuestra aplicación, personalizar tu experiencia, procesar
              transacciones y enviarte notificaciones importantes relacionadas
              con el servicio o soporte técnico.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">
              3. Seguridad de los datos
            </h2>
            <p>
              Nos tomamos muy en serio la seguridad de tu información.
              Implementamos medidas técnicas y organizativas adecuadas para
              proteger tus datos personales contra el acceso no autorizado, la
              alteración, divulgación o destrucción. Sin embargo, ningún método
              de transmisión por Internet es 100% seguro.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">
              4. Cambios en esta política
            </h2>
            <p>
              Nos reservamos el derecho de actualizar o modificar esta Política
              de Privacidad en cualquier momento. Te notificaremos sobre cambios
              significativos actualizando la fecha de "Última actualización" en
              la parte superior de esta página.
            </p>
          </section>
        </div>
      </div>
    </LandingLayout>
  );
}
