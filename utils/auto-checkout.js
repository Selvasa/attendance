const Register = require('../model/createEmpModel'); // adjust path if needed
const { workingHours } = require('./timeUtils');

// 12 hours in milliseconds
// const TWELVE_HOURS = 10 * 60 * 1000;

const autoCheckout = async () => {
  const TWELVE_HOURS = 10 * 60 * 60 * 1000;
  try {
    const allUsers = await Register.find();

    allUsers.forEach(user => {
      const todayLog = user.timelog?.find(log => {
        const [day, month, year] = log.date.split('/');
        const logDate = new Date(`${year}-${month}-${day}`);
        const today = new Date();
        return logDate.toDateString() === today.toDateString();
      });

      if (todayLog && todayLog.checkin && !todayLog.checkout) {
        const checkinTime = new Date(todayLog.checkin);
        const now = new Date();

        if (now - checkinTime >= TWELVE_HOURS) {
          // Auto checkout
          
          // Calculate total hours
          //const diffMs = now - checkinTime;
          //const totalHours = (diffMs / (1000 * 60 * 60)).toFixed(2); // in hours
          user.status = false;
          todayLog.checkout = now.toISOString();
          todayLog.totalhours = workingHours(checkinTime);

          // Save user
          user.markModified('timelog');
          user.save();
          console.log(`Auto checked-out ${user.username}`);
        }
      }
    });
  } catch (error) {
    console.error('Error during auto-checkout:', error.message);
  }
};

module.exports = autoCheckout;
