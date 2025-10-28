import * as FileSystem from 'expo-file-system/legacy';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

export async function exportToICS(services, assignments, overrides) {
  let icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nCALSCALE:GREGORIAN\nPRODID:-//Dienstplan//DE\n`;

  for (const [date, serviceId] of Object.entries(assignments)) {
    const service = services.find(s => s.id === serviceId);
    if (!service) continue;

    const overrideForDate = overrides?.[date] || null;
    const displayName = overrideForDate?.name ?? service?.name ?? '';
    const displayDesc = overrideForDate?.desc ?? service?.desc ?? '';
    const displayStart = overrideForDate?.start ?? service?.start ?? '';
    const displayEnd = overrideForDate?.end ?? service?.end ?? '';
    let timeRange = '';
    if (displayStart || displayEnd) {
      const s = displayStart ?? '';
      const e = displayEnd ?? '';
      timeRange = ` (${s}${s && e ? '-' : ''}${e})`;
    }
    const start = dayjs(date).hour(0).minute(0);
    const end = start.add(1, 'day');

    const summary = `${displayName}${timeRange}`;
    icsContent += [
      'BEGIN:VEVENT',
      `UID:${serviceId}@dienstplan`,
      `DTSTAMP:${dayjs().utc().format('YYYYMMDDTHHmmss')}Z`,
      `DTSTART;VALUE=DATE:${start.format('YYYYMMDD')}`,
      `DTEND;VALUE=DATE:${end.format('YYYYMMDD')}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${displayDesc}`,
      'END:VEVENT',
    ].join('\n') + '\n';
  }

  icsContent += 'END:VCALENDAR';

  // Datei speichern
  const fileUri = FileSystem.documentDirectory + `dienstplan_${dayjs().format('YYYYMMDD_HHmm')}.ics`;
  await FileSystem.writeAsStringAsync(fileUri, icsContent, { encoding: FileSystem.EncodingType.UTF8 });

  return fileUri;
}
