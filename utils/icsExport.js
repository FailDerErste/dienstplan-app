//import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import { Platform } from 'react-native';
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

  // 📂 Datei-Pfad bestimmen
  const filename = `dienstplan_${dayjs().format('YYYYMMDD_HHmm')}.ics`;
  const separator = Platform.OS === 'android' ? '/' : '';
  const filePath = `${RNFS.TemporaryDirectoryPath}${separator}${filename}`;

  // 📝 Datei speichern
  await RNFS.writeFile(filePath, icsContent, 'utf8');

  try {
    // 📅 Datei öffnen — Android fragt automatisch nach Kalender-App
    await FileViewer.open(filePath, { showOpenWithDialog: true });
  } catch (error) {
    console.error('Fehler beim Öffnen der ICS-Datei:', error);
    return filePath;
  }

  return filePath;
}
