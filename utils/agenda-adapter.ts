import { AgendaItem, AgendaEvent, AgendaPriority, AgendaPriorityEn } from '@/utils/types';

const mapPriority = (p?: AgendaPriority): AgendaPriorityEn | undefined => {
  if (!p) return undefined;
  const m: Record<AgendaPriority, AgendaPriorityEn> = {
    Alta: 'high',
    Media: 'medium',
    Baja: 'low',
  };
  return m[p];
};

export const toAgendaEvent = (i: AgendaItem): AgendaEvent => ({
  id: i.id,
  title: i.name,
  startDate: i.until,
  endDate: i.until,
  type: i.type,
  location: i.location,
  participants: i.user ? [{ name: i.user.fullName }] : [],
  // 👇 nuevo
  priority: mapPriority(i.priority),
});
