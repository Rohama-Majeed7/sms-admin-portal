/**
 * Utility functions for Timetable time calculation and conversions.
 * Backend stores time as minutes since midnight (0 = 00:00, 540 = 09:00, 720 = 12:00, 1439 = 23:59)
 */

/**
 * Convert standard "HH:mm" (24h), "HH:mm AM/PM" (12h), or numeric minutes to integer minutes from midnight.
 */
export function timeStringToMinutes(timeStr: string | number | undefined | null): number {
  if (typeof timeStr === "number") {
    return isNaN(timeStr) ? 0 : timeStr;
  }
  if (!timeStr || typeof timeStr !== "string") return 0;
  const clean = timeStr.trim();

  // Check 12-hour format with AM/PM (e.g., "09:30 AM", "1:15 pm", "09:00 AM")
  const ampmMatch = clean.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const minutes = parseInt(ampmMatch[2], 10);
    const meridiem = ampmMatch[3]?.toUpperCase();

    if (meridiem === "PM" && hours < 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;

    return hours * 60 + minutes;
  }

  // Fallback "HH:mm"
  const parts = clean.split(":");
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
}

/**
 * Convert integer minutes or time string to 24-hour "HH:mm" string for HTML <input type="time" />.
 */
export function minutesToTimeString(minutes: number | string | undefined | null): string {
  if (typeof minutes === "string") {
    minutes = timeStringToMinutes(minutes);
  }
  if (typeof minutes !== "number" || isNaN(minutes)) return "08:00";
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Format integer minutes since midnight to 12-hour display string with AM/PM (e.g. 540 -> "09:00 AM").
 */
export function formatMinutesTo12Hour(minutes: number | string | undefined | null): string {
  if (typeof minutes === "string") {
    minutes = timeStringToMinutes(minutes);
  }
  if (typeof minutes !== "number" || isNaN(minutes)) return "--:--";
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  const period = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${String(displayH).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
}

/**
 * Format any time string or minutes to 12-hour string with AM/PM (e.g. "09:00" -> "09:00 AM").
 */
export function formatTimeTo12Hour(time: string | number | undefined | null): string {
  return formatMinutesTo12Hour(timeStringToMinutes(time));
}

/**
 * Calculate duration between two minute values (e.g. 540 to 600 -> "1h", 510 to 555 -> "45m").
 */
export function formatDuration(startMinute: number, endMinute: number): string {
  const diff = Math.max(0, endMinute - startMinute);
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h`;
  return `${mins}m`;
}

/**
 * Check if two time ranges overlap.
 * Note: Back-to-back periods (e.g., 540-600 and 600-660) do NOT overlap.
 */
export function isOverlapping(
  startA: number,
  endA: number,
  startB: number,
  endB: number
): boolean {
  return startA < endB && startB < endA;
}

/**
 * Validate an array of periods for intra-day overlap conflicts.
 * Returns null if no overlaps, or details of the first conflicting pair.
 */
export function findIntraDayOverlap(
  periods: Array<{ startMinute: number; endMinute: number; label?: string }>
): { indexA: number; indexB: number; message: string } | null {
  for (let i = 0; i < periods.length; i++) {
    for (let j = i + 1; j < periods.length; j++) {
      if (
        isOverlapping(
          periods[i].startMinute,
          periods[i].endMinute,
          periods[j].startMinute,
          periods[j].endMinute
        )
      ) {
        return {
          indexA: i,
          indexB: j,
          message: `Period ${i + 1} (${formatMinutesTo12Hour(periods[i].startMinute)} - ${formatMinutesTo12Hour(periods[i].endMinute)}) overlaps with Period ${j + 1} (${formatMinutesTo12Hour(periods[j].startMinute)} - ${formatMinutesTo12Hour(periods[j].endMinute)}).`,
        };
      }
    }
  }
  return null;
}
