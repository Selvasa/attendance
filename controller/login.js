const express = require('express');
const route = express.Router();
const Loging = require("../model/createEmpModel");
const Checking = require("../model/checkin.model");
const generateToken = require("../middleware/token");
const verifyToken = require('../middleware/verify');

route.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const [login] = await Loging.find({ username, password });
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
    const login = await Loging.find();
    console.log(login)
    if (login) {
        return res.status(200).json({ data: login })
    }
    else {
        return res.status(401).json({ message: 'User not fount' });
    }
})

route.get("/allcheckin", async (req, res) => {
    try {
        const Checkin = await Checking.find();
        res.status(200).json({ data: Checkin })
    }
    catch (err) {
        console.log("get Checkin Failed:", err.message);
        res.status(500).json({ msg: "get Checkin Failed", error: err.message });
    }
})

route.post("/checkin", verifyToken, async (req, res) => {
    const { id, employeeName, status, checkin, checkout, totalhours } = req.body;
    try {
        const Checkin = await new Checking({ employeeName, status, checkin, checkout, totalhours }).save();
        const login = await Loging.findByIdAndUpdate(id, { status });
        res.status(200).json({ msg: "Check in Successfully", data: Checkin })
    }
    catch (err) {
        console.log("Check in Failed:", err.message);
        res.status(500).json({ msg: "Check in Failed", error: err.message });
    }

})
route.post("/checkin/:id", verifyToken, async (req, res) => {
     const { id: ids } = req.params
    try {
        const Checkin = await  Checking.findById(ids);
        res.status(200).json({ msg: "Check in Successfully", data: Checkin })
    }
    catch (err) {
        console.log("get Check in Failed:", err.message);
        res.status(500).json({ msg: "get Check in Failed", error: err.message });
    }

})

route.put("/checkout/:id", verifyToken, async (req, res) => {
    const { id: ids } = req.params
    const { id, employeeName, status, checkin, checkout, totalhours } = req.body;
    try {
        const Checkin = await Checking.findByIdAndUpdate(ids, { employeeName, status, checkin, checkout, totalhours });
        const login = await Loging.findByIdAndUpdate(id, { status });
        res.status(200).json({ msg: "Check out Successfully" })
    }
    catch (err) {
        res.status(500).json({ msg: "Check out Failed", error: err.message });
    }

})

route.get("/view/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const user = await Loging.findById(id);
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
    const { employeeName, employeeEmail, joiningDate, role, username, password, status } = req.body;
    try {
        const user = await Loging.findByIdAndUpdate(id, { employeeName, employeeEmail, joiningDate, role, username, password, status: false });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(201).json({ message: "Updated successfully", data: user });
    } catch (err) {
        console.error("Error fetching user:", err);
        res.status(500).json({ error: "Server error" });
    }
})

route.delete("/delete/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const user = await Loging.findByIdAndDelete(id);
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