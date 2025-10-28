// SettingsScreen: A screen to configure and manage and display the list of services
// (Dienste) for the Dienstplan app. It supports creating, editing, and deleting services,
// choosing a theme, switching time formats (24h vs 12h), and setting a color for each service.
import React, { useContext, useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Switch,
  Animated,
  ScrollView,
  KeyboardAvoidingView,
  Dimensions,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { ServicesContext } from '../servicesContext';
import { useDialog } from '../components/AppDialog';
import { useTheme } from '../ThemeContext';
import { formatTime as formatTimeUtil } from '../utils/formatTime';

export default function SettingsScreen() {
  // Dialog helper: used to show modal dialogs for validation feedback and confirmations
  const { showDialog } = useDialog();
  // Theme related hooks: current mode, a setter, and color values for styling
  const { themeMode, setTheme, colors } = useTheme();
  // Global services context: list of services and actions to mutate them
  const { services, addService, updateService, removeService, is24h, setIs24h } = useContext(ServicesContext);

  // Local form state for creating/editing a service
  const [name, setName] = useState(''); // Dienst name (required)
  const [desc, setDesc] = useState(''); // Optional description
  const [start, setStart] = useState(''); // Start time as string
  const [end, setEnd] = useState(''); // End time as string
  const [color, setColor] = useState('#2E7D32'); // Service color
  const [editId, setEditId] = useState(null); // ID of the currently edited service (null when creating)
  const [pickerVisible, setPickerVisible] = useState(false); // Time picker visibility (Android/iOS handling)
  const [pickerMode, setPickerMode] = useState('start'); // Whether we are editing start or end time
  const [tempTime, setTempTime] = useState(new Date()); // Temporary time value for the picker
  const [showAddForm, setShowAddForm] = useState(false); // Show/hide the add/edit form

  // Responsive column widths based on screen size (Dimensions API)
  const [colWidths, setColWidths] = useState({ left: 180, mid: 120, right: 40 });
  useEffect(() => {
    const update = ({ window }) => {
      const w = window.width;
      // Compute widths with reasonable min/max bounds
      const left = Math.max(120, Math.min(260, Math.floor(w * 0.28)));
      const mid = Math.max(90, Math.min(220, Math.floor(w * 0.36)));
      setColWidths({ left, mid, right: 40 });
    };

    // Initial call
    const initialW = Dimensions.get('window').width;
    update({ window: { width: initialW } });

    // ✅ Moderne Event Subscription
    const subscription = Dimensions.addEventListener('change', update);
    return () => subscription?.remove?.();
  }, []);

  // Preset color options for services. Note: two entries labeled 'Orange' exist in original
  // code; this is retained for backward compatibility with existing data.
  const colorOptions = [
    { name: 'dGreen', color: '#2E7D32' },
    { name: 'Green', color: '#5EAC61' },
    { name: 'dBlue', color: '#1E88E5' },
    { name: 'Blue', color: '#579CD5' },
    { name: 'dViolet', color: '#6A1B9A' },
    { name: 'Violet', color: '#AB47BC' },
    { name: 'Red', color: '#C10404' },
  ];

  // Animations for the add form appearance
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;
  const scrollRef = useRef(null);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: showAddForm ? 1 : 0, duration: 300, useNativeDriver: true }).start();
    Animated.timing(slideAnim, { toValue: showAddForm ? 0 : -20, duration: 300, useNativeDriver: true }).start();
    if (showAddForm && scrollRef.current) {
      setTimeout(() => scrollRef.current.scrollToEnd({ animated: true }), 300);
    }
  }, [showAddForm]);

  // Format a Date object into a time string respecting 24h vs 12h preference
  const formatTime = (date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    if (!is24h) {
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
    }
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  };

  // Convert a time string (e.g., "09:30 AM" or "18:45") into a Date object
  const parseTimeToDate = (timeString) => {
    // Guard against non-string inputs to avoid runtime errors like timeString.split is not a function
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

  // Helper to render a fixed display time cell that respects the current 24h/12h setting
  // Always returns a Text component to avoid "Text strings must be rendered within a Text" errors
  const renderTimeCell = (startStr, endStr) => {
    const s = (typeof startStr === 'string' ? formatTimeUtil(parseTimeToDate(startStr), is24h) : null);
    const e = (typeof endStr === 'string' ? formatTimeUtil(parseTimeToDate(endStr), is24h) : null);
    const content = s && e ? `${s}–${e}` : s ? `(${s})` : e ? `(${e})` : '';
    return <Text style={[styles.serviceText, { color: colors.text }]}>{content}</Text>;
  };

  // When user toggles between 24h and 12h formats, update global is24h and adjust any existing times
  const toggleFormat = (value) => {
    setIs24h(value);
    if (start) setStart(formatTimeUtil(parseTimeToDate(start), value));
    if (end) setEnd(formatTimeUtil(parseTimeToDate(end), value));
  };

  // Show the time picker for either the start or end time
  const showPicker = (mode) => {
    setPickerMode(mode);
    setTempTime(parseTimeToDate(mode === 'start' ? start : end));
    setPickerVisible(true);
  };

  // Callback when the user picks a time from the DateTimePicker
  const onTimeChange = (event, selectedDate) => {
    if (Platform.OS === 'android') setPickerVisible(false);
    if (selectedDate) {
      const formatted = formatTimeUtil(selectedDate, is24h);
      if (pickerMode === 'start') setStart(formatted);
      else setEnd(formatted);
    }
  };

  // Helpers for validation and sanitization
  const toMinutes = (t) => {
    if (typeof t !== 'string' || !t) return null;
    // Support 24h format HH:MM
    let m = t.match(/^(\d{1,2}):(\d{2})$/);
    if (m) {
      const hh = parseInt(m[1], 10);
      const mm = parseInt(m[2], 10);
      if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;
      return hh * 60 + mm;
    }
    // Support 12h format HH:MM AM/PM
    m = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (m) {
      let hh = parseInt(m[1], 10);
      const mm = parseInt(m[2], 10);
      const modifier = m[3].toUpperCase();
      if (mm < 0 || mm > 59 || hh < 1 || hh > 12) return null;
      if (modifier === 'PM' && hh !== 12) hh += 12;
      if (modifier === 'AM' && hh === 12) hh = 0;
      return hh * 60 + mm;
    }
    return null;
  };

  // Ensure color is a valid hex color in #RRGGBB format
  const sanitizeColor = (c) => {
    if (!c) return '#2E7D32';
    let val = c.trim();
    if (!val.startsWith('#')) val = '#' + val;
    if (/^#[0-9A-Fa-f]{3}$/.test(val)) {
      const r = val[1], g = val[2], b = val[3];
      val = `#${r}${r}${g}${g}${b}${b}`;
    }
    val = val.toUpperCase();
    if (!/^#[0-9A-F]{6}$/.test(val)) {
      val = '#2E7D32';
    }
    return val;
  };

  // ✅ Save or update a Dienst (service)
  const handleSave = () => {
    // Validate name
    if (!name.trim()) {
      showDialog('Fehler', 'Bitte gib einen Namen für den Dienst ein.');
      return;
    }
    // Validate times - require both start and end for new services
    if (!start.trim() || !end.trim()) {
      showDialog('Fehler', 'Bitte gib sowohl Start- als auch Endzeit ein.');
      return;
    }

    // Sanitize color
    const sanitizedColor = sanitizeColor(color);

    if (editId) {
      updateService(editId, { name, desc, start, end, color: sanitizedColor });
      showDialog('Gespeichert', 'Dienst aktualisiert ✔️');
    } else {
      addService({ name, desc, start, end, color: sanitizedColor });
      showDialog('Gespeichert', 'Neuer Dienst hinzugefügt ✅');
    }

    resetForm();
  };

  // Formular zurücksetzen
  // Reset all fields of the add/edit form to their initial state
  const resetForm = () => {
    setName('');
    setDesc('');
    setStart('');
    setEnd('');
    setColor('#2E7D32');
    setEditId(null);
    setShowAddForm(false);
  };

  // 🔹 Dienst bearbeiten (populate form with existing data for editing)
  const handleEdit = (service) => {
    setEditId(service.id);
    setName(service.name);
    setDesc(service.desc || '');
    setStart(service.start || '');
    setEnd(service.end || '');
    setColor(sanitizeColor(service.color || '#2E7D32'));
    setShowAddForm(true);
  };

  // Confirmation dialog before deleting a service
  const confirmDelete = (id, serviceName) => {
    showDialog(
      'Dienst löschen?',
      `Möchtest du "${serviceName}" wirklich löschen?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        { text: 'Löschen', style: 'destructive', onPress: () => removeService(id) },
      ]
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.scrollContainer, { backgroundColor: colors.background }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <Text style={[styles.title, { color: colors.text }]}>Einstellungen</Text>

          {/* Theme Auswahl */}
          <View style={{ marginBottom: 15 }}>
            <Text style={[styles.label, { color: colors.text }]}>Theme</Text>
            <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
              <Picker
                selectedValue={themeMode}
                onValueChange={(value) => setTheme(value)}
                style={{ color: colors.text }}
                dropdownIconColor={colors.text}
              >
                <Picker.Item label="System" value="system" />
                <Picker.Item label="Hell" value="light" />
                <Picker.Item label="Dunkelgrau" value="darkgray" />
                <Picker.Item label="Dunkel" value="dark" />
              </Picker>
            </View>
          </View>

          {/* Zeitformat */}
          <View style={styles.formatRow}>
            <Text style={[styles.formatLabel, { color: colors.text }]}>24-Stunden-Format</Text>
            <Switch value={is24h} onValueChange={toggleFormat} />
          </View>

          {/* Formular-Button */}
          <Button
            title={showAddForm ? 'Abbrechen' : 'Neuen Dienst hinzufügen'}
            onPress={() => (showAddForm ? resetForm() : setShowAddForm(true))}
            color={showAddForm ? colors.border : colors.primary}
          />

          {/* Formular */}
          {showAddForm && (
            <Animated.View
              style={[
                styles.addForm,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }], backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <TextInput
                placeholder="Name"
                placeholderTextColor={colors.border}
                value={name}
                onChangeText={setName}
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              />
              <TextInput
                placeholder="Beschreibung (optional)"
                placeholderTextColor={colors.border}
                value={desc}
                onChangeText={setDesc}
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              />

              <View style={{ marginBottom: 15 }}>
                <Text style={[styles.label, { color: colors.text }]}>Farbe</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' }}>
                  {colorOptions.map((option) => (
                    <TouchableOpacity
                      key={option.color}
                      onPress={() => setColor(option.color)}
                      style={{
                        width: 40,
                        height: 40,
                        backgroundColor: option.color,
                        borderRadius: 20,
                        margin: 5,
                        borderWidth: color === option.color ? 3 : 1,
                        borderColor: color === option.color ? '#000' : '#ccc',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 8 }}>
                <TouchableOpacity style={[styles.timeButton, { borderColor: colors.border }]} onPress={() => showPicker('start')}>
                  <Text style={[styles.timeLabel, { color: colors.text }]}>Startzeit</Text>
                  <Text style={[styles.timeValue, { color: colors.text }]}>{start || '--:--'}</Text>
                </TouchableOpacity>
                <Text style={{ marginHorizontal: 10, color: colors.text }}>-</Text>
                <TouchableOpacity style={[styles.timeButton, { borderColor: colors.border }]} onPress={() => showPicker('end')}>
                  <Text style={[styles.timeLabel, { color: colors.text }]}>Endzeit</Text>
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

              <Button title={editId ? 'Änderungen speichern' : 'Dienst speichern'} onPress={handleSave} color={colors.success} />
            </Animated.View>
          )}

          {/* Liste */}
          <View style={{ marginTop: 20 }}>
            {services.length === 0 ? (
              <Text style={{ color: colors.text, textAlign: 'center' }}>Noch keine Dienste vorhanden</Text>
            ) : (
              services.map((item) => (
                <TouchableOpacity key={item.id} onPress={() => handleEdit(item)}>
                  {/* Left: color dot and name (color indicator + label on the left) */}
                  <View style={[styles.serviceItem, { borderBottomColor: colors.border }, editId === item.id && { backgroundColor: colors.card }]}> 
                    <View style={[styles.leftCol, { width: colWidths.left }]}> 
                      <View style={{ width: 20, height: 20, backgroundColor: item.color || '#2E7D32', borderRadius: 10, marginRight: 10 }} />
                      <Text style={[styles.serviceText, { color: colors.text }]} numberOfLines={1} ellipsizeMode="tail">
                        {item.name}
                      </Text>
                    </View>
                    {/* Fixed-width middle column for time range */}
                  <View style={[styles.midCol, { width: colWidths.mid, marginRight: -0.15 * colWidths.mid }]}>
                    {renderTimeCell(item.start, item.end)}
                  </View>
                      {/* Right: Fixed-width delete button */}
                      <TouchableOpacity
                        style={[styles.deleteButton, { width: colWidths.right }]}
                        onPress={() => confirmDelete(item.id, item.name)}
                      >
                        <Text style={{ color: colors.danger, fontSize: 26 }}>−</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1 },
  container: { flex: 1, padding: 10 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  label: { fontSize: 16, marginBottom: 5 },
  pickerContainer: { borderWidth: 1, borderRadius: 8, overflow: 'hidden' },
  formatRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  formatLabel: { fontSize: 16 },
  input: { borderWidth: 1, borderRadius: 8, padding: 8, marginBottom: 10 },
  addForm: { marginVertical: 15, padding: 10, borderWidth: 1, borderRadius: 8 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  timeButton: { flex: 0.48, borderWidth: 1, borderRadius: 8, padding: 10, alignItems: 'center' },
  timeLabel: { fontSize: 14 },
  timeValue: { fontSize: 18, fontWeight: 'bold', marginTop: 4 },
  serviceItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1 },
  leftCol: { width: 180, flexShrink: 0, flexDirection: 'row', alignItems: 'center' },
  midCol: { width: 120, alignItems: 'center' },
  deleteButton: { width: 40, alignItems: 'center', justifyContent: 'center' }, // fixed-width delete button
  serviceText: { fontSize: 16 },
});
