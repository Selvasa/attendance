function getCurrentDate() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${day}/${month}/${year}`;
}

function filterTodayLogs(timelog = []) {
  const today = getCurrentDate();
  return timelog.filter(log => log.date === today);
}

function calculateDuration(checkin, checkout) {
  const start = new Date(checkin);
  const end = new Date(checkout);
  const diffMs = end - start;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
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
  updateTimeLog
};
