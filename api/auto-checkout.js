import Register from '../model/createEmpModel.js';
import { getCurrentDate, getCurrentTime, workingHours } from '../utils/timeUtils.js';

export async function GET(request) {
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

    return new Response(JSON.stringify({ message: 'Auto checkout completed' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error("Auto-checkout error:", err);
    return new Response(JSON.stringify({ message: 'Server error', error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
