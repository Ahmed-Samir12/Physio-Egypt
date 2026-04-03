/**
 * Build a "today" date range — midnight to midnight local time.
 */

export const todayRange = () => {
  const now = new Date();
  // Egypt is UTC+2 (UTC+3 during summer). Use a proper offset or a library.
  const offset = 2 * 60 * 60 * 1000; // UTC+2
  const localNow = new Date(now.getTime() + offset);
  const startUTC = new Date(localNow);
  startUTC.setUTCHours(0, 0, 0, 0);
  startUTC.setTime(startUTC.getTime() - offset);
  const endUTC = new Date(startUTC.getTime() + 24 * 60 * 60 * 1000 - 1);
  return { start: startUTC, end: endUTC };
};

// Escapes special regex characters in user input so MongoDB $regex
// treats the string as literal text instead of a regex pattern.
export const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
