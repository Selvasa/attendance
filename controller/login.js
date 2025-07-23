const express = require('express');
const route = express.Router();
const Register = require("../model/createEmpModel");
const generateToken = require("../middleware/token");
const verifyToken = require('../middleware/verify');
const { Query } = require('mongoose');

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
    const empDetails = await Register.find();
    console.log(empDetails)
    if (empDetails) {
        return res.status(200).json({ data: empDetails })
    }
    else {
        return res.status(401).json({ message: 'User not found' });
    }
})

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
  const { id, checkin } = req.body;

  try {
    const employee = await Register.findById(id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const today = getCurrentDate();

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
  const { id, checkout } = req.body;

  try {
    const employee = await Register.findById(id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const today = getCurrentDate();
    const log = employee.timelog.find(entry => entry.date === today);

    if (!log || !log.checkin) {
      return res.status(400).json({ message: 'Not checked in today' });
    }

    const [day, month, year] = today.split('/');
    const isoDate = `${year}-${month}-${day}`;
    const checkinTime = new Date(`${isoDate}T${log.checkin}`);
    const checkoutTime = new Date(`${isoDate}T${checkout}`);

    const diffMs = checkoutTime - checkinTime;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    log.checkout = checkout;
    log.totalhours = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
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