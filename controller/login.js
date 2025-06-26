const express = require('express');
const route = express.Router();
const Loging = require("../model/createEmpModel");
const generateToken = require("../middleware/token");
const verifyToken = require('../middleware/verify');

route.post("/login", async (req, res) => {
    const { username, password } = req.body;

    const [login] = await Loging.find({ username, password });
    console.log(login)
    if (login) {
        const token = generateToken(login);
        return res.json({ token: token, message: 'Login Success fully ',data:login })
    }
    else {
        return res.status(401).json({ message: 'Password Incorrect' });
    }
})

route.get("/verify", verifyToken, (req, res) => {

    return res.json({ message: req.user })
})
module.exports = route;