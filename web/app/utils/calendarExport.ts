/**
 * Utilidades para exportación de eventos de calendario (.ics y Google Calendar)
 * y generación de pases digitales para comensales en Bukea (inspirado en OpenResto).
 */

export interface CalendarEventData {
  title: string;
  description: string;
  location: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm o ISO
  durationMinutes?: number;
  bookingCode: string;
  pax: number;
}

export function generateGoogleCalendarUrl(event: CalendarEventData): string {
  try {
    // Calcular fechas ISO en UTC o formato simple YYYYMMDDTHHmmSS
    const [year, month, day] = event.startDate.split('-').map(Number);
    let hours = 20;
    let minutes = 0;

    if (event.startTime) {
      const match = event.startTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (match) {
        hours = Number(match[1]);
        minutes = Number(match[2]);
        if (match[3] && match[3].toUpperCase() === 'PM' && hours < 12) hours += 12;
        if (match[3] && match[3].toUpperCase() === 'AM' && hours === 12) hours = 0;
      }
    }

    const startObj = new Date(year, month - 1, day, hours, minutes);
    const endObj = new Date(startObj.getTime() + (event.durationMinutes || 90) * 60 * 1000);

    const pad = (n: number) => n.toString().padStart(2, '0');
    const formatGDate = (d: Date) =>
      `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;

    const dates = `${formatGDate(startObj)}/${formatGDate(endObj)}`;
    const details = `${event.description}\n\nCódigo de Reserva: ${event.bookingCode}\nComensales: ${event.pax} personas\nLugar: ${event.location}`;

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event.title
    )}&dates=${dates}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(
      event.location
    )}`;
  } catch (e) {
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event.title
    )}`;
  }
}

export function downloadIcsFile(event: CalendarEventData) {
  try {
    const [year, month, day] = event.startDate.split('-').map(Number);
    let hours = 20;
    let minutes = 0;

    if (event.startTime) {
      const match = event.startTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (match) {
        hours = Number(match[1]);
        minutes = Number(match[2]);
        if (match[3] && match[3].toUpperCase() === 'PM' && hours < 12) hours += 12;
        if (match[3] && match[3].toUpperCase() === 'AM' && hours === 12) hours = 0;
      }
    }

    const startObj = new Date(year, month - 1, day, hours, minutes);
    const endObj = new Date(startObj.getTime() + (event.durationMinutes || 90) * 60 * 1000);

    const pad = (n: number) => n.toString().padStart(2, '0');
    const formatIcsDate = (d: Date) =>
      `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Bukea Hospitality Technologies//ES',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${event.bookingCode}-${Date.now()}@bukea.app`,
      `DTSTAMP:${formatIcsDate(new Date())}Z`,
      `DTSTART:${formatIcsDate(startObj)}`,
      `DTEND:${formatIcsDate(endObj)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description.replace(/\n/g, '\\n')} - Código: ${event.bookingCode}`,
      `LOCATION:${event.location.replace(/,/g, '\\,')}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-PT2H',
      'ACTION:DISPLAY',
      `DESCRIPTION:Recordatorio Bukea: Tu reserva en ${event.title} es en 2 horas`,
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reserva-${event.bookingCode.toLowerCase()}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Error generating .ics calendar file:', err);
  }
}
