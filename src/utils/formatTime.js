
export function formatTime(time) {
  if (time === null || time === undefined || time === "") {
    return "Not specified";
  }

  const value = String(time).trim();

  // Already formatted with AM/PM
  if (/\b(AM|PM)\b/i.test(value)) {
    return value;
  }

  // Handle HH:mm or HH:mm:ss
  const match = value.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);

  if (!match) {
    return value;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (hours > 23 || minutes > 59) {
    return value;
  }

  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;

  return `${hours12}:${String(minutes).padStart(2, "0")} ${period}`;
}
