export const formatTime = (timeInput, is24h = true) => {
  if (!timeInput) return '';

  const input = String(timeInput).trim();

  // Support Date objects directly
  if (timeInput instanceof Date) {
    let h = timeInput.getHours();
    const m = timeInput.getMinutes().toString().padStart(2, '0');
    if (is24h) {
      return `${String(h).padStart(2, '0')}:${m}`;
    } else {
      const period = h >= 12 ? 'PM' : 'AM';
      const hour12 = h % 12;
      const hour12Final = hour12 === 0 ? 12 : hour12;
      return `${hour12Final}:${m} ${period}`;
    }
  }

  // Handle 12h format inputs (e.g., "09:00 AM", "10:30 PM")
  const amPmMatch = input.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (amPmMatch) {
    let [, hourStr, minuteStr, period] = amPmMatch;
    let hour = parseInt(hourStr, 10);
    const minute = minuteStr;

    // Convert 12h to 24h
    if (period.toUpperCase() === 'PM' && hour !== 12) {
      hour += 12;
    } else if (period.toUpperCase() === 'AM' && hour === 12) {
      hour = 0;
    }

    if (is24h) {
      return `${String(hour).padStart(2, '0')}:${minute}`;
    } else {
      const displayPeriod = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12;
      const displayHourFinal = displayHour === 0 ? 12 : displayHour;
      return `${displayHourFinal}:${minute} ${displayPeriod}`;
    }
  }

  // Handle 24h format inputs (e.g., "09:00", "14:30")
  const timeMatch = input.match(/^(\d{1,2}):(\d{2})$/);
  if (timeMatch) {
    let [, hourStr, minuteStr] = timeMatch;
    let hour = parseInt(hourStr, 10);
    const minute = minuteStr;

    if (is24h) {
      return `${String(hour).padStart(2, '0')}:${minute}`;
    } else {
      const period = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12;
      const hour12Final = hour12 === 0 ? 12 : hour12;
      return `${hour12Final}:${minute} ${period}`;
    }
  }

  // Fallback: return input unchanged if format not recognized
  return input;
};