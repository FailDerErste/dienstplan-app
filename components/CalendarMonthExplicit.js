import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import dayjs from 'dayjs';
import 'dayjs/locale/de';

dayjs.locale('de');

export default function CalendarMonth({ assignments, services, onDayPress, calendarTheme }) {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const today = dayjs();

  // Theme helpers (explicit prop overrides default colors)
  const ct = calendarTheme || {};
  const weekdayColor = ct.weekdayColor || '#777';
  const todayBorderColor = ct.todayBorderColor || '#3498db';
  const todayTextColor = ct.todayTextColor || '#3498db';
  const dayTextColor = ct.textColor || '#000';

  const startOfMonth = currentMonth.startOf('month');
  const endOfMonth = currentMonth.endOf('month');
  const daysInMonth = endOfMonth.date();

  // Montag = 0
  const firstDayOfWeek = (startOfMonth.day() + 6) % 7;
  const weeks = [];
  let day = 1 - firstDayOfWeek;

  while (day <= daysInMonth) {
    const week = [];
    for (let i = 0; i < 7; i++, day++) {
      const date = currentMonth.date(day); // dayjs instance
      const iso = date.format('YYYY-MM-DD');
      const isCurrentMonth = day > 0 && day <= daysInMonth;
      const hasAssignment = !!assignments[iso];
      const isToday = date.isSame(today, 'day');
      const service = hasAssignment ? services.find((s) => s.id === assignments[iso]) : null;
      week.push({ date, iso, isCurrentMonth, hasAssignment, isToday, service });
    }
    weeks.push(week);
  }

  const prevMonth = () => setCurrentMonth(currentMonth.subtract(1, 'month'));
  const nextMonth = () => setCurrentMonth(currentMonth.add(1, 'month'));

  // month title will be derived directly in render for robustness

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={prevMonth}>
          <Text style={styles.navButton}>{'‹'}</Text>
        </TouchableOpacity>
  <Text style={styles.monthTitle}>{currentMonth.format('MMMM YYYY')}</Text>
        <TouchableOpacity onPress={nextMonth}>
          <Text style={styles.navButton}>{'›'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weekRow}>
        {['Mo','Di','Mi','Do','Fr','Sa','So'].map((d, i) => (
          <Text key={i} style={[styles.weekDay, { color: weekdayColor }]}>{d}</Text>
        ))}
      </View>

      {weeks.map((week, wi) => (
        <View key={wi} style={styles.weekRow}>
          {week.map(({ date, isCurrentMonth, hasAssignment, isToday, service }, di) => (
            <TouchableOpacity
              key={di}
              style={[
                styles.dayCell,
                !isCurrentMonth && styles.otherMonth,
                hasAssignment && { backgroundColor: service?.color || '#AEDFF7' },
                isToday && { borderWidth: 2, borderColor: todayBorderColor, borderRadius: 50 },
              ]}
              onPress={() => isCurrentMonth && onDayPress(date)}
            >
              <Text
                style={[
                  styles.dayText,
                  { color: dayTextColor },
                  isToday && { color: todayTextColor },
                ]}
              >
                {date.date()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 10 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
    paddingHorizontal: 20,
  },
  monthTitle: { fontSize: 18, fontWeight: 'bold', textTransform: 'capitalize' },
  navButton: { fontSize: 22, color: '#333', paddingHorizontal: 10 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-around' },
  weekDay: { flex: 1, textAlign: 'center', fontWeight: 'bold', color: '#777' },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 1,
    borderRadius: 8,
  },
  otherMonth: { opacity: 0.3 },
  today: {
    borderWidth: 2,
    borderColor: '#3498db',
    borderRadius: 50,
  },
  dayText: { fontSize: 16 },
  todayText: { color: '#3498db', fontWeight: 'bold' },
});
