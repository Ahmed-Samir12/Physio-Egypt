import { startOfDay, endOfDay } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

/**
 * Build a "today" date range — midnight to midnight local time.
 */

export const todayRange = (timeZone = 'Africa/Cairo') => {
  const nowInEgypt = toZonedTime(new Date(), timeZone);
  return {
    start: fromZonedTime(startOfDay(nowInEgypt), timeZone),
    end: fromZonedTime(endOfDay(nowInEgypt), timeZone),
  };
};

// Escapes special regex characters in user input so MongoDB $regex
// treats the string as literal text instead of a regex pattern.
export const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
