import React, { useMemo, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { useSeatingStore, Family, Guest } from './stores/useSeatingStore';
import { X, GripVertical, Users, CheckCircle2, Edit2, RotateCcw } from 'lucide-react';

function DraggableGuest({ guest, family, isAssigned, tableId, tableAlias }: { guest: Guest; family: Family; isAssigned: boolean; tableId?: string; tableAlias?: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `guest-${guest.id}`,
    // Pasamos familyName y el index para usarlos en el overlay
    data: { type: 'guest', guest: { ...guest, familyName: family.name, index: family.guests.findIndex(g => g.id === guest.id) } },
    disabled: isAssigned
  });
  
  const updateGuestName = useSeatingStore(state => state.updateGuestName);
  const removeGuestFromTable = useSeatingStore(state => state.removeGuestFromTable);

  const [isEditing, setIsEditing] = useState(false);
  const [nameValue, setNameValue] = useState(guest.name || '');

  const guestIndex = family.guests.findIndex(g => g.id === guest.id);
  const defaultName = `${family.name} #${guestIndex + 1}`;
  const displayName = guest.name || defaultName;

  const handleSave = () => {
    updateGuestName(family.id, guest.id, nameValue);
    setIsEditing(false);
  };

  return (
    <div 
      className={`relative flex items-center gap-2 p-2 rounded-lg border text-sm transition-colors group
        ${isAssigned ? 'bg-transparent border-transparent opacity-70 cursor-default' : 'bg-white border-[#EBE5DA] cursor-grab hover:border-[#C5A669]'}
      `}
      style={{ opacity: isDragging ? 0.3 : (isAssigned ? 0.7 : 1) }}
    >
      <div ref={setNodeRef} {...attributes} {...listeners} className="flex items-center gap-2 flex-1 min-w-0">
        <GripVertical size={14} className={isAssigned ? 'opacity-0' : 'text-[#EBE5DA]'} />
        <div className="flex flex-col flex-1 min-w-0">
          <span className={`truncate font-medium ${guest.name ? 'text-[#2C2C29]' : 'text-[#A8A29E] italic'}`}>
            {displayName}
          </span>
        </div>
      </div>
      
      {/* Botones de acción flotantes al hacer hover */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 rounded px-1 absolute right-2">
        {!isEditing && (
           <button onClick={() => { setIsEditing(true); setNameValue(guest.name || ''); }} className="p-1.5 hover:bg-[#F9F7F2] rounded text-[#C5A669] shadow-sm bg-white border border-[#EBE5DA]" title="Asignar nombre al asiento">
             <Edit2 size={12} />
           </button>
        )}
        {isAssigned && tableId && (
           <button onClick={() => removeGuestFromTable(tableId, guest.id)} className="p-1.5 bg-white border border-[#EBE5DA] shadow-sm hover:bg-red-50 rounded text-red-400 hover:text-red-600" title="Desasignar de la mesa">
             <RotateCcw size={12} />
           </button>
        )}
      </div>

      {isEditing && (
        <div className="absolute inset-0 bg-white p-2 rounded-lg border border-[#C5A669] flex items-center gap-2 z-10 shadow-md">
          <input 
            autoFocus
            className="flex-1 text-xs border border-[#EBE5DA] rounded px-2 py-1 outline-none focus:border-[#C5A669]"
            value={nameValue}
            onChange={e => setNameValue(e.target.value)}
            placeholder={defaultName}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
          />
          <button onClick={handleSave} className="text-[10px] uppercase font-bold tracking-wider bg-[#C5A669] text-white px-2 py-1 rounded">Ok</button>
          <button onClick={() => setIsEditing(false)} className="text-[#A8A29E] hover:text-red-500"><X size={14}/></button>
        </div>
      )}
      
      {isAssigned && tableAlias && !isEditing && (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-green-50 text-green-700 flex items-center gap-1 border border-green-200 shrink-0">
          <CheckCircle2 size={10} />
          {tableAlias}
        </span>
      )}
    </div>
  );
}

function DraggableFamily({ family }: { family: Family }) {
  const elements = useSeatingStore(state => state.elements);
  const removeFamilyFromTable = useSeatingStore(state => state.removeFamilyFromTable);
  
  const assignedCount = useMemo(() => {
    let count = 0;
    family.guests.forEach(g => {
      if (elements.some(el => el.assignedSeats.includes(g.id))) count++;
    });
    return count;
  }, [family, elements]);

  const allAssigned = assignedCount === family.guests.length;
  const anyAssigned = assignedCount > 0;

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `family-${family.id}`,
    data: { type: 'family', family },
    disabled: allAssigned
  });

  return (
    <div className="mb-6 bg-[#FDFBF7] rounded-xl border border-[#EBE5DA] overflow-hidden flex flex-col min-h-0">
      <div 
        className={`p-3 bg-white border-b border-[#EBE5DA] flex items-center gap-2 transition-colors group shrink-0
          ${allAssigned ? 'cursor-default opacity-80' : 'cursor-grab hover:bg-[#F9F7F2]'}
        `}
        style={{ opacity: isDragging ? 0.3 : 1 }}
      >
        <div ref={setNodeRef} {...attributes} {...listeners} className="flex-1 flex items-center gap-2 min-w-0">
          <GripVertical size={16} className={allAssigned ? 'opacity-0' : 'text-[#A8A29E] shrink-0'} />
          <div className="flex-1 flex flex-col min-w-0">
            <span className="font-serif text-[15px] font-semibold text-[#2C2C29] truncate">{family.name}</span>
            <span className="text-[10px] text-[#A8A29E] uppercase tracking-wider font-bold mt-0.5">
              {assignedCount}/{family.guests.length} Asignados
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
           {anyAssigned && (
             <button onClick={() => removeFamilyFromTable(family.id)} className="p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 text-red-400 hover:text-red-600 rounded" title="Desasignar toda la familia de las mesas">
                <RotateCcw size={14} />
             </button>
           )}
           <div className="flex items-center gap-1 px-2 py-1 bg-[#F9F7F2] rounded-md border border-[#EBE5DA]">
              <Users size={14} className={allAssigned ? 'text-green-600' : 'text-[#C5A669]'} />
              <span className="text-[10px] font-bold text-[#5A5A5A]">{family.guests.length}</span>
           </div>
        </div>
      </div>

      <div className={`p-2 space-y-1 ${isDragging ? 'hidden' : 'block'}`}>
        {family.guests.map(guest => {
          const table = elements.find(el => el.assignedSeats.includes(guest.id));
          return (
            <DraggableGuest 
              key={guest.id} 
              guest={guest} 
              family={family}
              isAssigned={!!table} 
              tableId={table?.id}
              tableAlias={table?.alias}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function GuestAssignmentSidebar({ onClose }: { onClose?: () => void }) {
  const families = useSeatingStore(state => state.families);
  const elements = useSeatingStore(state => state.elements);

  const stats = useMemo(() => {
    let total = 0, assigned = 0;
    families.forEach(f => {
      total += f.guests.length;
      f.guests.forEach(g => {
        if (elements.some(el => el.assignedSeats.includes(g.id))) assigned++;
      });
    });
    return { total, assigned, unassigned: total - assigned };
  }, [families, elements]);

  return (
    <div className="flex flex-col h-full w-full bg-white flex-1 min-h-0">
      <div className="p-4 border-b border-[#EBE5DA] bg-[#FDFBF7] shrink-0">
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-col">
            <h2 className="font-serif text-lg text-[#2C2C29]">Invitados</h2>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#A8A29E]">{stats.total} Total</span>
          </div>
          {onClose && <button onClick={onClose} className="lg:hidden p-1 bg-white rounded-md border border-[#EBE5DA]"><X size={16} className="text-[#A8A29E]" /></button>}
        </div>
        
        <div className="flex gap-2 text-xs font-medium">
          <div className="flex-1 bg-green-50/50 text-green-700 py-2 px-3 rounded-lg flex flex-col border border-green-200">
             <span className="text-[10px] uppercase font-bold text-green-600/80">Asignados</span>
             <span className="text-lg font-serif">{stats.assigned}</span>
          </div>
          <div className="flex-1 bg-orange-50/50 text-orange-700 py-2 px-3 rounded-lg flex flex-col border border-orange-200">
             <span className="text-[10px] uppercase font-bold text-orange-600/80">Pendientes</span>
             <span className="text-lg font-serif">{stats.unassigned}</span>
          </div>
        </div>
      </div>

      <div className="p-4 overflow-y-auto flex-1 w-full pb-10">
        {families.map(family => (
           <DraggableFamily key={family.id} family={family} />
        ))}
      </div>
    </div>
  );
}
