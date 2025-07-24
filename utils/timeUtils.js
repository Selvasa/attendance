function getCurrentDate() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${day}/${month}/${year}`;
}

function getCurrentTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function filterTodayLogs(timelog = []) {
  const today = getCurrentDate();
  return timelog.filter(log => log.date === today);
}

function padTime(timeStr) {
  const [hour, minute] = timeStr.split(':');
  return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
}

// Calculate Working hours when the user login

function workingHours(checkin) {
  const [day, month, year] = getCurrentDate().split('/');
  const isoDate = `${year}-${month}-${day}`;

  const normalizedCheckin = padTime(checkin);
  const checkinTime = new Date(`${isoDate}T${normalizedCheckin}`);

  const now = new Date(); // Current time
  const diffMs = now - checkinTime;

  if (diffMs < 0) {
    return "00:00"; // Check-in is in the future — handle as needed
  }

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  const totalhours = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  return totalhours;
}

// Calculate total hours after the user check out
function calculateDuration(checkin, checkout) {

  const [day, month, year] = getCurrentDate().split('/');
  const isoDate = `${year}-${month}-${day}`;

  const normalizedCheckin = padTime(checkin);
  const normalizedCheckout = padTime(checkout);

  const checkinTime = new Date(`${isoDate}T${normalizedCheckin}`);
  const checkoutTime = new Date(`${isoDate}T${normalizedCheckout}`);

  const diffMs = checkoutTime - checkinTime;

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  console.log(hours, minutes)

  const totalhours = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  console.log(totalhours)
  return totalhours;
}

// Automatically checkout users after 12 hours if not checked out
function updateTimeLog(log) {
  if (log.checkout) return log; // Already checked out

  const checkinTime = new Date(log.checkin);
  const now = new Date();
  const twelveHoursLater = new Date(checkinTime.getTime() + 12 * 60 * 60 * 1000);

  if (now >= twelveHoursLater) {
    log.checkout = twelveHoursLater.toISOString();
    log.totalhours = calculateDuration(log.checkin, log.checkout);
    log.autocheckout = true;
  }

  return log;
}

module.exports = {
  getCurrentDate,
  filterTodayLogs,
  calculateDuration,
  updateTimeLog,
  workingHours,
  getCurrentTime
};
