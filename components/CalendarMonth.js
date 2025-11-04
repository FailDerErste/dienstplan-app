import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import dayjs from 'dayjs';
import 'dayjs/locale/de';
dayjs.locale('de');

export default function CalendarMonth({ assignments = {}, services = [], onDayPress, calendarTheme }) {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const today = dayjs();

  const ct = calendarTheme || {};
  const weekdayColor = ct.weekdayColor || '#777';
  const todayBorderColor = ct.todayBorderColor || '#3498db';
  const todayTextColor = ct.todayTextColor || '#3498db';
  const dayTextColor = ct.textColor || '#000';
  const monthColor = ct.monthColor || ct.textColor || '#000';
  const navColor = ct.navColor || monthColor;
  const assignedBg = ct.assignedBg || '#AEDFF7';

  const startOfMonth = currentMonth.startOf('month');
  const endOfMonth = currentMonth.endOf('month');
  const daysInMonth = endOfMonth.date();
  const firstDayOfWeek = (startOfMonth.day() + 6) % 7; // Monday first
  const weeks = [];

  // build weeks - day is relative index (can be <=0 or > daysInMonth)
  let day = 1 - firstDayOfWeek;
  while (day <= daysInMonth) {
    const week = [];
    for (let i = 0; i < 7; i++, day++) {
      const date = currentMonth.date(day);
      const iso = date.format('YYYY-MM-DD');
      const isCurrentMonth = day > 0 && day <= daysInMonth;
      const hasAssignment = !!assignments[iso];
      const isToday = date.isSame(today, 'day');
      const service = hasAssignment ? services.find((s) => s.id === assignments[iso]) || null : null;
      week.push({ date, iso, isCurrentMonth, hasAssignment, isToday, service });
    }
    weeks.push(week);
  }

  const prevMonth = () => setCurrentMonth((m) => m.subtract(1, 'month'));
  const nextMonth = () => setCurrentMonth((m) => m.add(1, 'month'));

  return (
    <View style={styles.outerContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={prevMonth} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[styles.nav, { color: navColor }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: monthColor }]}>{currentMonth.format('MMMM YYYY')}</Text>
        <TouchableOpacity onPress={nextMonth} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[styles.nav, { color: navColor }]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Weekday headings (each exactly 1/7 width) */}
      <View style={styles.weekRow}>
        {['Mo','Di','Mi','Do','Fr','Sa','So'].map((d, i) => (
          <View key={i} style={styles.cell}>
            <Text style={[styles.weekdayText, { color: weekdayColor }]}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Weeks */}
      <View style={styles.weeks}>
        {weeks.map((week, wi) => (
          <View key={wi} style={styles.weekRow}>
            {week.map(({ date, isCurrentMonth, hasAssignment, isToday, service }, di) => {
              const bg = hasAssignment ? (service?.color || assignedBg) : 'transparent';

              // only dim cells that are not in current month and not today
              const dimOtherMonth = !isCurrentMonth && !isToday;

              const cellStyle = [
                styles.cell,
                { backgroundColor: bg },
                dimOtherMonth && styles.otherMonth,
                isToday && styles.todayBorder,
              ];

              const textStyle = [
                styles.dayText,
                { color: isToday ? todayTextColor : dayTextColor },
                dimOtherMonth && { opacity: 0.45 },
                isToday && { fontWeight: '700' },
              ];

              return (
                <TouchableOpacity
                  key={di}
                  style={cellStyle}
                  activeOpacity={isCurrentMonth ? 0.7 : 1}
                  onPress={() => isCurrentMonth && onDayPress && onDayPress(date)}
                >
                  <Text style={textStyle}>{date.date()}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    // keep minimal horizontal padding so cells can use exact percent widths
    paddingHorizontal: 10,
    marginVertical: 8,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 25,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingHorizontal: 10,
  },
  nav: { fontSize: 22, paddingHorizontal: 50 },
  title: { fontSize: 20, fontWeight: '700', textTransform: 'capitalize' },

  weekRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },

  // Each cell receives an exact percentage width = 100 / 7
  cell: {
    width: '14.2857%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    margin: 1,
  },

  weekdayText: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },

  dayText: {
    fontSize: 16,
    textAlign: 'center',
  },

  otherMonth: {
    // slightly dim other-month days (but not the today cell)
    opacity: 0.45,
  },

  todayBorder: {
    borderWidth: 2,
    borderColor: '#3498db',
    borderRadius: 999, // pill / circular look
    paddingHorizontal: 6, // ensure circle has space
  },

  weeks: {
    marginTop: 1,
  },
});
