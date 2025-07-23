const express = require('express');
const route = express.Router();
const Register = require("../model/createEmpModel");
const generateToken = require("../middleware/token");
const verifyToken = require('../middleware/verify');
const { Query } = require('mongoose');

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
    const login = await Register.find();
    console.log(login)
    if (login) {
        return res.status(200).json({ data: login })
    }
    else {
        return res.status(401).json({ message: 'User not fount' });
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

        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const currentDate = `${day}/${month}/${year}`;

        const alreadyCheckedIn = employee.timelog.find(log => log.date === currentDate);
        if (alreadyCheckedIn) {
            return res.status(400).json({ message: 'Employee Already checked in for this date' });
        }
        employee.status = true;
        employee.timelog.push({
            date: currentDate,
            checkin: checkin,
            checkout: '',
            totalhours: ''
        });

        await employee.save();

        res.status(200).json({ message: 'Check-in successful', timelog: employee.timelog });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }

})

route.post('/checkout', verifyToken, async (req, res) => {
    const { id, checkout } = req.body;

    try {
        const employee = await Register.findById(id);

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const now = new Date();
        const days = String(now.getDate()).padStart(2, '0');
        const months = String(now.getMonth() + 1).padStart(2, '0');
        const years = now.getFullYear();
        const currentDate = `${days}/${months}/${years}`;

        const log = employee.timelog.find(entry => entry.date === currentDate);
        console.log(currentDate)

        const [day, month, year] = currentDate.split('/');
        const isoDate = `${year}-${month}-${day}`;
        const checkinTime = new Date(`${isoDate}T${log.checkin}`);
        const checkoutTime = new Date(`${isoDate}T${checkout}`);
        const diffMs = checkoutTime - checkinTime;

        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        console.log(hours, minutes)

        const totalhours = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        employee.status = false;
        log.checkout = checkout;
        log.totalhours = totalhours;

        await employee.save();

        res.status(200).json({ message: 'Checkout successful', timelog: employee.timelog });
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
        res.status(200).json(user);
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