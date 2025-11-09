import * as Calendar from 'expo-calendar';
import dayjs from 'dayjs';
import i18n from '../i18n';

export async function exportToCalendar(services, assignments, overrides) {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') throw new Error(i18n.t('exRightsError'));

  const calendars = await Calendar.getCalendarsAsync();
  const defaultCalendar = calendars.find(c => c.allowsModifications) || calendars[0];
  if (!defaultCalendar) throw new Error(i18n.t('exCalNotFound'));

  let added = 0;

  for (const [date, serviceId] of Object.entries(assignments)) {
    const service = services.find(s => s.id === serviceId);
    if (!service) continue;

    const override = overrides?.[date] || {};
    const title = override.name ?? service.name ?? 'Dienst';
    const notes = override.desc ?? service.desc ?? '';
    const startStr = override.start ?? service.start ?? '08:00';
    const endStr = override.end ?? service.end ?? '17:00';

    const start = dayjs(`${date}T${startStr}`).toDate();
    let end = dayjs(`${date}T${endStr}`).toDate();
    // If end time is before start time, set end to next day
    if (end < start) {
      end = dayjs(end).add(1, 'day').toDate();
    }

    await Calendar.createEventAsync(defaultCalendar.id, {
      title,
      notes,
      startDate: start,
      endDate: end,
      timeZone: 'Europe/Berlin',
    });

    added++;
  }

  return added;
}
