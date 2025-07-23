const express = require('express');
const router = express.Router();
const Register = require('../model/createEmpModel');


router.post("/register", async (req, res) => {
    try {
        const employeeData = {
            ...req.body,
            status: false
        };
        const createEmp = await new Register(employeeData).save();
        res.status(201).json({ msg: "Employee Created Successfully" })
    }
    catch (err) {
        console.log("Registration Failed");
        res.status(500).json({ msg: "Registration Failed" })
    }
})
module.exports = router;