function getCurrentDate() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${day}/${month}/${year}`;
}

function getCurrentTime() {
  const now = new Date();
  return now;
}


// Calculate Working hours when the user login
function workingHours(checkin) {
  const timestamp1 = new Date(checkin);
  const timestamp2 = new Date();

  const diffInMs = timestamp2.getTime() - timestamp1.getTime();
  const totalMinutes = Math.floor(diffInMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`

  return formatted;

}


function filterTodayLogs(timelog = []) {
  const today = getCurrentDate();
  return timelog.filter(log => log.date === today);
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
  updateTimeLog,
  workingHours,
  getCurrentTime
};
