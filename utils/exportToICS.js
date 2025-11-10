//import RNFS muss für die Benützung auf EXPO deaktiviert sein, siehe Erklärung weiter unten.
//import * as FileSystem from 'expo-file-system/legacy';
//import * as Sharing from 'expo-sharing';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import { Platform, Share } from 'react-native';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import i18n from '../i18n';
dayjs.extend(utc);

export async function exportToICS(services, assignments, overrides) {
  // 📅 ICS-Datei Inhalt erstellen
  let icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nCALSCALE:GREGORIAN\nPRODID:-//Dienstplan//DE\n`;

  for (const [date, serviceId] of Object.entries(assignments)) {
    const service = services.find(s => s.id === serviceId);
    if (!service) continue;

    const overrideForDate = overrides?.[date] || {};
    const displayName = overrideForDate.name ?? service.name ?? '';
    const displayDesc = overrideForDate.desc ?? service.desc ?? '';
    const displayStart = overrideForDate.start ?? service.start ?? '';
    const displayEnd = overrideForDate.end ?? service.end ?? '';

    let dtStart, dtEnd, summary;
    if (displayStart && displayEnd) {
      // Parse times and create timed events
      const eventStart = dayjs(`${date} ${displayStart}`).utc();
      let eventEnd = dayjs(`${date} ${displayEnd}`).utc();
      // If end time is before start time, set end to next day
      if (eventEnd.isBefore(eventStart)) {
        eventEnd = eventEnd.add(1, 'day');
      }
      dtStart = `DTSTART:${eventStart.format('YYYYMMDDTHHmmss')}Z`;
      dtEnd = `DTEND:${eventEnd.format('YYYYMMDDTHHmmss')}Z`;
      summary = displayName;
    } else {
      // Fallback to all-day events if no times
      const start = dayjs(date).hour(0).minute(0);
      const end = start.add(1, 'day');
      dtStart = `DTSTART;VALUE=DATE:${start.format('YYYYMMDD')}`;
      dtEnd = `DTEND;VALUE=DATE:${end.format('YYYYMMDD')}`;
      let timeRange = '';
      if (displayStart || displayEnd) {
        const s = displayStart ?? '';
        const e = displayEnd ?? '';
        timeRange = ` (${s}${s && e ? '-' : ''}${e})`;
      }
      summary = `${displayName}${timeRange}`;
    }

    icsContent += [
      'BEGIN:VEVENT',
      `UID:${serviceId}_${date.replace(/-/g, '')}@dienstplan`,
      `DTSTAMP:${dayjs().utc().format('YYYYMMDDTHHmmss')}Z`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${displayDesc}`,
      dtStart,
      dtEnd,
      'SEQUENCE:0',
      'STATUS:CONFIRMED',
      'TRANSP:OPAQUE',
      'END:VEVENT',
    ].join('\n') + '\n';
  }


  icsContent += 'END:VCALENDAR';

  {/*
    Kalender abspeichern.
    Der Code von // 📂 Datei-Pfad bestimmen (Codeblock Expo) bis return fileUri; muss in der Expo Umgebung benutzt werden.
    Der Code von // 📂 Datei-Pfad bestimmen (Codeblock .apk) bis return filePath; muss für das erstellen der APP (.apk/.ipa) benutzt werden.

    In der Expo umgebung wird die .ics Datei am besten sich selbst per WhatsApp, E-Mail etc. geschickt,
    und kann danach von dort aus in den Kalender importiert werden. Mit diesem ersten Code-Block kann die Datei
    leider nicht automatisch in die Kalender-App importiert werden, da das mit Expo nicht möglich ist.

    Mit dem zweiten Code-Block (der für die App ist) wird die Datei automatisch in der Kalender-App geöffnet, dies
    funktioniert aber nur in der gebauten App, nicht in der Expo Umgebung. Der Grund liegt am RNFS Modul, welches in
    dieser Datei zuoberst importiert wird, aber in der Expo Umgebung einen Fehler wirft.

    Für die Entwicklung in Expo also den ersten Block und die folgenden 2 Import-Zeilen zuoberst aktivieren:
    import * as FileSystem from 'expo-file-system/legacy';
    import * as Sharing from 'expo-sharing';
    
    Und für die gebaute App den zweiten Block und die folgenden 2 Import-Zeilen zuoberst aktivieren:
    import RNFS from 'react-native-fs';
    import FileViewer from 'react-native-file-viewer';
  */}

  {/*// 📂 Datei-Pfad bestimmen (Codeblock Expo)
  const dirUri = FileSystem.documentDirectory + 'dienstplan_exports/';
  const dirInfo = await FileSystem.getInfoAsync(dirUri);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(dirUri, { intermediates: true });
  }

  const filename = `${i18n.t('exFileName')}_${dayjs().format('YYYYMMDD_HHmm')}.ics`;
  const fileUri = dirUri + filename;

  // 📝 Datei speichern
  await FileSystem.writeAsStringAsync(fileUri, icsContent, { encoding: FileSystem.EncodingType.UTF8 });

  // 📤 Datei teilen oder öffnen
  if (Platform.OS === 'android' && await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, {
      mimeType: 'text/calendar',
      dialogTitle: i18n.t('exFileOpen'),
    });
  }

  return fileUri;*/}

  // 📂 Datei-Pfad bestimmen (Codeblock .apk)
  const filename = `${i18n.t('exFileName')}_${dayjs().format('YYYYMMDD_HHmm')}.ics`;
  const separator = Platform.OS === 'android' ? '/' : '';
  const filePath = `${RNFS.TemporaryDirectoryPath}${separator}${filename}`;

  // 📝 Datei speichern
  await RNFS.writeFile(filePath, icsContent, 'utf8');

  try {
    // 📅 Datei öffnen — Android fragt automatisch nach Kalender-App
    await FileViewer.open(filePath, { showOpenWithDialog: true });
  } catch (error) {
    console.error(i18n.t('exFileError'), error);
    return filePath;
  }

  return filePath;
}
