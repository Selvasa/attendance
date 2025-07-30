const Register = require("../model/createEmpModel");
const { getCurrentDate, getCurrentTime, workingHours } = require("../utils/timeUtils");

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const allUsers = await Register.find();

    for (const employee of allUsers) {
      const today = getCurrentDate();
      const log = employee.timelog.find(entry => entry.date === today);

      if (!log || !log.checkin || log.checkout) continue;

      const checkinTime = new Date(log.checkin);
      const checkoutTime = new Date();
      const diffMins = (checkoutTime - checkinTime) / (1000 * 60);

      if (diffMins >= 30) {
        log.checkout = getCurrentTime().toISOString();
        log.totalhours = workingHours(log.checkin);
        log.autocheckout = true;
        employee.status = false;
        await employee.save();
      }
    }

    res.status(200).json({ message: 'Auto checkout completed' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = handler;
