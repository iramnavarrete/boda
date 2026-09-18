"use client";

/**
 * Header de la página "Actividad de Invitados".
 *
 * Estilo empalmado con `pages/admin/invitations/[invitationId]/quotes`
 * (ver `FamilyQuotesList.tsx:111-123`): tipografía serif grande,
 * palabra acento en gold-500 italic, subtítulo muted light.
 */
const ActivityHeader: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-1 mb-4">
      <div className="max-w-2xl">
        <h2 className="text-4xl md:text-5xl font-serif text-primary mb-3 leading-tight">
          Actividad de{" "}
          <span className="italic text-gold-500 font-light">Invitados</span>
        </h2>
        <p className="text-[#8F8F8B] text-base md:text-lg font-light leading-relaxed">
          Visualiza y da seguimiento a todas las actividades de tus invitados.
        </p>
      </div>
    </div>
  );
};

export default ActivityHeader;