export default function formatDateForApI(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  const timezoneOffset = -date.getTimezoneOffset();
  const timezoneSign = timezoneOffset >= 0 ? '+' : '-';
  const timezoneHours = String(Math.abs(timezoneOffset) / 60).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} ${timezoneSign}${timezoneHours}:00`;
}
