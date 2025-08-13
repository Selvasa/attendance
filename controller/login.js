const express = require('express');
const route = express.Router();
const Register = require("../model/createEmpModel");
const generateToken = require("../middleware/token");
const verifyToken = require('../middleware/verify');
const {
  getCurrentDate,
  filterTodayLogs,
  workingHours,
  getCurrentTime
} = require('../utils/timeUtils');


route.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const [login] = await Register.find({ username, password });
  console.log(login)
  if (login) {
    const token = generateToken(login);
    return res.json({ token: token, message: 'Login Success fully ', data: login })
  }
  else {
    return res.status(401).json({ message: 'Password Incorrect' });
  }
})

route.get("/allemp", async (req, res) => {
  try {
    const today = getCurrentDate();
    const empDetails = await Register.aggregate([
      {
        $addFields: {
          timelog: {
            $filter: {
              input: "$timelog",
              as: "log",
              cond: { $eq: ["$$log.date", today] }
            }
          }
        }
      }
    ]);

    return res.status(200).json({ data: empDetails });
  } catch (error) {
    console.error('Error fetching employee details:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

route.get("/allcheckin/:id", verifyToken, async (req, res) => {
  const { id } = req.params
  try {
    const Checkin = await Register.findById(id);
    res.status(200).json({ data: Checkin.timelog })
  }
  catch (err) {
    console.log("get Checkin Failed:", err.message);
    res.status(500).json({ msg: "get Checkin Failed", error: err.message });
  }
})

route.post("/checkin", verifyToken, async (req, res) => {
  const { id } = req.body;

  try {
    const employee = await Register.findById(id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    const today = getCurrentDate();
    const checkin = getCurrentTime().toISOString();

    // Check if already checked in today
    const alreadyCheckedIn = employee.timelog.find(log => log.date === today);
    if (alreadyCheckedIn) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    employee.status = true;
    employee.timelog.push({
      date: today,
      checkin: checkin,
      checkout: '',
      workinghours: "",
      totalhours: ''
    });

    await employee.save();

    res.status(200).json({ message: 'Check-in successful', timelog: filterTodayLogs(employee.timelog) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


route.post('/checkout', verifyToken, async (req, res) => {
  const { id } = req.body;

  try {
    const employee = await Register.findById(id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    const today = getCurrentDate();
    const checkout = getCurrentTime().toISOString();
    const log = employee.timelog.find(entry => entry.date === today);

    if (!log || !log.checkin) {
      return res.status(400).json({ message: 'Not checked in today' });
    }

    const checkinTime = new Date(log.checkin);
    const checkoutTime = new Date();
    const diffMins = (checkoutTime - checkinTime) / (1000 * 60);
    console.log("diffMins", diffMins)
    if (diffMins < 30) {
      return res.status(403).json({ message: 'Cannot checkout before 30 minutes of check-in' });
    }

    log.checkout = checkout;
    log.totalhours = workingHours(log.checkin);
    log.autocheckout = false;
    employee.status = false;

    await employee.save();

    res.status(200).json({ message: 'Checkout successful', timelog: filterTodayLogs(employee.timelog) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

route.get("/view/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const today = getCurrentDate();
    const hoursCalculation = await Register.findById(id);

    if (!hoursCalculation) {
      console.error("User not found");
      return;
    }

    hoursCalculation?.status && hoursCalculation?.timelog?.map((item) => {
      if (item.date === today && item.checkin) {
        const workinghour = workingHours(item.checkin);
        item.totalhours = workinghour
      }
    })
    await hoursCalculation.save();

    const user = await Register.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const filtered = {
      ...user.toObject(),
      timelog: filterTodayLogs(user.timelog)
    };
    res.status(200).json(filtered);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Server error" });
  }
});

route.post("/filterby", async (req, res) => {
  const { id, month, year } = req.body;
  try {
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);
    console.log(monthNum, yearNum)
    const user = await Register.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const filtered = user.timelog.filter(log => {
      const [day, m, y] = log.date.split("/").map(Number); // date format "dd/mm/yyyy"
      return m === monthNum && y === yearNum;
    });
    res.status(200).json({data:filtered});
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Server error" });
  }
})

route.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await Register.findByIdAndUpdate(id, req.body);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(201).json({ message: "Updated successfully" });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Server error" });
  }
})

route.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await Register.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(201).json({ message: "deleted successfully", data: user });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Server error" });
  }
})
module.exports = route;