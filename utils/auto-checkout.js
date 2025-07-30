const Register = require('../model/createEmpModel'); // adjust path if needed
const { workingHours } = require('./timeUtils');

const TEN_HOURS = 3 * 60 * 60 * 1000; // 10 hours
// const TEN_HOURS = 2 * 60 * 1000; // 10 hours

const autoCheckout = async () => {
  try {
    const allUsers = await Register.find();

    for (const user of allUsers) {
      if (!Array.isArray(user.timelog)) continue;

      const todayLog = user.timelog.find(log => {
        const [day, month, year] = log.date.split('/');
        const logDate = new Date(`${year}-${month}-${day}`);
        const today = new Date();
        return logDate.toDateString() === today.toDateString();
      });

      if (todayLog && todayLog.checkin && !todayLog.checkout) {
        const checkinTime = new Date(todayLog.checkin);
        const now = new Date();

        if (now - checkinTime >= TEN_HOURS) {
          user.status = false;
          todayLog.checkout = now.toISOString();
          todayLog.totalhours = workingHours(checkinTime);

          user.markModified('timelog');
          await user.save(); // important: await save

          console.log(`Auto checked-out ${user.username}`);
        }
      }
    }
  } catch (error) {
    console.error('Error during auto-checkout:', error.message);
  }
};

module.exports = autoCheckout;
