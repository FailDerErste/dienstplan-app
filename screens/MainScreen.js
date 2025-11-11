import { SafeAreaView } from 'react-native-safe-area-context';
import { useContext, useState, useRef, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TextInput, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatTime as formatTimeUtil } from '../utils/formatTime';
import { ServicesContext } from '../servicesContext';
import CalendarMonth from '../components/CalendarMonth';
import ServiceList from '../components/ServiceList';
import { useDialog } from '../components/AppDialog';
import { useTheme } from '../ThemeContext';
import { useTranslation } from 'react-i18next';
let _intentLauncherModule = null;

async function getIntentLauncherModule() {
  if (_intentLauncherModule !== null) return _intentLauncherModule;
  try {
    const mod = await import('expo-intent-launcher');
    _intentLauncherModule = mod;
    return mod;
  } catch (e) {
    _intentLauncherModule = null;
    return null;
  }
}

export default function MainScreen({ navigation }) {
  const { t } = useTranslation();
  const { services, assignments, assignToDay, removeFromDay, clearAll, is24h, updateService, overrides, setDayOverride, removeDayOverride, validateAll } = useContext(ServicesContext);
  const { showDialog, closeDialog } = useDialog();
  const { colors } = useTheme();

  const [selectedService, setSelectedService] = useState(null);
  const isExporting = useRef(false);

  // Edit form state per date
  const [editForms, setEditForms] = useState({}); // { '2025-10-14': { name, desc, start, end } }
  const [editDateIso, setEditDateIso] = useState(null);
  const [editDialogKey, setEditDialogKey] = useState(0);

  // Startup validation
  useEffect(() => {
    const issues = validateAll();
    if (issues.length > 0) {
      const message = `${t('msValidationText1')}\n\n${issues.join('\n')}\n\n${t('msValidationText2')}`;
      showDialog(t('msValidationTitle'), message);
    }
  }, []);

  // Export list with per-date overrides
  const getExportList = () => {
    if (Object.keys(assignments).length === 0) return '';

    const sortedDates = Object.keys(assignments).sort();
    return sortedDates
      .map((date) => {
        const serviceId = assignments[date];
        const service = services.find((s) => s.id === serviceId);
        const over = overrides?.[date] ?? null;
        const isOverride = !!over;
        const displayName = over?.name ?? (service ? service.name : t('msExportNoName'));
        const displayStart = formatTimeDisplay(over?.start ?? service?.start ?? '');
        const displayEnd = formatTimeDisplay(over?.end ?? service?.end ?? '');
        const truncatedName = displayName.length > 6 ? displayName.substring(0, 5) + '..' : displayName;
        const overrideTag = isOverride ? '' : '';
        return `${formatDate(date)}   •   ${displayStart} - ${displayEnd}   •   ${truncatedName}${overrideTag}`;
      })
      .join('\n');
  };

  // helper: formatTimeDisplay
  function formatTimeDisplay(timeStr) {
    return formatTimeUtil(timeStr, is24h);
  }

  // Helper to convert time string to Date object for DateTimePicker
  const parseTimeToDate = (timeString) => {
    if (typeof timeString !== 'string' || !timeString) return new Date();
    let date = new Date();
    let [time, modifier] = timeString.split(' ');
    let [hours, minutes] = time.split(':').map((n) => parseInt(n, 10));
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    date.setHours(hours);
    date.setMinutes(minutes || 0);
    return date;
  };

  // 📅 Hölder: format date
  function formatDate(isoDate) {
    const [year, month, day] = isoDate.split('-');
    return `${day}.${month}.${year}`;
  }

  // Dialog helper to show service details
  const showServiceDetailsDialog = (svc, dateIso) => {
    const overrideForDate = dateIso ? overrides?.[dateIso] : null;
    const displayName = overrideForDate?.name ?? (svc?.name ?? '');
    const displayDesc = overrideForDate?.desc ?? (svc?.desc ?? '');
    const displayStart = overrideForDate?.start ?? (svc?.start ?? '');
    const displayEnd = overrideForDate?.end ?? (svc?.end ?? '');
    const start = formatTimeDisplay(displayStart);
    const end = formatTimeDisplay(displayEnd);
    const message = `${t('service')} ${displayName}\n${t('msServiceDetailsDesc')} ${displayDesc}\n${t('msServiceDetailsTime')} ${start} - ${end}`;
    showDialog(t('msServiceDetails'), message, [
      { text: t('btnClose'), style: 'cancel' },
      { text: t('msServiceDetailsBtn'), onPress: () => showEditServiceDialog(svc, dateIso) },
    ]);
  };

  // Hydration helper to rebuild editForm on each open
  const hydrateEditFormForDialog = (dateIsoArg, svcArg) => {
    const dateOverrideLocal = dateIsoArg ? overrides?.[dateIsoArg] : null;
    if (dateOverrideLocal) return dateOverrideLocal;
    return { name: svcArg?.name, desc: svcArg?.desc || '', start: svcArg?.start || '', end: svcArg?.end || '' };
  };
  const ServiceEditor = ({ initialName, initialDesc, initialStart, initialEnd, onSave }) => {
    const { colors } = useTheme();
    const [name, setName] = useState(initialName || '');
    const [desc, setDesc] = useState(initialDesc || '');
    const [start, setStart] = useState(initialStart || '');
    const [end, setEnd] = useState(initialEnd || '');
    const [pickerVisible, setPickerVisible] = useState(false);
    const [pickerMode, setPickerMode] = useState('start');
    const [tempTime, setTempTime] = useState(new Date());

    useEffect(() => {
      onSave({ name, desc, start, end });
    }, [name, desc, start, end, onSave]);

    const showPicker = (mode) => {
      setPickerMode(mode);
      setTempTime(parseTimeToDate(mode === 'start' ? start : end));
      setPickerVisible(true);
    };

    const onTimeChange = (event, selectedDate) => {
      if (Platform.OS === 'android') setPickerVisible(false);
      if (selectedDate) {
        const formatted = formatTimeUtil(selectedDate, is24h);
        if (pickerMode === 'start') setStart(formatted);
        else setEnd(formatted);
      }
    };

    return (
      <View>
        <TextInput
          placeholder={t('ServiceName')}
          placeholderTextColor={colors.border}
          value={name}
          onChangeText={setName}
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
        />
        <TextInput
          placeholder={t('ServiceDesc')}
          placeholderTextColor={colors.border}
          value={desc}
          onChangeText={setDesc}
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
        />

        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 8 }}>
          <TouchableOpacity style={[styles.timeButton, { borderColor: colors.border }]} onPress={() => showPicker('start')}>
            <Text style={[styles.timeLabel, { color: colors.text }]}>{t('ServiceTimeStart')}</Text>
            <Text style={[styles.timeValue, { color: colors.text }]}>{start || '--:--'}</Text>
          </TouchableOpacity>
          <Text style={{ marginHorizontal: 10, color: colors.text }}>-</Text>
          <TouchableOpacity style={[styles.timeButton, { borderColor: colors.border }]} onPress={() => showPicker('end')}>
            <Text style={[styles.timeLabel, { color: colors.text }]}>{t('ServiceTimeEnd')}</Text>
            <Text style={[styles.timeValue, { color: colors.text }]}>{end || '--:--'}</Text>
          </TouchableOpacity>
        </View>

        {pickerVisible && (
          <DateTimePicker
            value={tempTime}
            mode="time"
            is24Hour={is24h}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onTimeChange}
          />
        )}
      </View>
    );
  };

  // Dialog helper to edit service (with per-date override support)
  const showEditServiceDialog = (svc, dateIso) => {
    setEditDateIso(dateIso);
    // Compute initial values using hydration helper
    const initial = hydrateEditFormForDialog(dateIso, svc);

    // Reset dialog key to force remount
    setEditDialogKey((k) => k + 1);

    let currentForm = { name: '', desc: '', start: '', end: '' };

    const editContent = (
      <ServiceEditor
        initialName={initial.name}
        initialDesc={initial.desc}
        initialStart={initial.start}
        initialEnd={initial.end}
        onSave={(form) => { currentForm = form; }}
      />
    );

    showDialog(
      t('msServiceEditTitle'),
      '',
      [
        { text: t('btnCancel'), style: 'cancel' },
        {
          text: t('msServiceEditBtn'),
          onPress: () => {
            const updatedService = {
              name: currentForm.name,
              desc: currentForm.desc,
              start: currentForm.start,
              end: currentForm.end,
            };
            if (dateIso) {
              setDayOverride(dateIso, updatedService);
            } else {
              updateService(svc.id, updatedService);
            }
            closeDialog();
          },
        },
      ],
      editContent
    );
  };

  const toggleDay = (dayjsDate) => {
    const iso = dayjsDate.format('YYYY-MM-DD');
    const assignedServiceId = assignments[iso];
    if (selectedService) {
      if (assignedServiceId && assignedServiceId === selectedService.id) {
        // delete only if the same service is currently selected
        removeFromDay(iso);
      } else {
        // assign to the currently selected service
        assignToDay(iso, selectedService.id);
      }
    } else {
      // No service selected: if there is already an assignment, show details rather than delete
      if (assignedServiceId) {
        const svc = services.find((s) => s.id === assignedServiceId);
        if (svc) showServiceDetailsDialog(svc, iso);
      }
    }
  };

  const handleExport = () => {
    if (isExporting.current) return;
    if (Object.keys(assignments).length === 0) {
      showDialog(t('msExportTitle2'), t('msExportText2'));
      return;
    }

    const message = `${t('msExportText1')}\n\n${getExportList()}`;

    showDialog(
      t('msExportTitle'),
      message,
      [
        { text: t('btnCancel'), style: 'cancel', onPress: () => { if (isExporting.current) return; isExporting.current = false; } },
        {
          text: t('msExportBtn'),
          onPress: async () => {
            if (isExporting.current) return;
            isExporting.current = true;

            try {
            if (Platform.OS === 'ios') {
              const { exportToCalendar } = await import('../utils/exportToCalendar');
              const count = await exportToCalendar(services, assignments, overrides);
              showDialog(t('msExportComplete'), `${count} ${t('msExportCompleteIOS')}`);
            } else {
              const { exportToICS } = await import('../utils/exportToICS');
              const uri = await exportToICS(services, assignments, overrides);
              showDialog(t('msExportComplete'), `${t('msExportCompleteAndroid')}\n${uri}`);
            }
          } catch (error) {
            console.error('Export-Fehler:', error);
            showDialog(t('msExportErrorTitle'), t('msExportErrorText'));
          } finally {
            isExporting.current = false;
          }
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    if (Object.keys(assignments).length === 0) {
      showDialog(t('msClearTitle2'), t('msClearText2'));
      return;
    }

    showDialog(
      t('msClearTitle1'),
      t('msClearText1'),
      [
        { text: t('btnCancel'), style: 'cancel' },
        { text: t('msClearBtn'), style: 'destructive', onPress: clearAll },
      ]
    );
  };

  // Render
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: 120 }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{t('msTitle2')}</Text>
          <Button
            title={t('settingsTitle')}
            onPress={() => navigation.navigate('Settings')}
            color={colors.primary}
          />
        </View>

        {/* Kalender */}
        <CalendarMonth
          assignments={assignments}
          services={services}
          onDayPress={toggleDay}
          calendarTheme={{
            textColor: colors.text,
            weekdayColor: colors.text,
            todayBorderColor: colors.primary,
            todayTextColor: colors.primary,
          }}
        />

        {/* Dienstliste */}
        <ServiceList
          services={services}
          selectedService={selectedService}
          setSelectedService={setSelectedService}
        />

        {/* Bottom action bar (fixed at bottom) */}
        <View style={styles.bottomBar}>
          <View style={styles.bottomButton}>
            <Button title={t('msClear')} onPress={handleClearAll} color={colors.danger} />
          </View>
          <View style={styles.bottomButton}>
            <Button title={t('msExport')} onPress={handleExport} color={colors.primary} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 20, fontWeight: 'bold' },
  buttons: { display: 'none' },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 30, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16 },
  bottomButton: { flex: 1, paddingHorizontal: 50 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  timeButton: { flex: 0.48, borderWidth: 1, borderRadius: 8, padding: 10, alignItems: 'center' },
  timeLabel: { fontSize: 14 },
  timeValue: { fontSize: 18, fontWeight: 'bold', marginTop: 4 },
});
