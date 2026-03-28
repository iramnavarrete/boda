import LandingLayout from "@/features/shared/layouts/landing";

export default function AppCurvedTextured() {
  return (
    <LandingLayout>
      <div className="max-w-4xl mx-auto py-16 px-6 sm:px-8 lg:px-12">
        <h1 className="text-4xl font-bold mb-8">Términos y Condiciones</h1>
        <p className="mb-8 text-sm opacity-70">
          Última actualización: 7 de Marzo, 2026
        </p>

        <div className="space-y-6 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold mb-3">
              1. Aceptación de los Términos
            </h2>
            <p>
              Al acceder y utilizar este sitio web y nuestros servicios, aceptas
              estar legalmente sujeto a estos Términos y Condiciones. Si no
              estás de acuerdo con alguno de estos términos, te pedimos que no
              utilices nuestra plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">2. Uso del Servicio</h2>
            <p>
              Te comprometes a utilizar nuestro sitio web únicamente con fines
              lícitos y de una manera que no infrinja los derechos de terceros,
              ni restrinja o inhiba su uso y disfrute de la plataforma. Queda
              prohibida cualquier conducta que pueda dañar, deshabilitar o
              sobrecargar nuestros servidores.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">
              3. Propiedad Intelectual
            </h2>
            <p>
              Todo el contenido presente en este sitio, incluyendo pero no
              limitado a textos, gráficos, logotipos, imágenes y software, es
              propiedad de la plataforma o de nuestros licenciantes y está
              protegido por las leyes de propiedad intelectual e industrial
              aplicables.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">
              4. Modificaciones de los Términos
            </h2>
            <p>
              Nos reservamos el derecho, a nuestra entera discreción, de
              modificar o reemplazar estos Términos en cualquier momento.
              Cualquier cambio será efectivo inmediatamente tras su publicación
              en esta página. Es tu responsabilidad revisar periódicamente estos
              términos para estar al tanto de las actualizaciones.
            </p>
          </section>
        </div>
      </div>
    </LandingLayout>
  );
}
